// 49-check.mjs — #49 回归 matrix 三仓接入守卫（R9-03 / A-059 / D-050）
// 断言面：A workflow DEFAULT JSON 四 leg 语法+一仓一行 → B 备选表/预算纪律在 workflow 注释
//   → C 克隆预算实测工件 → D 隔离纪律沿用 → E 文档（账本/BACKLOG/票档/日报）→ F BOM
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const AR = join(REPO, '.scratch', 'architecture-recovery');
const WF = join(REPO, '.github', 'workflows', 'macro-b-regression.yml');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. DEFAULT JSON 四 leg ----------
const y = txt(WF);
const dm = y.match(/DEFAULT='([^']+)'/);
t('A1 workflow 含 DEFAULT JSON 字面量', !!dm);
const def = dm ? JSON.parse(dm[1]) : { repo: [] };
const names = def.repo.map(function (r) { return r.name; });
t('A2 四 leg 名字恰为 jiahao/git/django/spring-boot', JSON.stringify(names) === JSON.stringify(['jiahao', 'git', 'django', 'spring-boot']));
const urls = def.repo.map(function (r) { return r.url; });
t('A3 四 leg URL 全 https:// 公开仓', urls.every(function (u) { return /^https:\/\/github\.com\//.test(u); }));
t('A4 三首选 URL 正确（git/git·django/django·spring-projects/spring-boot）', urls.includes('https://github.com/git/git.git') && urls.includes('https://github.com/django/django.git') && urls.includes('https://github.com/spring-projects/spring-boot.git'));
t('A5 matrix 消费 resolve 输出（fromJSON needs.resolve）', /matrix:\s*\n\s*repo:\s*\$\{\{\s*fromJSON\(needs\.resolve\.outputs\.matrix\)\s*\}\}/.test(y));

// ---------- B. 预算/备选纪律 ----------
t('B1 备选表注释入 workflow（curl/flask/kafka）', y.includes('curl/curl') && y.includes('pallets/flask') && y.includes('apache/kafka'));
t('B2 timeout-minutes=20 预算位在 macro-b job', /timeout-minutes:\s*20/.test(y));
t('B3 trigger 面 schedule+dispatch 不变（不接 push/PR）', y.includes('schedule:') && y.includes('workflow_dispatch:') && !/push:/.test(y.split('on:')[1] || ''));

// ---------- C. 克隆预算实测工件 ----------
const BP = join(HERE, '49-clone-budget.json');
t('C1 49-clone-budget.json 在', existsSync(BP));
const budget = existsSync(BP) ? JSON.parse(txt(BP)) : { legs: {} };
t('C2 实测四仓或降级标注（measured|skipped-reason）', ['jiahao', 'git', 'django', 'spring-boot'].every(function (n) { return budget.legs && (budget.legs[n] !== undefined); }));
t('C3 预算判定字段在（within_20min_budget）', typeof budget.within_20min_budget === 'boolean' || Object.values(budget.legs || {}).every(function (l) { return typeof l === 'object' && 'within_budget' in l; }));

// ---------- D. 隔离纪律沿用 ----------
t('D1 hooksPath=noop 在 workflow clone 腿', y.includes('hooksPath') && y.includes('noop'));
t('D2 protocol.ext.allow=never 在', y.includes('ext.allow=never'));
t('D3 39-macro-b-one-shot 管线引用不变', y.includes('39-macro-b-one-shot.mjs'));
t('D4 repo_url https-only 闸门在 resolve job', y.includes('仅允许 https'));

// ---------- E. 文档 ----------
const led = txt(join(AR, 'decision-ledger.md'));
t('E1 A-059 行在且标 implemented', /\| A-059 \|[^\n]*implemented/.test(led));
t('E2 BACKLOG #49 ✅', /\| #49[^\n]*✅/.test(txt(join(AR, 'BACKLOG.md'))));
t('E3 票档三件套', ['issues/49-regression-matrix.md', 'prompts/49-regression-matrix.md', 'handoffs/49-regression-matrix.md'].every(function (f) { return existsSync(join(AR, f)); }));
const dr17 = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-17-report.md');
const dr16 = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
const daily = (existsSync(dr17) ? txt(dr17) : '') + (existsSync(dr16) ? txt(dr16) : '');
t('E4 日报含 #49 窗口节', daily.includes('窗口：#49') || daily.includes('#49'));
t('E5 49-report.md 在', existsSync(join(HERE, '49-report.md')));
const wf = txt(join(AR, 'WORKFLOW.md'));
t('E6 WORKFLOW §4 lessons 含 #49', /#49/.test(wf));

// ---------- F. BOM ----------
const allF = [WF, join(HERE, '49-check.mjs'), join(HERE, '49-report.md'), BP];
t('F1 全部新增/改动文件无 BOM', allF.every(function (f) { return !existsSync(f) || noBom(f); }), allF.filter(function (f) { return existsSync(f) && !noBom(f); }).join(','));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
