// mcp-server.ts — 最小 JSON-RPC 2.0 stdio 握手（A3 返工：mcp.json 注册面名实相符）
// mcp.json 把 `macro-audit mcp` 注册为 stdio MCP server——此前实物只打印描述符即退，真 host 挂上即死。
// 本模块实现 MCP over stdio（NDJSON 行帧）最小闭环：initialize / initialized / ping / tools/list / tools/call。
// 面收窄不变：暴露 tools=facts / quarantine / file_card 三件套只读投影（D-053④/#78/#80 步②），clone/写操作不经 MCP 可达。

// #64/D-072⑧：MCP stdio 面 stdout 属 JSON-RPC 行帧——自愈结构化事件改落 stderr 避让协议通道
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
  description: 'read-only quarantine_log projection（#78/D-113②）：字段级病态处置事件台账——固定列集（run_id/commit_sha/field_name/disposition/reason_code/raw_bytes_hex/is_trunc/original_length/sha256_full/collector/recorded_at），READ_ONLY 实例，limit≤500。recorded_at=NULL=锚病态→观测时点不可得（D-108④ NULL 语义显式文案：非「开放式」缺省，range 谓词不吞 NULL）。db 寻址同 facts 链',
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

// #80 步②（D-122/D-126/ADR-0023）：file_card=Micro-B 文件级审计卡只读投影——MCP 面永不写：
//   miss→显式态＋cli_guidance 指向 CLI audit file 补采（lazy 补采唯一入口在 CLI）。
const FILE_CARD_TOOL = {
  name: 'file_card',
  description: 'read-only Micro-B 文件级审计卡投影（#80 步②/D-123/D-126/ADR-0023）：三层卡契约（kernel facet_rows 逐字段直投带 fact_ref 锚＋derived 确定性派生 hotspot_priority_v1＋narrative 键存在性校验）＋advisory:true 结构性隔离（无 verdict/gate-consumable 字段）＋miss 四类显式态（never_collected 附 CLI 补采指引／not_tracked_at_sha／not_applicable／renamed_to 条件跳转+revalidated）＋at:<sha> pin＋staleness 双字段（observed/current head）',
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

// db 寻址收敛（#55 / D-059⑥）：宿主 agent 无法预知 facts.duckdb 绝对路径——
// 解析序：arguments.db（调用方显式）→ server --db argv（mcp.json 注册面配置）→ MACRO_AUDIT_FACTS_DB env → MCP-FACTS-DB-UNRESOLVED。
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

// 单条 JSON-RPC 消息处理；notification（无 id）返回 null=不应答。
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
        return fail(id, -32602, 'MCP-FACTS-DB-UNRESOLVED: facts db 寻址失败——arguments.db 未给且服务端无 --db argv/MACRO_AUDIT_FACTS_DB env 配置');
      }
      const repo = asStr(a.repo);
      const path = asStr(a.path);
      if (!repo || !path) {
        return fail(id, -32602, 'file_card requires repo + path');
      }
      // staleness 当前锚=可选只读探针（repo_path 给才探；不给→drift=unknown 照答不拒答，D-126）
      let currentHead: string | null = null;
      const rp = asStr(a.repo_path);
      if (rp) {
        try {
          const out = execFileSync('git', ['-C', rp, 'rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 15000 }).trim();
          if (/^[0-9a-f]{40}$/i.test(out)) { currentHead = out; }
        } catch { currentHead = null; }
      }
      // F4 返修：repo 名非 repoAdd 可解输入（audit file 实测 PATH-NOT-FOUND）——
      //   指引串 repo 槽位用本地仓路径（repo_path 给则代入实测可跑；缺则占位符明示待填）
      const guidance = 'macro-audit audit file ' + (rp ? '"' + rp + '"' : '<repo-path>') + ' "' + path + '" --db ' + db;
      try {
        // F5（#83）：库文件缺席=零观测集→结构化 never_collected 卡（D-126③ miss 首义形态到达 MCP 面），
        //   非 isError 文本——库在而查询失败才走 MCP-FILECARD-ERROR
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
        return fail(id, -32602, 'MCP-FACTS-DB-UNRESOLVED: facts db 寻址失败——arguments.db 未给且服务端无 --db argv/MACRO_AUDIT_FACTS_DB env 配置');
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
      return fail(id, -32602, 'MCP-FACTS-DB-UNRESOLVED: facts db 寻址失败——arguments.db 未给且服务端无 --db argv/MACRO_AUDIT_FACTS_DB env 配置');
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

// NDJSON 行帧服务：stdin 每行一条 JSON-RPC 消息，应答逐行写 stdout。
// 解析失败行回 -32700；notification 不应答；流结束即退。
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
  // 流结束后仍可能在途 tools/call——应答写完才算服务收敛
  await Promise.all(pending);
}
