// mcp-server.ts — 最小 JSON-RPC 2.0 stdio 握手（A3 返工：mcp.json 注册面名实相符）
// mcp.json 把 `macro-audit mcp` 注册为 stdio MCP server——此前实物只打印描述符即退，真 host 挂上即死。
// 本模块实现 MCP over stdio（NDJSON 行帧）最小闭环：initialize / initialized / ping / tools/list / tools/call。
// 面收窄不变：唯一暴露 tool=facts（D-053④ read-only DuckDB 投影），clone/写操作不经 MCP 可达。
// #64/D-072⑧：MCP stdio 面 stdout 属 JSON-RPC 行帧——自愈结构化事件改落 stderr 避让协议通道
process.env.MACRO_AUDIT_MCP_STDIO = '1';
import { projectFacts, projectQuarantine } from './fact/projection.js';
import { loadManifestMeta } from './manifest.js';
export const MCP_PROTOCOL_VERSION = '2024-11-05';
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
let serverConfig = {};
export function setMcpServerConfig(c) { serverConfig = c || {}; }
export function resolveFactsDb(argDb) {
    const envDb = process.env.MACRO_AUDIT_FACTS_DB;
    return argDb || (serverConfig.db && serverConfig.db.length > 0 ? serverConfig.db : undefined) || (envDb && envDb.length > 0 ? envDb : undefined);
}
function ok(id, result) {
    return { jsonrpc: '2.0', id: id === undefined ? null : id, result: result };
}
function fail(id, code, message) {
    return { jsonrpc: '2.0', id: id === undefined ? null : id, error: { code: code, message: message } };
}
function asStr(v) {
    return typeof v === 'string' && v.length > 0 ? v : undefined;
}
// 单条 JSON-RPC 消息处理；notification（无 id）返回 null=不应答。
export async function handleRpcMessage(msg) {
    const id = msg.id === undefined ? null : msg.id;
    const isNotification = msg.id === undefined;
    const method = msg.method;
    if (typeof method !== 'string' || method.length === 0) {
        if (isNotification) {
            return null;
        }
        return fail(id, -32600, 'invalid request: method missing');
    }
    if (method === 'notifications/initialized' || method.indexOf('notifications/') === 0) {
        return null;
    }
    if (isNotification) {
        return null;
    }
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
        return ok(id, { tools: [FACTS_TOOL, QUARANTINE_TOOL] });
    }
    if (method === 'tools/call') {
        const p = msg.params || {};
        if (p.name !== 'facts' && p.name !== 'quarantine') {
            return fail(id, -32602, 'unknown tool: ' + String(p.name));
        }
        if (p.name === 'quarantine') {
            const a = (p.arguments || {});
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
            }
            catch (e) {
                return ok(id, { content: [{ type: 'text', text: 'MCP-QUAR-ERROR: ' + String(e && e.message || e) }], isError: true });
            }
        }
        const a = (p.arguments || {});
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
        }
        catch (e) {
            return ok(id, { content: [{ type: 'text', text: 'MCP-FACTS-ERROR: ' + String(e && e.message || e) }], isError: true });
        }
    }
    return fail(id, -32601, 'method not found: ' + method);
}
// NDJSON 行帧服务：stdin 每行一条 JSON-RPC 消息，应答逐行写 stdout。
// 解析失败行回 -32700；notification 不应答；流结束即退。
export async function serveMcpStdio(input, output) {
    let buf = '';
    const pending = [];
    input.setEncoding('utf8');
    const write = function (r) {
        if (r !== null) {
            output.write(JSON.stringify(r) + '\n');
        }
    };
    await new Promise(function (resolve) {
        input.on('data', function (chunk) {
            buf += chunk;
            let idx = buf.indexOf('\n');
            while (idx >= 0) {
                const line = buf.slice(0, idx).trim();
                buf = buf.slice(idx + 1);
                idx = buf.indexOf('\n');
                if (line.length === 0) {
                    continue;
                }
                let msg;
                try {
                    msg = JSON.parse(line);
                }
                catch (e) {
                    write(fail(null, -32700, 'parse error: ' + String(e && e.message || e)));
                    continue;
                }
                pending.push(handleRpcMessage(msg).then(write, function (e) {
                    write(fail(msg.id === undefined ? null : msg.id, -32603, 'internal error: ' + String(e && e.message || e)));
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
