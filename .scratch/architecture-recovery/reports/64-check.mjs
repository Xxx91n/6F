// 64-check.mjs — #64/D-072 duckdb 自愈补拉守卫
// A 面=store.ts 自愈面结构断言；B 面=bundle external 验收＋结构化 stdout；C 面=文档/CI/锁表一致性
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const REPO = join(here, '..', '..', '..');
const ENG = join(REPO, 'engine');
const store = fs.readFileSync(join(ENG, 'src', 'fact', 'store.ts'), 'utf8');
const dist = fs.readFileSync(join(ENG, 'dist', 'cli.js'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(join(ENG, 'package.json'), 'utf8'));
const lock = fs.readFileSync(join(ENG, 'upstream-lock.yaml'), 'utf8');
const readme = fs.readFileSync(join(ENG, 'README.md'), 'utf8');
const ci = fs.readFileSync(join(REPO, '.github', 'workflows', 'engine-ci.yml'), 'utf8');
const mcp = fs.readFileSync(join(ENG, 'src', 'mcp-server.ts'), 'utf8');

let pass = 0, fail = 0;
const t = (n, ok, ex = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (ex ? ' | ' + ex : '')); ok ? pass++ : fail++; };

// --- A. store.ts 自愈面（D-072①②） ---
t('A1 自愈标记在位（selfHealDuckdb/--no-save/--omit=dev/node-bindings-/每进程旗标）',
  store.includes('selfHealDuckdb') && store.includes("'--no-save'") && store.includes("'--omit=dev'") && store.includes('node-bindings-') && store.includes('selfHealAttempted'));
t('A2 版本三方同值（store.ts DUCKDB_PINNED_VERSION == package.json dep == upstream-lock duckdb-node-api）', (() => {
  const m = store.match(/DUCKDB_PINNED_VERSION = '([^']+)'/);
  const lv = lock.match(/id: duckdb-node-api\n\s+kind: node-lib\n\s+version: "([^"]+)"/);
  return !!m && !!lv && m[1] === pkg.dependencies['@duckdb/node-api'] && lv[1] === m[1];
})(), 'store/pkg/lock');
t('A3 三段披露文案（自动补拉失败原因→手动 npm install --omit=dev→无网络 facts/audit 不可用其余不受影响）',
  store.includes('自动补拉失败（') && store.includes('npm install --omit=dev') && store.includes('无网络') && store.includes('其余命令不受影响'));
t('A4 每进程至多 1 次（内存旗标防循环）', store.includes('already-attempted-once-per-process'));
t('A5 win32-arm64 无官方包直接回落（NO_OFFICIAL_BINDINGS）', store.includes('NO_OFFICIAL_BINDINGS') && store.includes("'win32-arm64'"));
t('A6 完整性校验三件（.node 存在＋尺寸阈＋version 同值，失败删半成品）', store.includes(".endsWith('.node')") && store.includes('sizeOk') && store.includes('rmSync(pkgDir'));
t('A7 musl 探测在位（ldd --version → -musl 后缀）', store.includes('musl') && store.includes("'ldd'"));

// --- B. bundle external 验收＋结构化 stdout（D-072④⑧） ---
t('B1 bundle 验收硬条件：@duckdb/node-api 动态导入在 bundle 内显式 external 可达',
  dist.includes('import("@duckdb/node-api")') && dist.includes('DUCKDB_PINNED_VERSION'), 'dist/cli.js ' + (dist.length / 1024).toFixed(0) + 'KB');
t('B2 自愈结构化事件落输出（DUCKDB-SELFHEAL JSON——runtime-doctor 消费面）', store.includes("'DUCKDB-SELFHEAL '") && store.includes('result'));
t('B3 MCP stdio 避让（stdout=JSON-RPC 行帧→env 旗标 stderr 化）', store.includes('MACRO_AUDIT_MCP_STDIO') && mcp.includes("MACRO_AUDIT_MCP_STDIO = '1'"));

// --- C. 文档/CI/锁表（D-072③⑤⑦） ---
t('C1 README 披露升口径（自动补拉＋需网络＋手动路径）', readme.includes('自动补拉') && readme.includes('npm install --omit=dev'));
t('C2 npm 渠道辨析票面（npm publish deferred ≠ 插件目录 npm install 依赖拉取）', readme.includes('npm publish') && readme.includes('依赖拉取'));
t('C3 engine-ci 自愈双腿（offline-sim＋E2E smoke 步在）', ci.includes('self-heal offline') && ci.includes('self-heal E2E'));
t('C4 upstream-lock duckdb-node-bindings 行（active/exact-version 三方同值第三腿）',
  /id: duckdb-node-bindings\n\s+kind: node-lib\n\s+version: "1\.5\.5-r\.4"\n\s+pin_type: exact-version/.test(lock) && /id: duckdb-node-bindings[\s\S]*?status: active/.test(lock));

console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
