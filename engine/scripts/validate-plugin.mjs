// validate-plugin.mjs —— #58/D-066 真校验器，只报不拦：`claude plugin validate <engine> --strict`（WARN 不红）
// 两个地方会用到：①CI 里按事件触发（engine-ci.yml 跟着 engine/** 的改动跑，注入 MACRO_AUDIT_CI=1）
// ②打包、上架市场前的那道手动窗口（npm run validate:plugin）
// 环境分两档（D-077①）：`MACRO_AUDIT_CI=1` 是「命令行工具本来就该不在」那种（cli-absent-expected）→ 不出警告，只出 `INFO(claude-validate): cli-absent-expected`
// 这算第三种披露态（neutral——记进 ADV 也回显，但不算 WARN、不进连续计数、不触发升级）；没设就是「本地该在」那种（cli-expected）
// （拿不准就往本地报警那边靠）：SKIP 照样硬算（记 WARN 加连续计数加 SKIP-STREAK-ALERT），只是范围收窄成「本地出怪了没跑成」。
// 状态：.code-tmp/claude-validate-state.json（没入库的 scratch，不算契约面；mode=local-observation-only——
// 就是个本地连着数了几次的计数器，CI 那头不消费它，也不算晋升证据）。
// 证据：.code-tmp/claude-validate-receipts.jsonl（只往后加——每跑一回记一行 {at,cli_version,verdict,output_digest}；
// 人工确认要不要转正就看这本账：连着两个版本窗都没有 SKIP/WARN 那些脏行，D-077③④）。
// 规矩：只报不拦，永远不 exit 1（D-037⑤ 头一段）；要转成真拦的判据挂 registry 的 claude-validate-promotion-watch（人工看着升）。
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
// D-077④ receipts.jsonl 是只往后加的证据账（转正时人来读——连着两个版本窗都没 SKIP/WARN 脏行）
function appendReceipt(verdict, cliVersion, output) {
  mkdirSync(TMP, { recursive: true });
  const row = { at: new Date().toISOString(), cli_version: cliVersion || null, verdict: verdict, output_digest: createHash('sha256').update(String(output || '')).digest('hex').slice(0, 16) };
  appendFileSync(RECEIPTS, JSON.stringify(row) + '\n', 'utf8');
}

const st = readState();
// win32 上走 cmd.exe /d /s /c 调 claude（Node 24 往后不让直接调 .cmd，会 EINVAL；开 shell:true 又有命令被拆、被注入的风险——拿 cmd.exe 明着包一层两头都顾上）；POSIX 上直接调 claude。
const claudeSpec = process.platform === 'win32' ? { cmd: 'cmd.exe', pre: ['/d', '/s', '/c', 'claude'] } : { cmd: 'claude', pre: [] };
const probe = spawnSync(claudeSpec.cmd, claudeSpec.pre.concat(['--version']), { encoding: 'utf8', timeout: 30000 });
const cliVer = !probe.error && probe.status === 0 ? (probe.stdout || '').trim().split('\n')[0] : null;
const cliAbsent = !cliVer;

if (cliAbsent && IS_CI) {
  // CI 这头本来就不该有命令行工具：该不在不算出事——记成 INFO 那种第三披露态（neutral；不消费 state、不进连续计数、不升级）
  appendReceipt('info-cli-absent-expected', null, 'cli-absent-expected');
  console.log('INFO(claude-validate): cli-absent-expected | 预期缺席（CI 未装 claude CLI）——不计 WARN、不进 streak、不触发升格');
  process.exit(0);
}

if (cliAbsent) {
  st.streak = (st.last === 'skip-cli-absent') ? (st.streak + 1) : 1;
  st.last = 'skip-cli-absent';
  writeState(st);
  appendReceipt('skip-cli-absent', null, 'cli-absent local streak=' + st.streak);
  console.log('SKIP(claude-validate): cli-absent | 本地异常缺席——计入 WARN' + (st.streak >= 2 ? ' | SKIP-STREAK-ALERT streak=' + st.streak : ' | streak=' + st.streak));
  process.exit(0);
}

if (claudeSpec.cmd === 'cmd.exe' && /[&|<>^%!()"]/.test(ENGINE)) {
  st.streak = (st.last === 'skip-unsafe-path') ? (st.streak + 1) : 1;
  st.last = 'skip-unsafe-path';
  writeState(st);
  appendReceipt('skip-unsafe-path', cliVer, 'unsafe-path local streak=' + st.streak);
  console.log('SKIP(claude-validate): unsafe-path | ENGINE 路径含 cmd.exe 元字符，跳过 Windows 校验' + (st.streak >= 2 ? ' | SKIP-STREAK-ALERT streak=' + st.streak : ' | streak=' + st.streak));
  process.exit(0);
}

const r = spawnSync(claudeSpec.cmd, claudeSpec.pre.concat(['plugin', 'validate', ENGINE, '--strict']), { encoding: 'utf8', timeout: 150000 });
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
