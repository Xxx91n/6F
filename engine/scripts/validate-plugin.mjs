// validate-plugin.mjs — #58/D-066 真校验器 advisory：`claude plugin validate <engine> --strict`（WARN 不红）
// 双触发消费位：①CI event_bound（engine-ci.yml 随 engine/** 变更触发，manifest.meta.json/gen-manifests.mjs 为其子集）
//             ②pack/marketplace 前置手动窗口（npm run validate:plugin）
// SKIP 硬化（D-066③）：cli-absent → `SKIP(claude-validate): cli-absent` 计入 WARN；连续 SKIP 升格（streak≥2 → SKIP-STREAK-ALERT）
// 状态：.code-tmp/claude-validate-state.json（未跟踪 scratch，非契约面）
// 纪律：advisory 永不 exit 1（D-037⑤ 第一段）；转 enforce 判据=registry claude-validate-promotion-watch（2 版本窗口无 SKIP 污染）
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATE = join(ENGINE, '..', '.code-tmp', 'claude-validate-state.json');

function readState() {
  try { return JSON.parse(readFileSync(STATE, 'utf8')); } catch (e) { return { streak: 0, last: null }; }
}
function writeState(st) {
  mkdirSync(dirname(STATE), { recursive: true });
  writeFileSync(STATE, JSON.stringify(st), 'utf8');
}

const st = readState();
const probe = spawnSync('claude --version', { shell: true, encoding: 'utf8', timeout: 30000 });
const cliAbsent = !!probe.error || probe.status !== 0 || !(probe.stdout || '').trim();

if (cliAbsent) {
  st.streak += 1; st.last = 'skip-cli-absent'; writeState(st);
  console.log('SKIP(claude-validate): cli-absent | 计入 WARN' + (st.streak >= 2 ? ' | SKIP-STREAK-ALERT streak=' + st.streak : ' | streak=' + st.streak));
  process.exit(0);
}

const r = spawnSync('claude plugin validate "' + ENGINE + '" --strict', { shell: true, encoding: 'utf8', timeout: 150000 });
const out = ((r.stdout || '') + '\n' + (r.stderr || '')).trim();
if (!r.error && r.status === 0) {
  st.streak = 0; st.last = 'pass'; writeState(st);
  console.log('PASS claude-validate: `claude plugin validate --strict` 干净' + (out ? ' | ' + out.split('\n')[0].slice(0, 140) : ''));
  process.exit(0);
}
st.streak = 0; st.last = 'warn'; writeState(st);
console.log('WARN claude-validate: validate 报告问题（advisory 不红）| exit=' + (r.status === null ? 'null' : r.status));
out.split('\n').slice(0, 20).forEach(l => console.log('  | ' + l));
process.exit(0);
