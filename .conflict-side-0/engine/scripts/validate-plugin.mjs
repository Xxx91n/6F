// validate-plugin.mjs — #58/D-066 真校验器 advisory：`claude plugin validate <engine> --strict`（WARN 不红）
// 双触发消费位：①CI event_bound（engine-ci.yml 随 engine/** 变更触发，MACRO_AUDIT_CI=1 注入）
//             ②pack/marketplace 前置手动窗口（npm run validate:plugin）
// 环境分层（D-077①）：`MACRO_AUDIT_CI=1`=cli-absent-expected 面 → cli-absent → `INFO(claude-validate): cli-absent-expected`
//   第三披露态（neutral——计入 ADV｜回显、不计 WARN、不进 streak、不触发升格）；缺省=cli-expected 面
//   （fail-safe 本地告警方向）：SKIP 硬化原样（计入 WARN＋streak＋SKIP-STREAK-ALERT），语义收窄=「本地异常缺席」。
// 状态：.code-tmp/claude-validate-state.json（未跟踪 scratch，非契约面；mode=local-observation-only——
//   本地连续观测计数器，CI 面不消费、非 promotion 证据）。
// 证据：.code-tmp/claude-validate-receipts.jsonl（append-only——每跑一行 {at,cli_version,verdict,output_digest}；
//   promotion 人工确认读此账：连续 2 版本窗无 SKIP/WARN 污染行，D-077③④）。
// 纪律：advisory 永不 exit 1（D-037⑤ 第一段）；转 enforce 判据=registry claude-validate-promotion-watch（manual_watch 人工晋升）。
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = join(ENGINE, '..', '.code-tmp');
const STATE = join(TMP, 'claude-validate-state.json');
const RECEIPTS = join(TMP, 'claude-validate-receipts.jsonl');
const IS_CI = process.env.MACRO_AUDIT_CI === '1';

function readState() {
  try { const s = JSON.parse(readFileSync(STATE, 'utf8')); return { streak: s.streak || 0, last: s.last || null }; } catch (e) { return { streak: 0, last: null }; }
}
function writeState(st) {
  mkdirSync(dirname(STATE), { recursive: true });
  st.mode = 'local-observation-only';
  writeFileSync(STATE, JSON.stringify(st), 'utf8');
}
// D-077④ receipts.jsonl append-only 证据载体（promotion 人工读账——连续 2 版本窗无 SKIP/WARN 污染行）
function appendReceipt(verdict, cliVersion, output) {
  mkdirSync(TMP, { recursive: true });
  const row = { at: new Date().toISOString(), cli_version: cliVersion || null, verdict: verdict, output_digest: createHash('sha256').update(String(output || '')).digest('hex').slice(0, 16) };
  appendFileSync(RECEIPTS, JSON.stringify(row) + '\n', 'utf8');
}

const st = readState();
const probe = spawnSync('claude --version', { shell: true, encoding: 'utf8', timeout: 30000 });
const cliVer = !probe.error && probe.status === 0 ? (probe.stdout || '').trim().split('\n')[0] : null;
const cliAbsent = !cliVer;

if (cliAbsent && IS_CI) {
  // CI=cli-absent-expected 面：预期缺席非异常——INFO 第三披露态（neutral；不消费 state、不进 streak、不升格）
  appendReceipt('info-cli-absent-expected', null, 'cli-absent-expected');
  console.log('INFO(claude-validate): cli-absent-expected | 预期缺席（CI 未装 claude CLI）——不计 WARN、不进 streak、不触发升格');
  process.exit(0);
}

if (cliAbsent) {
  st.streak += 1; st.last = 'skip-cli-absent'; writeState(st);
  appendReceipt('skip-cli-absent', null, 'cli-absent local streak=' + st.streak);
  console.log('SKIP(claude-validate): cli-absent | 本地异常缺席——计入 WARN' + (st.streak >= 2 ? ' | SKIP-STREAK-ALERT streak=' + st.streak : ' | streak=' + st.streak));
  process.exit(0);
}

const r = spawnSync('claude plugin validate "' + ENGINE + '" --strict', { shell: true, encoding: 'utf8', timeout: 150000 });
const out = ((r.stdout || '') + '\n' + (r.stderr || '')).trim();
if (!r.error && r.status === 0) {
  st.streak = 0; st.last = 'pass'; writeState(st);
  appendReceipt('pass', cliVer, out);
  console.log('PASS claude-validate: `claude plugin validate --strict` 干净' + (out ? ' | ' + out.split('\n')[0].slice(0, 140) : ''));
  process.exit(0);
}
st.streak = 0; st.last = 'warn'; writeState(st);
appendReceipt('warn', cliVer, out);
console.log('WARN claude-validate: validate 报告问题（advisory 不红）| exit=' + (r.status === null ? 'null' : r.status));
out.split('\n').slice(0, 20).forEach(l => console.log('  | ' + l));
process.exit(0);
