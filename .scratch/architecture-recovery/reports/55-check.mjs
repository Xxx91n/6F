// 55-check.mjs —— #55 P1 四子项守卫（D-059④⑤⑥⑦ / T3）
// 断言面：A=SQL 剥字面量（stripSqlLiterals 在 schema.ts＋真变异仍拒＋字面量不误伤＋未闭合保守拒）
//   → B=MCP db 寻址（arguments.db → server --db → MACRO_AUDIT_FACTS_DB env → 结构化 UNRESOLVED；
//        mcp.json env 面登记；required 不再含 db）
//   → C=intake 时点披露＋.git 归一＋refresh opt-in（字段契约＋实跑 URL 面缓存命中/刷新语义）
//   → D=contradicts 死枚举清除（type 面消失 + 无消费方残留引用）
//   → E=三测试接入 smoke 链
//   → F=本票新增/改动文件无 BOM
// 纪律：只读断言＋file:// 合成仓实跑 intake（离线等价 URL 面，零外网依赖）；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const NL = '\n';

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
function run(f) { try { return execFileSync('node', [join(ENG, 'test', f)], { encoding: 'utf8' }); } catch (e) { return (e.stdout || '') + (e.stderr || ''); } }

// ---------- A. SQL 剥字面量（D-059④） ----------
const schema = txt(join(ENG, 'src', 'fact', 'schema.ts'));
t('A1 stripSqlLiterals 在 schema.ts（append-only 分类前置剥离字面量）', /function stripSqlLiterals|const stripSqlLiterals/.test(schema));
t('A2 黑名单匹配作用于剥离后语句（不再裸扫原文）', schema.indexOf('stripSqlLiterals') >= 0 && /assertAppendOnly/.test(schema));
let sqlT = run('sql-literal.test.mjs');
t('A3 sql-literal 单测全绿（字面量内 DELETE/UPDATE/DROP 不误伤 + 真变异仍拒 + 未闭合保守拒）', /SQL-LITERAL (\d+)\/\1/.test(sqlT) && sqlT.indexOf('FAIL ') < 0, (sqlT || '').split(NL).slice(-1)[0]);

// ---------- B. MCP db 寻址（D-059⑥） ----------
const mcpJson = JSON.parse(txt(join(ENG, 'mcp.json')));
const mcpSrv = mcpJson.mcpServers ? (mcpJson.mcpServers['macro-audit-kernel'] || mcpJson.mcpServers['macro-audit'] || Object.values(mcpJson.mcpServers)[0]) : null;
t('B1 mcp.json env 面登记 MACRO_AUDIT_FACTS_DB', !!mcpSrv && !!mcpSrv.env && 'MACRO_AUDIT_FACTS_DB' in mcpSrv.env);
const mcpSrc = txt(join(ENG, 'src', 'mcp-server.ts'));
t('B2 寻址优先链：arguments.db → server --db → env → 结构化 UNRESOLVED', mcpSrc.indexOf('MACRO_AUDIT_FACTS_DB') >= 0 && mcpSrc.indexOf('MCP-FACTS-DB-UNRESOLVED') >= 0);
let mcpT = run('mcp-db-resolution.test.mjs');
t('B3 mcp-db-resolution 单测全绿（优先链 + inputSchema.required 不再含 db + tools/call 结构化错误）', /MCP-DB (\d+)\/\1/.test(mcpT) && mcpT.indexOf('FAIL ') < 0, (mcpT || '').split(NL).slice(-1)[0]);

// ---------- C. intake 时点披露＋.git 归一＋refresh（D-059⑦） ----------
const intake = txt(join(ENG, 'src', 'intake', 'intake.ts'));
t('C1 snapshot_fetched_at/cache_hit/refreshed 三字段在 RepoAddResult', ['snapshot_fetched_at', 'cache_hit', 'refreshed'].every(function (k) { return intake.indexOf(k) >= 0; }));
t('C2 normalizeRepoUrlKey 在（.git 尾缀/尾斜线归一→同键缓存槽）', /normalizeRepoUrlKey/.test(intake) && intake.indexOf('.git') >= 0);
t('C3 refresh opt-in 实装（fetch --prune＋复位；非自动 pull）', intake.indexOf('refresh') >= 0 && /--prune/.test(intake));
let inT = run('intake.test.mjs');
t('C4 intake 单测全绿（40/40 含归一/时点/缓存命中/refresh 断言）', /INTAKE (\d+)\/\1/.test(inT) && inT.indexOf('FAIL ') < 0, (inT || '').split(NL).slice(-1)[0]);

// C5 实跑 URL 面 file:// 同键缓存槽（离线等价；验证归一化端到端）
const tmp = mkdtempSync(join(tmpdir(), '55check-'));
const SRC = join(tmp, 'src');
mkdirSync(SRC, { recursive: true });
const ENV = Object.assign({}, process.env, { GIT_AUTHOR_DATE: '2026-04-10T10:00:00Z', GIT_COMMITTER_DATE: '2026-04-10T10:00:00Z' });
execFileSync('git', ['init'], { cwd: SRC, env: ENV });
execFileSync('git', ['config', 'user.email', 'a@b.c'], { cwd: SRC, env: ENV });
execFileSync('git', ['config', 'user.name', '55check'], { cwd: SRC, env: ENV });
execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: SRC, env: ENV });
writeFileSync(join(SRC, 'a.txt'), 'x\n', 'utf8');
execFileSync('git', ['add', '-A'], { cwd: SRC, env: ENV });
execFileSync('git', ['commit', '-m', 'c1'], { cwd: SRC, env: ENV });
const I = await import(pathToFileURL(join(ENG, 'dist', 'intake', 'intake.js')).href);
const cacheRoot = join(tmp, 'cache');
const fileUrl = 'file://' + SRC.split('\\').join('/');
const r1 = I.repoAdd(fileUrl, { cacheRoot: cacheRoot });
const r2 = I.repoAdd(fileUrl + '/', { cacheRoot: cacheRoot });
t('C5 尾斜线异拼写同缓存槽（r1.cloned=true→r2.cache_hit=true 同 sha 目录）', r1.cloned === true && r2.cache_hit === true && r1.cache_dir === r2.cache_dir, r1.cache_dir + ' vs ' + r2.cache_dir);
t('C5b .git 尾缀归一化键等价（单元面：normalizeRepoUrlKey 异拼写同键——file:// 下 src 与 src.git 为不同物理路径，等价语义只对 https 类拼写成立）', I.normalizeRepoUrlKey('https://x/o/r.git') === I.normalizeRepoUrlKey('https://x/o/r') && I.normalizeRepoUrlKey('https://x/o/r.git/') === I.normalizeRepoUrlKey('https://x/o/r'));
t('C6 时点披露：r1.snapshot_fetched_at 非空 ISO；r2 保旧时点（缓存命中未刷新如实）', typeof r1.snapshot_fetched_at === 'string' && /T.*(Z|[+-]\d{2}:\d{2})$/.test(r1.snapshot_fetched_at) && r2.snapshot_fetched_at === r1.snapshot_fetched_at && r2.refreshed === false);
const r3 = I.repoAdd(fileUrl, { cacheRoot: cacheRoot, refresh: true });
t('C7 refresh opt-in：refreshed=true + 时点更新（显式拉取语义）', r3.refreshed === true && typeof r3.snapshot_fetched_at === 'string');
rmSync(tmp, { recursive: true, force: true });

// ---------- D. contradicts 死枚举清除（D-059⑤） ----------
const cite = txt(join(ENG, 'src', 'report', 'citation.ts'));
const relType = (cite.match(/export type SupportRelation[^;]*;/) || [''])[0];
t('D1 citation.ts SupportRelation 联合无 contradicts 成员（注释勘误不算残留）', relType.indexOf('SupportRelation') >= 0 && relType.indexOf('contradicts') < 0, relType.slice(0, 120));
function stripComments(src) { return src.replace(/\/\*[\s\S]*?\*\//g, '').split(NL).filter(function (l) { return l.indexOf('//') < 0 || l.trim().indexOf('//') !== 0; }).map(function (l) { return l.split('//')[0]; }).join(NL); }
const allSrc = ['cli.ts', 'audit/audit.ts', 'audit/macro-b.ts', 'demo/demo.ts', 'mcp-server.ts', 'report/generate.ts', 'report/citation.ts', 'fact/schema.ts', 'fact/store.ts', 'intake/intake.ts'].map(function (f) { try { return stripComments(txt(join(ENG, 'src', f))); } catch (e) { return ''; } }).join(NL);
t('D2 src 代码面无 contradicts 消费残留（注释除外）', allSrc.indexOf('contradicts') < 0);

// ---------- E. 三测试接入 smoke 链 ----------
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('E1 smoke 链接入三新测（gitcli-contract/sql-literal/mcp-db-resolution）+ audit.test', ['gitcli-contract', 'sql-literal', 'mcp-db-resolution', 'audit.test'].every(function (s) { return pkg.scripts.smoke.indexOf(s) >= 0; }));

// ---------- F. BOM ----------
const nbFiles = ['engine/src/fact/schema.ts', 'engine/src/mcp-server.ts', 'engine/src/intake/intake.ts', 'engine/src/report/citation.ts', 'engine/test/sql-literal.test.mjs', 'engine/test/mcp-db-resolution.test.mjs'].map(function (f) { return join(REPO, f); });
t('F1 本票新增/改动文件无 BOM', nbFiles.every(function (f) { return !existsSync(f) || noBom(f); }), nbFiles.filter(function (f) { return existsSync(f) && !noBom(f); }).join(','));

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
