// mcp-db-resolution.test.mjs — MCP facts db 服务端寻址链测试（#55 / D-059⑥；作用于 dist 编译产物）
// 寻址序：arguments.db → server --db argv（setMcpServerConfig）→ MACRO_AUDIT_FACTS_DB env → MCP-FACTS-DB-UNRESOLVED。
// 背景：修复前 db 为必填入参，宿主 agent 无法预知 facts.duckdb 绝对路径（D-053 叙事主路被堵）。
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const M = await import(pathToFileURL(join(root, 'dist', 'mcp-server.js')).href);

const results = [];
function check(name, pass, detail) { results.push([name, !!pass, detail || '']); }

// -- 纯函数寻址序 --
M.setMcpServerConfig({ db: 'C:/srv/db.duckdb' });
delete process.env.MACRO_AUDIT_FACTS_DB;
check('R1 arguments.db 优先（显式入参压一切）', M.resolveFactsDb('D:/arg/x.duckdb') === 'D:/arg/x.duckdb');
check('R2 server --db argv 兜底（mcp.json args 配置面）', M.resolveFactsDb(undefined) === 'C:/srv/db.duckdb');
process.env.MACRO_AUDIT_FACTS_DB = 'E:/env/facts.duckdb';
check('R3 env 在 argv 缺席时补位但让位 argv', M.resolveFactsDb(undefined) === 'C:/srv/db.duckdb');
M.setMcpServerConfig({});
check('R4 argv 空 → env 生效', M.resolveFactsDb(undefined) === 'E:/env/facts.duckdb');
process.env.MACRO_AUDIT_FACTS_DB = '';
check('R5 env 空串视为未配置', M.resolveFactsDb(undefined) === undefined);
delete process.env.MACRO_AUDIT_FACTS_DB;
check('R6 全链缺席 → undefined（由 tools/call 转 MCP-FACTS-DB-UNRESOLVED）', M.resolveFactsDb(undefined) === undefined);

// -- tools/list：db 不再必填（寻址收敛后 schema 诚实面） --
const list = await M.handleRpcMessage({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
const factsTool = list && list.result && list.result.tools ? list.result.tools[0] : null;
check('S1 tools/list 仍只暴露 facts 单工具', !!factsTool && factsTool.name === 'facts');
check('S2 inputSchema.required 不再含 db（必填泄漏已修）', !factsTool.inputSchema.required || factsTool.inputSchema.required.indexOf('db') < 0, JSON.stringify(factsTool.inputSchema.required));
check('S3 inputSchema 仍声明 db 属性（显式入参保留）', !!factsTool.inputSchema.properties.db);

// -- tools/call：寻址失败 → 结构化错误；寻址成功 → 进入投影层 --
const r1 = await M.handleRpcMessage({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'facts', arguments: {} } });
check('C1 无 db 寻址 → -32602 MCP-FACTS-DB-UNRESOLVED', !!r1.error && r1.error.code === -32602 && r1.error.message.indexOf('MCP-FACTS-DB-UNRESOLVED') >= 0, JSON.stringify(r1.error));
const r2 = await M.handleRpcMessage({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'facts', arguments: { db: 'D:/nonexistent/none.duckdb' } } });
check('C2 显式 db 寻址成功 → 进入投影层（文件缺席报 MCP-FACTS-ERROR 而非 UNRESOLVED）', !!r2.result && r2.result.isError === true && r2.result.content[0].text.indexOf('MCP-FACTS-ERROR') >= 0, JSON.stringify(r2).slice(0, 160));
process.env.MACRO_AUDIT_FACTS_DB = 'D:/nonexistent/env.duckdb';
const r3 = await M.handleRpcMessage({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'facts', arguments: {} } });
check('C3 env 寻址成功 → 同样进入投影层报 MCP-FACTS-ERROR', !!r3.result && r3.result.isError === true && r3.result.content[0].text.indexOf('MCP-FACTS-ERROR') >= 0, JSON.stringify(r3).slice(0, 160));
delete process.env.MACRO_AUDIT_FACTS_DB;

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('MCP-DB ' + results.length + '/' + results.length) : 'MCP-DB-FAIL');
process.exit(ok ? 0 : 1);
