// 54-check.mjs —— #54 %cI 确定性修复守卫（D-059① / T1）
// 断言面：A=intake.ts enforce 位（normalizeGitIsoDate 导出＋归一规则＋严格断言＋GITCLI-OUTPUT-CONTRACT）
//   → B=demo.ts 两处 %cI 消费点全走归一化（无裸 %cI 直灌确定性链）
//   → C=golden-ci.yml 勘误声明（「非平台行为」过宽声明已更正：git 版本拼写漂移已归一化封口）
//   → D=upstream-lock.yaml git-cli 行点名 enforce 位
//   → E=engine/test/gitcli-contract.test.mjs 实跑 exit 0（11/11）＋接入 smoke 链
//   → F=golden 逐字节无漂：runDemo 重渲染 → 与入库 golden 逐字节 diff（本机 git 2.55 下归一化=恒等）
//   → G=存活对照脚本（39/40/48）%cI 消费点同样走归一化（对照口径与引擎一致，冻结史证 23/22/01 不动）
//   → H=本票新增/改动文件无 BOM
// 纪律：只读断言（临时目录渲染属工件产出非仓内状态改写）；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. enforce 位在 intake.ts ----------
const intake = txt(join(ENG, 'src', 'intake', 'intake.ts'));
t('A1 normalizeGitIsoDate 导出在', /export function normalizeGitIsoDate\(/.test(intake));
t('A2 +00:00→Z 归一规则在', intake.indexOf("replace(/\\+00:00$/") >= 0 && intake.indexOf("'Z'") >= 0);
t('A3 严格 ISO 形状断言（Z 或 ±HH:MM 秒精度）在', /GIT_ISO_STRICT_RE = \/\^\\d\{4\}-/.test(intake));
t('A4 形状违例抛 GITCLI-OUTPUT-CONTRACT（不静默放行）', intake.indexOf('GITCLI-OUTPUT-CONTRACT') >= 0);

// ---------- B. %cI 消费点全走归一化（#53 提炼后位在 audit/macro-b.ts——demo 经共享链同消费） ----------
const demo = txt(join(ENG, 'src', 'demo', 'demo.ts'));
const mb = txt(join(ENG, 'src', 'audit', 'macro-b.ts'));
t('B1 demo.ts 经共享链消费归一化（probeMacroBRepo 从 audit/macro-b.js 导入）', demo.indexOf("from '../audit/macro-b.js'") >= 0 && demo.indexOf('probeMacroBRepo') >= 0);
t('B2 macro-b.ts HEAD_DATE 走归一化', mb.indexOf("normalizeGitIsoDate(git(repoRoot, ['log', '-1', '--format=%cI']))") >= 0);
t('B3 macro-b.ts 逐 commit date 走归一化（rawLog 解析行）', mb.indexOf('date: normalizeGitIsoDate(parts[2])') >= 0);
const ciCount = (mb.match(/--format=%cI|\|%cI/g) || []).length;
const ciDemo = (demo.match(/--format=%cI|\|%cI/g) || []).length;
t('B4 macro-b.ts %cI 调用点恰 2 处全归一化 + demo.ts 无裸 %cI 调用残留（消费点单源在管线模块）', ciCount === 2 && ciDemo === 0, 'mb=' + ciCount + ' demo=' + ciDemo);

// ---------- C. golden-ci.yml 勘误声明 ----------
const gci = txt(join(REPO, '.github', 'workflows', 'golden-ci.yml'));
t('C1 勘误块在（2026-09-17 / #54 / D-059①）', gci.indexOf('勘误（2026-09-17 / #54 / D-059①）') >= 0);
t('C2 勘误如实记漂移性质=工具版本漂移非平台漂移', gci.indexOf('工具版本漂移') >= 0 && gci.indexOf('2.45') >= 0);
t('C3 单平台裁定维持声明在（归一化封口后矩阵仍不产生新信号）', gci.indexOf('单平台裁定维持') >= 0);

// ---------- D. upstream-lock.yaml git-cli 行点名 enforce 位 ----------
const lock = txt(join(ENG, 'upstream-lock.yaml'));
const gitRow = lock.split('\n').filter(function (l) { return l.indexOf('git-cli') >= 0; }).join('\n') + lock.match(/id: git-cli[\s\S]*?(?=\n  - id:|$)/)[0];
t('D1 git-cli 行 contract 点名 normalizeGitIsoDate enforce 位', gitRow.indexOf('normalizeGitIsoDate') >= 0 && gitRow.indexOf('GITCLI-OUTPUT-CONTRACT') >= 0);

// ---------- E. 单测实跑 + smoke 链接入 ----------
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('E1 gitcli-contract.test.mjs 接入 smoke 链', pkg.scripts.smoke.indexOf('gitcli-contract.test.mjs') >= 0);
let gt = null;
try { gt = execFileSync('node', [join(ENG, 'test', 'gitcli-contract.test.mjs')], { encoding: 'utf8' }); } catch (e) { gt = (e.stdout || '') + (e.stderr || ''); }
t('E2 gitcli 契约单测 exit 0 + 全 PASS', /GITCLI-CONTRACT (\d+)\/\1/.test(gt || '') && (gt || '').indexOf('FAIL ') < 0, (gt || '').split('\n').slice(-1)[0]);

// ---------- F. golden 逐字节无漂（重渲染→逐字节 diff） ----------
const D = await import(pathToFileURL(join(ENG, 'dist', 'demo', 'demo.js')).href);
const GOLD = join(ENG, 'fixtures', 'golden');
const tmp = mkdtempSync(join(tmpdir(), 'r16-54check-'));
let fAll = true, fDetail = [];
for (const sc of D.DEMO_SCENARIOS) {
  const dir = join(tmp, sc);
  D.runDemo({ scenario: sc, outDir: dir });
  for (const f of ['report.md', 'report.json', 'demo-measurements.json', 'demo-facts.jsonl']) {
    const a = readFileSync(join(dir, f));
    const b = readFileSync(join(GOLD, sc, f));
    if (!a.equals(b)) { fAll = false; fDetail.push(sc + '/' + f); }
  }
}
t('F1 三场景重渲染与入库 golden 逐字节一致（归一化在本机 git 下=恒等，无回退漂移）', fAll, fDetail.join(','));
rmSync(tmp, { recursive: true, force: true });

// ---------- G. 存活对照脚本 %cI 消费同口径 ----------
for (const s of ['39-macro-b-one-shot.mjs', '40-macro-b-one-shot.mjs', '48-micro-a-preview.mjs']) {
  const src = txt(join(HERE, s));
  t('G-' + s + ' %cI 消费点走 normalizeGitIsoDate（与引擎同归一化，对照口径一致）', src.indexOf('normalizeGitIsoDate') >= 0 && src.indexOf('%cI') >= 0, 'normalize=' + (src.indexOf('normalizeGitIsoDate') >= 0));
}
t('G-冻结史证 23-first-report.mjs 不动（CI 物化自 e39468c 冻结 commit，改本件无意义且制造双源）', txt(join(HERE, '23-first-report.mjs')).indexOf('%cI') >= 0);

// ---------- H. BOM ----------
const nbFiles = ['engine/src/intake/intake.ts', 'engine/test/gitcli-contract.test.mjs'].map(function (f) { return join(REPO, f); });
t('H1 本票新增/改动文件无 BOM', nbFiles.every(function (f) { return !existsSync(f) || noBom(f); }), nbFiles.filter(function (f) { return existsSync(f) && !noBom(f); }).join(','));

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
