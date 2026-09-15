// 45-check.mjs — #45 演示入口守卫（R6-02 / A-050 / D-038）
// 断言面：三场景 definitions 在+名逐字 → golden 在 → demo --scenario 实跑 exit 0
//   → 披露块字段与 #38 preview_disclosure 同一契约 → synthetic 印记（不冒充真实审计）
//   → intake 本地腿（D-013）→ 跑完即弃 → golden 逐字节 diff → upstream 层零业务改动 → 文档账本
// 纪律：本守卫只写 os.tmpdir() 临时目录（实跑产物），仓内状态零写；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const CLI = join(ENG, 'dist', 'cli.js');
const DEFS = join(ENG, 'fixtures', 'definitions');
const GOLDEN = join(ENG, 'fixtures', 'golden');
const SCENARIOS = ['happy-path', 'degraded-supply', 'degraded-incomplete'];
const GOLDEN_FILES = ['report.md', 'report.json', 'demo-measurements.json', 'demo-facts.jsonl'];
const tmp = mkdtempSync(join(tmpdir(), '45-check-'));

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function json(p) { return JSON.parse(readFileSync(p, 'utf8')); }

// ---------- A. 资产面：definitions + golden（D-038① 形态） ----------
t('A1 三场景定义文件在 fixtures/definitions/（名逐字 D-038）', SCENARIOS.every(s => existsSync(join(DEFS, s + '.json'))));
const defs = {};
for (const s of SCENARIOS) { defs[s] = json(join(DEFS, s + '.json')); }
t('A2 定义契约：kind=fixture-definition + synthetic=true + generator=fixture-generator@1.0.0', SCENARIOS.every(s => defs[s].kind === 'fixture-definition' && defs[s].synthetic === true && defs[s].generator === 'fixture-generator@1.0.0' && defs[s].scenario === s));
t('A3 degraded 双变体 failure.trigger 确定性声明（supply-chain-not-connected / evidence-incomplete）', defs['degraded-supply'].failure && defs['degraded-supply'].failure.trigger === 'supply-chain-not-connected' && defs['degraded-incomplete'].failure && defs['degraded-incomplete'].failure.trigger === 'evidence-incomplete');
t('A4 golden 三场景目录齐备（4 件/场景）+ manifest.json', SCENARIOS.every(s => GOLDEN_FILES.every(f => existsSync(join(GOLDEN, s, f)))) && existsSync(join(GOLDEN, 'manifest.json')));
const manifest = json(join(GOLDEN, 'manifest.json'));
t('A5 manifest 记录三场景 + 裁定 + receipt + sha256', SCENARIOS.every(s => manifest.scenarios[s] && manifest.scenarios[s].verdict && manifest.scenarios[s].receipt_id && manifest.scenarios[s].sha256));

// ---------- B. 源码与分发面 ----------
const genSrc = readFileSync(join(ENG, 'src', 'demo', 'fixture-generator.ts'), 'utf8');
const demoSrc = readFileSync(join(ENG, 'src', 'demo', 'demo.ts'), 'utf8');
const cliSrc = readFileSync(join(ENG, 'src', 'cli.ts'), 'utf8');
const pkg = json(join(ENG, 'package.json'));
t('B1 生成器 pin author/committer/date（确定性根基）', genSrc.indexOf('GIT_AUTHOR_DATE') >= 0 && genSrc.indexOf('GIT_COMMITTER_DATE') >= 0 && genSrc.indexOf('Fixture Bot') >= 0);
t('B2 生成器支持 merge/多分支/tag 步型（FerrLabs 模式）', genSrc.indexOf("'merge'") >= 0 && genSrc.indexOf("'branch'") >= 0 && genSrc.indexOf("'tag'") >= 0);
t('B3 demo 管线走 Repo Intake 本地腿（import repoAdd，不设新输入面 D-013）', demoSrc.indexOf("from '../intake/intake.js'") >= 0 && demoSrc.indexOf('repoAdd(') >= 0);
t('B4 披露块复用 preview_disclosure 同一契约（PreviewDisclosure 类型 + buildReport 通道）', demoSrc.indexOf('PreviewDisclosure') >= 0 && demoSrc.indexOf('preview_disclosure: demoDisclosure()') >= 0);
t('B5 ADR-0014：demo 不 import upstream 层（上游适配层零业务改动）', demoSrc.indexOf('upstream/') < 0 && demoSrc.indexOf('codelore') < 0);
t('B6 CLI 挂 demo 子命令（--scenario/--out/--json/--keep/--list）', cliSrc.indexOf("cmd === 'demo'") >= 0 && cliSrc.indexOf('--scenario') >= 0 && cliSrc.indexOf('--list') >= 0);
t('B7 package.json files 含 fixtures（随 tgz 分发）+ smoke 链挂 demo.test.mjs', pkg.files.indexOf('fixtures') >= 0 && pkg.scripts.smoke.indexOf('demo.test.mjs') >= 0);
t('B8 dist 编译产物在位（demo.js + fixture-generator.js）', existsSync(join(ENG, 'dist', 'demo', 'demo.js')) && existsSync(join(ENG, 'dist', 'demo', 'fixture-generator.js')));

// ---------- C. demo --scenario 实跑（临时目录 out；exit 0） ----------
const runs = {};
let allExit0 = true;
for (const s of SCENARIOS) {
  const outDir = join(tmp, 'run-' + s);
  const r = spawnSync(process.execPath, [CLI, 'demo', '--scenario', s, '--out', outDir], { encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0) { allExit0 = false; runs[s] = { __err: (r.stderr || r.stdout || '').slice(0, 200) }; continue; }
  runs[s] = { outDir: outDir, summary: JSON.parse(r.stdout.trim()) };
}
t('C1 三场景 demo --scenario 实跑 exit 0', allExit0, JSON.stringify(runs).slice(0, 300));
t('C2 三场景产物 4 件落盘（report.md/json + measurements + facts）', SCENARIOS.every(s => runs[s].outDir && GOLDEN_FILES.every(f => existsSync(join(runs[s].outDir, f)))));
t('C3 happy-path 裁定 supported + degraded_mode=false', runs['happy-path'].summary && runs['happy-path'].summary.verdict === 'supported' && runs['happy-path'].summary.degraded_mode === false);
t('C4 degraded-supply 裁定 insufficient + degraded=true + 原因含供应链', runs['degraded-supply'].summary && runs['degraded-supply'].summary.verdict === 'insufficient' && runs['degraded-supply'].summary.degraded_mode === true && (runs['degraded-supply'].summary.degraded_reason || '').indexOf('供应链') >= 0);
t('C5 degraded-incomplete 裁定 insufficient + degraded=true + 原因含不完整', runs['degraded-incomplete'].summary && runs['degraded-incomplete'].summary.verdict === 'insufficient' && runs['degraded-incomplete'].summary.degraded_mode === true && (runs['degraded-incomplete'].summary.degraded_reason || '').indexOf('不完整') >= 0);
t('C6 三场景实跑与 definition.expect 一致', SCENARIOS.every(s => runs[s].summary && runs[s].summary.verdict === defs[s].expect.overall_verdict && runs[s].summary.degraded_mode === defs[s].expect.degraded_mode));
const listR = spawnSync(process.execPath, [CLI, 'demo', '--list'], { encoding: 'utf8', timeout: 60000 });
t('C7 demo --list 列出三场景', listR.status === 0 && SCENARIOS.every(s => listR.stdout.indexOf(s) >= 0));
const defR = spawnSync(process.execPath, [CLI, 'demo', '--out', join(tmp, 'run-default')], { encoding: 'utf8', timeout: 120000 });
t('C8 demo 默认 scenario = happy-path', defR.status === 0 && JSON.parse(defR.stdout.trim()).scenario === 'happy-path');
const badR = spawnSync(process.execPath, [CLI, 'demo', '--scenario', 'nope'], { encoding: 'utf8', timeout: 60000 });
t('C9 未知 scenario 显式拒绝（exit 2 + DEMO-SCENARIO-UNKNOWN）', badR.status === 2 && badR.stderr.indexOf('DEMO-SCENARIO-UNKNOWN') >= 0);

// ---------- D. 披露块契约（与 #38 preview_disclosure 同一契约面） ----------
const side = json(join(runs['happy-path'].outDir, 'report.json'));
const pd = side.preview_disclosure;
t('D1 侧车 preview_disclosure 字段集 = 四字段同一契约（capability_label/calibration_scope/structural_limitations/not_in_preview）', JSON.stringify(Object.keys(pd).sort()) === JSON.stringify(['calibration_scope', 'capability_label', 'not_in_preview', 'structural_limitations'].sort()));
const genTs = readFileSync(join(ENG, 'src', 'report', 'generate.ts'), 'utf8');
t('D2 generate.ts PreviewDisclosure 接口未改（同一契约源无双抄）', genTs.indexOf('export interface PreviewDisclosure') >= 0 && genTs.indexOf('capability_label: string') >= 0 && genTs.indexOf('calibration_scope: string') >= 0);
t('D3 印记① calibration_scope = "fixture: synthetic (generated by fixture-generator@1.0.0)"', pd.calibration_scope === 'fixture: synthetic (generated by fixture-generator@1.0.0)', pd.calibration_scope);
t('D4 印记② capability_label = "capability 1 of 5 · preview"', pd.capability_label === 'capability 1 of 5 · preview');
t('D5 印记③ limitations 首项 "not an audit of any real repository"', pd.structural_limitations.some(x => x.indexOf('not an audit of any real repository') === 0));
t('D6 印记④ limitations 含 "supply-chain: ⚠ unverified"', pd.structural_limitations.some(x => x.indexOf('supply-chain: ⚠ unverified') === 0));
t('D7 三场景侧车披露块同源齐备（降级不丢披露）', SCENARIOS.every(s => { const p = json(join(runs[s].outDir, 'report.json')).preview_disclosure; return p && p.capability_label === 'capability 1 of 5 · preview' && p.calibration_scope.indexOf('fixture: synthetic') === 0; }));
t('D8 markdown 报告头披露块四印记渲染（preview 诚实对外可见）', SCENARIOS.every(s => { const md = readFileSync(join(runs[s].outDir, 'report.md'), 'utf8'); return md.indexOf('披露块') >= 0 && md.indexOf('capability 1 of 5 · preview') >= 0 && md.indexOf('fixture: synthetic') >= 0 && md.indexOf('⚠ unverified') >= 0; }));

// ---------- E. synthetic 诚实（合成数据不冒充真实审计——D-038 硬契约） ----------
t('E1 subject_ref 以 fixture- 署名（合成语料身份机检）', SCENARIOS.every(s => json(join(runs[s].outDir, 'report.json')).subject_ref.indexOf('fixture-') === 0));
t('E2 报告 headline/markdown 明记 not an audit of any real repository', SCENARIOS.every(s => readFileSync(join(runs[s].outDir, 'report.md'), 'utf8').indexOf('not an audit of any real repository') >= 0));
t('E3 strategy 象限 conflict_markers 带 synthetic-fixture', side.quadrants.find(q => q.quadrant === 'strategy').conflict_markers.indexOf('synthetic-fixture') >= 0);
t('E4 degraded 报告 receipt.degraded=true + ⚠ unverified 印记', SCENARIOS.filter(s => s !== 'happy-path').every(s => { const j = json(join(runs[s].outDir, 'report.json')); return j.receipt.degraded === true && j.receipt.mark.indexOf('⚠ unverified') >= 0; }));
t('E5 测量工件 synthetic=true + generator 印记', SCENARIOS.every(s => { const m = json(join(runs[s].outDir, 'demo-measurements.json')); return m.synthetic === true && m.generator === 'fixture-generator@1.0.0'; }));
t('E6 骨架 C1-C4 章序锁定（降级不改骨架 ADR-0006）', SCENARIOS.every(s => { const md = readFileSync(join(runs[s].outDir, 'report.md'), 'utf8'); const ids = (md.match(/^## C\d /gm) || []).map(x => x.slice(3, 5)); return JSON.stringify(ids) === JSON.stringify(['C1', 'C2', 'C3', 'C4']); }));

// ---------- F. intake 本地腿 + 跑完即弃 ----------
t('F1 三场景 intake_kind=local（同一 Repo Intake 本地路径 D-013）', SCENARIOS.every(s => runs[s].summary.intake_kind === 'local'));
t('F2 测量工件 intake 纪律位（shallow=false + full_depth + remote_config_execution=disabled）', SCENARIOS.every(s => { const i = json(join(runs[s].outDir, 'demo-measurements.json')).intake; return i.kind === 'local' && i.shallow === false && i.full_depth_verified === true && i.remote_config_execution === 'disabled'; }));
t('F3 跑完即弃：temp_discarded=true + 工件内无临时仓绝对路径泄漏', SCENARIOS.every(s => runs[s].summary.temp_discarded === true) && SCENARIOS.every(s => { const md = readFileSync(join(runs[s].outDir, 'report.md'), 'utf8'); return md.indexOf('macro-audit-demo-') < 0; }));
t('F4 工件内 git 仓结构实物：merge/分支/tag 计数在测量件', SCENARIOS.every(s => { const m = json(join(runs[s].outDir, 'demo-measurements.json')); return m.commit_count > 0 && Array.isArray(m.branches) && m.branches.length >= 1 && Array.isArray(m.tags); }) && json(join(runs['happy-path'].outDir, 'demo-measurements.json')).merge_commits >= 1);

// ---------- G. golden 逐字节 diff（fixture 确定性 → #43 消费面） ----------
t('G1 实跑产物与 golden 逐字节一致（report.md/report.json/measurements/facts ×3 场景）', SCENARIOS.every(s => GOLDEN_FILES.every(f => readFileSync(join(runs[s].outDir, f), 'utf8') === readFileSync(join(GOLDEN, s, f), 'utf8'))));
t('G2 manifest 裁定/receipt 与实跑一致', SCENARIOS.every(s => manifest.scenarios[s].verdict === runs[s].summary.verdict && manifest.scenarios[s].receipt_id === runs[s].summary.receipt_id));
const genScript = join(ENG, 'scripts', 'gen-demo-golden.mjs');
t('G3 重渲染脚本在位（#43 CI diff 入口）+ 引用同一 runDemo 管线', existsSync(genScript) && readFileSync(genScript, 'utf8').indexOf('runDemo') >= 0);

// ---------- H. 文档与账本落文 ----------
const issue = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'issues', '45-demo-entry.md'), 'utf8');
t('H1 issue#45 在位且状态回写 done', issue.indexOf('done') >= 0);
t('H2 handoff + prompt 三件套齐备', existsSync(join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '45-demo-entry.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'prompts', '45-demo-entry.md')));
const archLedger = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'), 'utf8');
t('H3 A-050 账本行在位（R6 登记段）', archLedger.indexOf('A-050') >= 0 && archLedger.indexOf('R6-02') >= 0);
const wf = readFileSync(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'), 'utf8');
t('H4 WORKFLOW §4 lessons 含 #45 演示入口条目', /#45|45.*演示|fixture.*demo|demo.*fixture/.test(wf), 'no 45 lesson');
const nextRound = readFileSync(join(REPO, '.scratch', 'macro-audit', 'handoffs', 'next-round.md'), 'utf8');
t('H5 next-round 含 #45 落点记录（T5/进度块）', nextRound.indexOf('#45') >= 0 || nextRound.indexOf('demo') >= 0);
t('H6 45-report.md 在位且六段齐备', existsSync(join(HERE, '45-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(m => readFileSync(join(HERE, '45-report.md'), 'utf8').indexOf(m) >= 0));
const maReport = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
t('H7 macro-audit 日报含 #45 窗口节', existsSync(maReport) && readFileSync(maReport, 'utf8').indexOf('#45') >= 0);
const reg = json(join(HERE, '33-gate-registry.json'));
t('H8 registry 25-D4 演示入口行 = decided→D-038（触发面已闭合登记）', reg.items.some(i => i.id === '25-D4' && i.status === 'decided' && i.decision === 'D-038'));

rmSync(tmp, { recursive: true, force: true });

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
