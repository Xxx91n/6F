// mcp-server.ts —— 最小的 JSON-RPC 2.0 stdio 握手（A3 返工：跟 mcp.json 里注册的名实对上）
// mcp.json 把 `macro-audit mcp` 注册成 stdio 的 MCP 服务——以前实物就打个描述符就退，真 host 一挂上就死。
// 这个模块把 MCP over stdio（NDJSON 一行一帧）这一圈做全：initialize / initialized / ping / tools/list / tools/call。
// 只给只读查询：开 tools=facts / quarantine / file_card 三个只读工具，写操作和克隆一概不给。

// #64/D-072⑧：MCP stdio 那头的 stdout 是 JSON-RPC 的帧——自愈的那堆结构化事件改走 stderr，让开协议通道
process.env.MACRO_AUDIT_MCP_STDIO = '1';

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { projectFacts, projectQuarantine, projectFileCard } from './fact/projection.js';
import { buildFileCard } from './fact/file-card.js';
import { loadManifestMeta } from './manifest.js';

export const MCP_PROTOCOL_VERSION = '2024-11-05';

interface RpcMessage {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: { [k: string]: unknown };
}

interface RpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
}

const QUARANTINE_TOOL = {
  name: 'quarantine',
  description: '只读隔离日志查询（quarantine_log）：查询字段级异常数据的处置记录，以固定字段列表展示，只读模式，单次最多返回 500 条。若 recorded_at 为空说明对应时间点不可用。数据库定位逻辑与 facts 相同。',
  inputSchema: {
    type: 'object',
    properties: {
      db: { type: 'string', description: 'facts.duckdb 绝对路径（可省——省则走服务端寻址链）' },
      run: { type: 'string', description: 'run_id（trace_id hex32）过滤' },
      field: { type: 'string', description: 'field_name 过滤（如 committer_date / head_date）' },
      limit: { type: 'number', description: '行数上限（≤500）' }
    },
    additionalProperties: false
  }
};

// 单文件审计卡只读查询——MCP 服务端只看不写：
// 没采过就把话说明白，并告诉你在命令行上怎么补（补采只能在命令行做）。
const FILE_CARD_TOOL = {
  name: 'file_card',
  description: '只读 Micro-B 单文件审计卡查询：包含代码质量维度字段、改动热点优先级以及说明文本，仅供参考（不直接作为门禁裁定字段）。未采集时会返回对应状态及补采命令行指引。支持指定具体 commit SHA 以及比对最新 HEAD。',
  inputSchema: {
    type: 'object',
    required: ['repo', 'path'],
    properties: {
      db: { type: 'string', description: 'facts.duckdb 绝对路径（可省——省则走服务端寻址链）' },
      repo: { type: 'string', description: 'repo 名（repo_ref 的 @ 前缀部）' },
      path: { type: 'string', description: '文件路径（仓根相对；读侧过 subject 归一器）' },
      at: { type: 'string', description: 'at:<sha> pin——观测集 head_sha 精确或 ≥7 字符唯一前缀（常量纪律）' },
      repo_path: { type: 'string', description: '可选：本地仓路径——给则只读 git rev-parse HEAD 探 staleness 当前锚' }
    },
    additionalProperties: false
  }
};

const FACTS_TOOL = {
  name: 'facts',
  description: 'read-only DuckDB facts projection (D-053④)：固定 SELECT 形，FactEvent 十三列，READ_ONLY 实例，limit≤500。db 寻址收敛服务端解析（#55/D-059⑥）：arguments.db → server --db argv → MACRO_AUDIT_FACTS_DB env',
  inputSchema: {
    type: 'object',
    properties: {
      db: { type: 'string', description: 'facts.duckdb 绝对路径（可省——省则走服务端寻址链）' },
      scale: { type: 'string', enum: ['macro', 'micro'] },
      repo: { type: 'string', description: 'owner/repo 过滤' },
      subject: { type: 'string', description: 'subject_ref 过滤' },
      limit: { type: 'number', description: '行数上限（≤500）' }
    },
    additionalProperties: false
  }
};

// db 怎么找定下来了（#55 / D-059⑥）：宿主 agent 压根不知道 facts.duckdb 的绝对路径——
// 一路往下找：调用时传的 db → 启动时的 --db 参数 → 环境变量 MACRO_AUDIT_FACTS_DB。
export interface McpServerConfig { db?: string }
let serverConfig: McpServerConfig = {};
export function setMcpServerConfig(c: McpServerConfig): void { serverConfig = c || {}; }
export function resolveFactsDb(argDb: string | undefined): string | undefined {
  const envDb = process.env.MACRO_AUDIT_FACTS_DB;
  return argDb || (serverConfig.db && serverConfig.db.length > 0 ? serverConfig.db : undefined) || (envDb && envDb.length > 0 ? envDb : undefined);
}

function ok(id: string | number | null, result: unknown): RpcResponse {
  return { jsonrpc: '2.0', id: id === undefined ? null : id, result: result };
}

function fail(id: string | number | null, code: number, message: string): RpcResponse {
  return { jsonrpc: '2.0', id: id === undefined ? null : id, error: { code: code, message: message } };
}

function asStr(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

// 处理一条 JSON-RPC 消息；notification（没 id 的）返回 null，不应答。
export async function handleRpcMessage(msg: RpcMessage): Promise<RpcResponse | null> {
  const id = msg.id === undefined ? null : msg.id;
  const isNotification = msg.id === undefined;
  const method = msg.method;
  if (typeof method !== 'string' || method.length === 0) {
    if (isNotification) { return null; }
    return fail(id, -32600, 'invalid request: method missing');
  }
  if (method === 'notifications/initialized' || method.indexOf('notifications/') === 0) {
    return null;
  }
  if (isNotification) { return null; }
  if (method === 'initialize') {
    const m = loadManifestMeta();
    return ok(id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: 'macro-audit', version: m.version }
    });
  }
  if (method === 'ping') {
    return ok(id, {});
  }
  if (method === 'tools/list') {
    return ok(id, { tools: [FACTS_TOOL, QUARANTINE_TOOL, FILE_CARD_TOOL] });
  }
  if (method === 'tools/call') {
    const p = msg.params || {};
    if (p.name !== 'facts' && p.name !== 'quarantine' && p.name !== 'file_card') {
      return fail(id, -32602, 'unknown tool: ' + String(p.name));
    }
    if (p.name === 'file_card') {
      const a = (p.arguments || {}) as { [k: string]: unknown };
      const db = resolveFactsDb(asStr(a.db));
      if (!db) {
        return fail(id, -32602, 'MCP-FACTS-DB-UNRESOLVED: 找不到 facts 数据库——请传入 db 参数，或者配置服务启动参数 --db / 环境变量 MACRO_AUDIT_FACTS_DB');
      }
      const repo = asStr(a.repo);
      const path = asStr(a.path);
      if (!repo || !path) {
        return fail(id, -32602, 'file_card requires repo + path');
      }
      // stale 不 stale 那个锚是个可选只读探针（给了 repo_path 才探；不给就 drift=unknown，照答不拒，D-126）
      let currentHead: string | null = null;
      const rp = asStr(a.repo_path);
      if (rp) {
        try {
          const out = execFileSync('git', ['-C', rp, 'rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 15000 }).trim();
          if (/^[0-9a-f]{40}$/i.test(out)) { currentHead = out; }
        } catch { currentHead = null; }
      }
      // F4 返修：repo 名那种写法 repoAdd 认不出来（audit file 实测 PATH-NOT-FOUND）——
      // 指引串里 repo 那个槽就填本地仓路径（给了 repo_path 就填实测能跑的；没给就留个占位的明说待填）
      const guidance = 'macro-audit audit file ' + (rp ? '"' + rp + '"' : '<repo-path>') + ' "' + path + '" --db ' + db;
      try {
        // F5（#83）：库文件不在＝一组观测都没有→结构化 never_collected 卡（D-126③ 那套「没采过」的说法到 MCP 这头了），
        // 不写成 isError 文本——库在、可查询挂了，才走 MCP-FILECARD-ERROR
        const card = existsSync(db)
          ? await projectFileCard(db, {
            repo: repo,
            subject: path,
            at: asStr(a.at),
            current_head_sha: currentHead,
            source: 'prefetch',
            cli_guidance: guidance
          })
          : buildFileCard({
            subject: path,
            setRepoRef: null,
            setFacts: [],
            availableHeadShas: [],
            pinnedSha: asStr(a.at) || null,
            currentHeadSha: currentHead,
            source: 'prefetch',
            cliGuidance: guidance
          });
        return ok(id, { content: [{ type: 'text', text: JSON.stringify(card) }], isError: false });
      } catch (e) {
        return ok(id, { content: [{ type: 'text', text: 'MCP-FILECARD-ERROR: ' + String(e && (e as Error).message || e) }], isError: true });
      }
    }
    if (p.name === 'quarantine') {
      const a = (p.arguments || {}) as { [k: string]: unknown };
      const db = resolveFactsDb(asStr(a.db));
      if (!db) {
        return fail(id, -32602, 'MCP-FACTS-DB-UNRESOLVED: 找不到 facts 数据库——请传入 db 参数，或者配置服务启动参数 --db / 环境变量 MACRO_AUDIT_FACTS_DB');
      }
      const lim = a.limit === undefined ? undefined : Number(a.limit);
      if (lim !== undefined && (!Number.isFinite(lim) || lim <= 0)) {
        return fail(id, -32602, 'quarantine limit must be a positive number');
      }
      try {
        const rows = await projectQuarantine(db, { run_id: asStr(a.run), field_name: asStr(a.field), limit: lim });
        const text = rows.map(function (r) { return JSON.stringify(r); }).join('\n');
        return ok(id, { content: [{ type: 'text', text: text }], isError: false });
      } catch (e) {
        return ok(id, { content: [{ type: 'text', text: 'MCP-QUAR-ERROR: ' + String(e && (e as Error).message || e) }], isError: true });
      }
    }
    const a = (p.arguments || {}) as { [k: string]: unknown };
    const db = resolveFactsDb(asStr(a.db));
    if (!db) {
      return fail(id, -32602, 'MCP-FACTS-DB-UNRESOLVED: 找不到 facts 数据库——请传入 db 参数，或者配置服务启动参数 --db / 环境变量 MACRO_AUDIT_FACTS_DB');
    }
    const lim = a.limit === undefined ? undefined : Number(a.limit);
    if (lim !== undefined && (!Number.isFinite(lim) || lim <= 0)) {
      return fail(id, -32602, 'facts limit must be a positive number');
    }
    try {
      const rows = await projectFacts(db, {
        scale: asStr(a.scale),
        repo_ref: asStr(a.repo),
        subject_ref: asStr(a.subject),
        limit: lim
      });
      const text = rows.map(function (r) { return JSON.stringify(r); }).join('\n');
      return ok(id, { content: [{ type: 'text', text: text }], isError: false });
    } catch (e) {
      return ok(id, { content: [{ type: 'text', text: 'MCP-FACTS-ERROR: ' + String(e && (e as Error).message || e) }], isError: true });
    }
  }
  return fail(id, -32601, 'method not found: ' + method);
}

// NDJSON 一行一帧的服务：stdin 一行一条 JSON-RPC 消息，应答一行行写回 stdout。
// 解析不了的行走 -32700；notification 不应答；流到头就退。
export async function serveMcpStdio(input: NodeJS.ReadableStream, output: NodeJS.WritableStream): Promise<void> {
  let buf = '';
  const pending: Promise<void>[] = [];
  input.setEncoding('utf8');
  const write = function (r: RpcResponse | null): void {
    if (r !== null) { output.write(JSON.stringify(r) + '\n'); }
  };
  await new Promise<void>(function (resolve) {
    input.on('data', function (chunk: string) {
      buf += chunk;
      let idx = buf.indexOf('\n');
      while (idx >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        idx = buf.indexOf('\n');
        if (line.length === 0) { continue; }
        let msg: RpcMessage;
        try {
          msg = JSON.parse(line) as RpcMessage;
        } catch (e) {
          write(fail(null, -32700, 'parse error: ' + String(e && (e as Error).message || e)));
          continue;
        }
        pending.push(handleRpcMessage(msg).then(write, function (e) {
          write(fail(msg.id === undefined ? null : msg.id, -32603, 'internal error: ' + String(e && (e as Error).message || e)));
        }));
      }
    });
    input.on('end', function () { resolve(); });
    input.on('close', function () { resolve(); });
    input.resume();
  });
  // 流到头了，tools/call 可能还在路上——应答全写完，这服务才算收干净
  await Promise.all(pending);
}
