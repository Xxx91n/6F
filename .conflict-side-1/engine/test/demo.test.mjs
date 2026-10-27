// demo.test.mjs — 演示入口契约测试（#45/A-050/D-038；CI 每平台；作用于 dist 编译产物）
// 断言面 = 三场景 definition 契约（名逐字/synthetic 硬标）→ 生成器确定性（同 SHA×2/merge/多分支/tag）
//        → Repo Intake 本地腿（D-013 同一输入面）→ 三场景实跑裁定/降级 → CASRAI 披露块四印记
//        → synthetic 不冒充真实审计 → 临时目录跑完即弃 → golden 逐字节一致。
// 全离线：临时目录合成 git 仓 + 本地 intake，无网络调用；不读 .scratch。
import { mkdtempSync, existsSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const D = await import(pathToFileURL(join(root, 'dist', 'demo', 'demo.js')).href);
const FG = await import(pathToFileURL(join(root, 'dist', 'demo', 'fixture-generator.js')).href);
const I = await import(pathToFileURL(join(root, 'dist', 'intake', 'intake.js')).href);

const results = [];
function check(name, pass, detail) { results.push([name, !!pass, detail || '']); }
const tmp = mkdtempSync(join(tmpdir(), 'demo-test-'));
const GOLDEN = join(root, 'fixtures', 'golden');

// --- C 场景定义契约（D-038 三场景名逐字 + synthetic 硬标） ---
check('C1 三场景名逐字 = happy-path/degraded-supply/degraded-incomplete', JSON.stringify(D.DEMO_SCENARIOS) === JSON.stringify(['happy-path', 'degraded-supply', 'degraded-incomplete']), JSON.stringify(D.DEMO_SCENARIOS));
const defs = {};
let defsOk = true;
for (const s of D.DEMO_SCENARIOS) {
  try { defs[s] = D.loadDefinition(s); } catch (e) { defsOk = false; }
}
check('C2 三场景定义文件可装载', defsOk && D.DEMO_SCENARIOS.every((s) => defs[s] && defs[s].scenario === s));
check('C3 定义 synthetic=true 硬标 + generator 版本字段', D.DEMO_SCENARIOS.every((s) => defs[s].synthetic === true && defs[s].generator === FG.FIXTURE_GENERATOR_ID));
check('C4 定义落盘于 engine/fixtures/definitions/（随 tgz 分发面）', D.DEMO_SCENARIOS.every((s) => existsSync(join(root, 'fixtures', 'definitions', s + '.json'))));
check('C5 未知场景显式拒绝 DEMO-SCENARIO-UNKNOWN', (() => { try { D.loadDefinition('nope'); return 'no-throw'; } catch (e) { return String(e.message).indexOf('DEMO-SCENARIO-UNKNOWN') >= 0 ? '' : e.message; } })() === '');
check('C6 degraded 双变体 failure.trigger 确定性声明', defs['degraded-supply'].failure && defs['degraded-supply'].failure.trigger === 'supply-chain-not-connected' && defs['degraded-incomplete'].failure && defs['degraded-incomplete'].failure.trigger === 'evidence-incomplete');

// --- G 生成器确定性（FerrLabs 模式：merge/多分支/tag + pin author/date） ---
const genDir = join(tmp, 'gen-a');
const g1 = FG.generateFixtureRepo(defs['happy-path'], genDir);
check('G1 生成产物为 git 仓（HEAD 可解析 40 位 SHA）', /^[0-9a-f]{40}$/.test(g1.head_sha), g1.head_sha);
check('G2 多分支在位（main + feature/*）', g1.branches.length >= 2 && g1.branches.indexOf('feature/adr-hygiene') >= 0, g1.branches.join(','));
check('G3 merge commit 在位（--no-ff）', g1.merge_commits >= 1, String(g1.merge_commits));
check('G4 tag 在位（v0.1.0）', g1.tags.indexOf('v0.1.0') >= 0, g1.tags.join(','));
const g2 = FG.generateFixtureRepo(defs['happy-path'], join(tmp, 'gen-b'));
check('G5 确定性：同 definition 两次生成 head_sha 逐字节一致', g1.head_sha === g2.head_sha, g1.head_sha + ' vs ' + g2.head_sha);
const g3 = FG.generateFixtureRepo(defs['degraded-incomplete'], join(tmp, 'gen-c'));
check('G6 异场景生成产物 SHA 不同（语料差分真实生效）', g3.head_sha !== g1.head_sha);
check('G7 提交作者恒为 Fixture Bot（synthetic 署名印记）', spawnSync('git', ['-C', genDir, 'log', '-1', '--format=%an|%ae'], { encoding: 'utf8' }).stdout.trim() === 'Fixture Bot|fixture@macro-audit.invalid');

// --- I Repo Intake 本地腿（D-013 同一输入面） ---
const cls = I.classifyRepoInput(genDir);
check('I1 生成仓路径 classifyRepoInput → local 腿', cls.kind === 'local', cls.kind);
const intake = I.repoAdd(genDir);
check('I2 repoAdd 本地腿解析 + 全深度断言', intake.kind === 'local' && intake.shallow === false && intake.full_depth_verified === true && intake.head_sha === g1.head_sha);

// --- R 三场景实跑（裁定/降级如实） ---
const runs = {};
for (const s of D.DEMO_SCENARIOS) {
  runs[s] = D.runDemo({ scenario: s, outDir: join(tmp, 'run-' + s), tempRoot: tmp });
}
check('R1 happy-path → supported + degraded_mode=false', runs['happy-path'].verdict === 'supported' && runs['happy-path'].degraded_mode === false, runs['happy-path'].verdict);
check('R2 degraded-supply → insufficient + degraded_mode=true + 原因含供应链', runs['degraded-supply'].verdict === 'insufficient' && runs['degraded-supply'].degraded_mode === true && (runs['degraded-supply'].degraded_reason || '').indexOf('供应链') >= 0, runs['degraded-supply'].degraded_reason);
check('R3 degraded-incomplete → insufficient + degraded_mode=true + 原因含不完整', runs['degraded-incomplete'].verdict === 'insufficient' && runs['degraded-incomplete'].degraded_mode === true && (runs['degraded-incomplete'].degraded_reason || '').indexOf('不完整') >= 0, runs['degraded-incomplete'].degraded_reason);
check('R4 实跑结果与 definition.expect 逐场景一致', D.DEMO_SCENARIOS.every((s) => runs[s].verdict === defs[s].expect.overall_verdict && runs[s].degraded_mode === defs[s].expect.degraded_mode));
check('R5 intake_kind=local（demo 走同一 Repo Intake 本地路径）', D.DEMO_SCENARIOS.every((s) => runs[s].intake_kind === 'local'));
check('R6 报告骨架 C1-C4 章序锁定（降级不改骨架）', D.DEMO_SCENARIOS.every((s) => {
  const ids = (runs[s].report_markdown.match(/^## C\d /gm) || []).map(function (x) { return x.slice(3, 5); });
  return JSON.stringify(ids) === JSON.stringify(['C1', 'C2', 'C3', 'C4']);
}));

// --- D CASRAI 披露块（D-038③ 四印记逐字 + 与 #38 preview_disclosure 同一字段契约） ---
const pd = JSON.parse(runs['happy-path'].sidecar_json).preview_disclosure;
check('D1 披露块字段集 = preview_disclosure 四字段（统一契约面不另造）', JSON.stringify(Object.keys(pd).sort()) === JSON.stringify(['calibration_scope', 'capability_label', 'not_in_preview', 'structural_limitations'].sort()), JSON.stringify(Object.keys(pd)));
check('D2 印记① fixture: synthetic (generated by fixture-generator@1.0.0)', pd.calibration_scope === 'fixture: synthetic (generated by fixture-generator@1.0.0)', pd.calibration_scope);
check('D3 印记② capability 1 of 5 · preview', pd.capability_label === 'capability 1 of 5 · preview', pd.capability_label);
check('D4 印记③ not an audit of any real repository', pd.structural_limitations.some(function (x) { return x.indexOf('not an audit of any real repository') === 0; }));
check('D5 印记④ supply-chain: ⚠ unverified', pd.structural_limitations.some(function (x) { return x.indexOf('supply-chain: ⚠ unverified') === 0; }));
check('D6 三场景侧车均载同一披露块（降级不丢披露义务）', D.DEMO_SCENARIOS.every((s) => {
  const p = JSON.parse(runs[s].sidecar_json).preview_disclosure;
  return p && p.capability_label === 'capability 1 of 5 · preview' && p.calibration_scope.indexOf('fixture: synthetic') === 0;
}));
check('D7 markdown 报告头含披露块四印记（preview 诚实对外可见）', D.DEMO_SCENARIOS.every((s) => {
  const md = runs[s].report_markdown;
  return md.indexOf('披露块') >= 0 && md.indexOf('capability 1 of 5 · preview') >= 0 && md.indexOf('fixture: synthetic') >= 0 && md.indexOf('⚠ unverified') >= 0;
}));

// --- S 合成诚实（synthetic fixture 不冒充真实审计） ---
check('S1 subject_ref 含 fixture 署名（合成语料身份可机检）', D.DEMO_SCENARIOS.every((s) => JSON.parse(runs[s].sidecar_json).subject_ref.indexOf('fixture-') === 0));
check('S2 报告 headline 明记 not an audit of any real repository', D.DEMO_SCENARIOS.every((s) => runs[s].report_markdown.indexOf('not an audit of any real repository') >= 0));
check('S3 strategy 象限 conflict_markers 带 synthetic-fixture', JSON.parse(runs['happy-path'].sidecar_json).quadrants.find(function (q) { return q.quadrant === 'strategy'; }).conflict_markers.indexOf('synthetic-fixture') >= 0);
check('S4 degraded 报告 receipt 带 ⚠ unverified 印记', runs['degraded-supply'].report_markdown.indexOf('⚠ unverified') >= 0 && JSON.parse(runs['degraded-supply'].sidecar_json).receipt.degraded === true);
check('S5 测量工件 synthetic=true 印记', D.DEMO_SCENARIOS.every((s) => runs[s].measurements.synthetic === true && runs[s].measurements.generator === 'fixture-generator@1.0.0'));

// --- T 跑完即弃（临时目录不残留） ---
check('T1 temp_discarded=true 且临时 fixture 仓已删', D.DEMO_SCENARIOS.every((s) => runs[s].temp_discarded === true) && readdirSync(tmp).filter(function (d) { return d.indexOf('macro-audit-demo-') === 0; }).length === 0, readdirSync(tmp).join(','));
const keepRun = D.runDemo({ scenario: 'happy-path', outDir: join(tmp, 'run-keep'), keepTemp: true, tempRoot: tmp });
check('T2 --keep 调试位：keepTemp=true 时保留临时仓可复验', keepRun.temp_discarded === false && existsSync(join(keepRun.temp_dir, 'repo', '.git')) && keepRun.head_sha === g1.head_sha);

// --- O golden 逐字节一致（fixture 确定性 → golden diff 契约，#43 消费面） ---
const GOLDEN_FILES = ['report.md', 'report.json', 'demo-measurements.json', 'demo-facts.jsonl'];
check('O1 golden 三场景目录齐备（4 件/场景 + manifest.json）', D.DEMO_SCENARIOS.every((s) => GOLDEN_FILES.every(function (f) { return existsSync(join(GOLDEN, s, f)); })) && existsSync(join(GOLDEN, 'manifest.json')));
check('O2 实跑产物与 golden 逐字节一致（report.md/report.json/facts/measurements）', D.DEMO_SCENARIOS.every((s) => GOLDEN_FILES.every(function (f) {
  return readFileSync(join(tmp, 'run-' + s, f), 'utf8') === readFileSync(join(GOLDEN, s, f), 'utf8');
})));
const manifest = JSON.parse(readFileSync(join(GOLDEN, 'manifest.json'), 'utf8'));
check('O3 manifest 记录三场景裁定与实跑一致', D.DEMO_SCENARIOS.every((s) => manifest.scenarios[s] && manifest.scenarios[s].verdict === runs[s].verdict && manifest.scenarios[s].receipt_id === runs[s].receipt_id));

rmSync(tmp, { recursive: true, force: true });

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('DEMO ' + results.length + '/' + results.length) : 'DEMO-FAIL');
process.exit(ok ? 0 : 1);
