// mcp-server.ts — 最小 JSON-RPC 2.0 stdio 握手（A3 返工：mcp.json 注册面名实相符）
// mcp.json 把 `macro-audit mcp` 注册为 stdio MCP server——此前实物只打印描述符即退，真 host 挂上即死。
// 本模块实现 MCP over stdio（NDJSON 行帧）最小闭环：initialize / initialized / ping / tools/list / tools/call。
// 面收窄不变：唯一暴露 tool=facts（D-053④ read-only DuckDB 投影），clone/写操作不经 MCP 可达。

import { projectFacts } from './fact/projection.js';
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
    return ok(id, { tools: [FACTS_TOOL] });
  }
  if (method === 'tools/call') {
    const p = msg.params || {};
    if (p.name !== 'facts') {
      return fail(id, -32602, 'unknown tool: ' + String(p.name));
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
