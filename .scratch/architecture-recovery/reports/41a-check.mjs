// 41a-check.mjs — #41a 分发收尾·仓内文档面守卫（R6-03 / A-051 / D-030·D-031·D-032·D-038·D-039·D-040）
// 断言面：票档三件套 → examples 四件齐+逐字节=原件+披露块字段 → README 节在+边界文案冻结源（不发明能力声明）
//   → 仓根 CHANGELOG M-键格式+固定字段行+区间实物反推一致 → 双账指针闭环 → 账本/报告落文 → BOM
// 纪律：只读断言（零写仓内状态）；exit 0 + PASS N/N 为绿。
// acceptance-probe: sealed 2026-09-18 D-073 — C10（attestation=acceptance-probe-attestation.jsonl）
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const RPTS = join(REPO, '.scratch', 'architecture-recovery', 'reports');
const EX = join(REPO, 'examples', 'first-report');
const FOUR = ['23-first-report.md', '23-first-report.json', '23-first-report-failure.md', '23-first-report-failure.json'];

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function sealed(name, attId, note) { console.log('SEALED ' + name + ' | att=' + attId + (note ? ' | ' + note : '')); }
function txt(p) { return readFileSync(p, 'utf8'); }
function sha(p) { return createHash('sha256').update(readFileSync(p)).digest('hex'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. 票档三件套（R6 票据按 40 模板补立） ----------
const issueP = join(REPO, '.scratch', 'architecture-recovery', 'issues', '41a-distribution-docs.md');
const issue = existsSync(issueP) ? txt(issueP) : '';
t('A1 issue 41a 在且引 A-051＋拆分注记（D-040）', issue.indexOf('A-051') >= 0 && issue.indexOf('D-040') >= 0);
t('A2 handoff + prompt 三件套齐备', existsSync(join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '41a-distribution-docs.md')) && existsSync(join(REPO, '.scratch', 'architecture-recovery', 'prompts', '41a-distribution-docs.md')));

// ---------- B. examples/first-report/ 四件＋披露 README（D-030） ----------
t('B1 四件名逐字落位 examples/first-report/', FOUR.every(f => existsSync(join(EX, f))));
t('B2 四件与 .scratch 原件逐字节一致（复制非移动）', FOUR.every(f => sha(join(EX, f)) === sha(join(RPTS, f))));
t('B3 .scratch 原件保留（溯源链未断）', FOUR.every(f => existsSync(join(RPTS, f))));
const exReadme = existsSync(join(EX, 'README.md')) ? txt(join(EX, 'README.md')) : '';
t('B4 披露四要素齐：真实产物声明＋生成 commit fc00d458＋日期 2026-09-13T14:31:09＋重生成命令 23-first-report.mjs', exReadme.indexOf('真实产物') >= 0 && exReadme.indexOf('fc00d458e215cc9a7a26af81626dec8712622821') >= 0 && exReadme.indexOf('2026-09-13T14:31:09') >= 0 && exReadme.indexOf('23-first-report.mjs') >= 0);
t('B5 冻结时点声明（不得读作当前读数）＋failure=degradeReport 演示性质如实注', exReadme.indexOf('不得被读作「当前读数」') >= 0 && exReadme.indexOf('degradeReport') >= 0 && exReadme.indexOf('不是一次真实采集事故') >= 0);
t('B6 preview_disclosure 时点差如实注（四件早于披露块契约，非缺失缺陷）', exReadme.indexOf('preview_disclosure') >= 0 && exReadme.indexOf('时点') >= 0);

// ---------- C. README 能力边界＋preview 标注＋0.x＋Try 节（D-031/D-032/D-038④；冻结决策唯一事实源） ----------
const readme = txt(join(REPO, 'README.md'));
t('C1 「capability 1 of 5 · preview」标注在（Macro-B，与披露块契约同一语义源）', readme.indexOf('capability 1 of 5 · preview') >= 0);
t('C2 「capability 2 of 5 · preview」标注在（Macro-C，与 #38 披露块印记一致）', readme.indexOf('capability 2 of 5 · preview') >= 0);
t('C3 未上架三层「Not yet in preview」标注＋Micro-A/Micro-B/Macro-A 逐名', readme.indexOf('Not yet in preview') >= 0 && ['Micro-A', 'Micro-B', 'Macro-A'].every(s => readme.indexOf(s) >= 0));
t('C4 build-scope ≠ release-sequence 划界＋ADR-0017 引用在', readme.indexOf('build-scope ≠ release-sequence') >= 0 && readme.indexOf('ADR-0017') >= 0);
t('C5 0.x 语义在（单调递增＋1.0 退出条件＋versioning.md 指针）', readme.indexOf('0.x') >= 0 && readme.indexOf('单调递增') >= 0 && readme.indexOf('退出条件') >= 0 && readme.indexOf('docs/versioning.md') >= 0);
t('C6 「Try on a real repository」节在', readme.indexOf('Try on a real repository') >= 0);
t('C7 opt-in 公共仓链接 open-gsd/gsd-core＋「外部内容随上游变化」标注', readme.indexOf('github.com/open-gsd/gsd-core') >= 0 && readme.indexOf('外部内容随上游变化') >= 0);
t('C8 样例引用指向公共路径 examples/first-report/（不链 .scratch 样例源）', readme.indexOf('examples/first-report/') >= 0 && readme.indexOf('.scratch/architecture-recovery/reports/23-first-report') < 0);
t('C9 不虚报可安装（发布未发生/不存在可安装 listing 声明在）', readme.indexOf('发布未发生') >= 0 && readme.indexOf('可安装 listing') >= 0);
sealed('C10', 'ap-41a-c10', 'superseded：41b-C1 现行口径强制 capability 3 of 5——旧互斥契约退役');
t('C11 状态注过期字段清除（不再含「尚未开始」旧态）', readme.indexOf('尚未开始') < 0);

// ---------- D. 仓根 CHANGELOG.md 编年首条（D-039②/ADR-0018 §D-2） ----------
const clP = join(REPO, 'CHANGELOG.md');
const cl = existsSync(clP) ? txt(clP) : '';
t('D1 仓根 CHANGELOG.md 在（W4 悬空指针闭环实体）', existsSync(clP));
t('D2 条目键格式 ## [M-xxx] - ISO日期 在', /## \[M-\d{3}\] - \d{4}-\d{2}-\d{2}/.test(cl));
t('D3 禁版本号头（无 ## [x.y.z] 形态——根除与 engine 版本竞争）', !/## \[\d+\.\d+\.\d+\]/.test(cl));
t('D4 固定字段行齐（milestone/adr_range/a_range/ledger_pointer/impact）', ['milestone:', 'adr_range:', 'a_range:', 'ledger_pointer:', 'impact:'].every(k => cl.indexOf(k) >= 0));
// 区间实物反推（写时读出，防写死漂移）
const adrs = readdirSync(join(REPO, 'docs', 'adr')).filter(f => /^\d{4}-/.test(f)).sort();
const adrMax = 'ADR-' + adrs[adrs.length - 1].slice(0, 4);
const aLedge = txt(join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md'));
const aIds = Array.from(new Set((aLedge.match(/\bA-\d{3}\b/g) || []))).sort();
const aMax = aIds[aIds.length - 1];
const dLedge = txt(join(REPO, '.scratch', 'macro-audit', 'decision-ledger.md'));
const dIds = Array.from(new Set((dLedge.match(/\bD-\d{3}\b/g) || []))).sort();
const dMax = dIds[dIds.length - 1];
t('D5 adr_range 与实物一致（ADR-0001 ~ ' + adrMax + '，docs/adr 实物 ' + adrs.length + ' 件）', cl.indexOf('ADR-0001 ~ ' + adrMax) >= 0, 'want ADR-0001 ~ ' + adrMax);
t('D6 a_range 与实物一致（A-001 ~ ' + aMax + '，账本实物唯一编号）', cl.indexOf('A-001 ~ ' + aMax) >= 0, 'want A-001 ~ ' + aMax);
t('D7 ledger_pointer 双账本实物路径在', cl.indexOf('.scratch/macro-audit/decision-ledger.md') >= 0 && cl.indexOf('.scratch/architecture-recovery/decision-ledger.md') >= 0 && cl.indexOf(dMax) >= 0);
t('D8 头部声明：仓级编年＋产品版本账以 engine/CHANGELOG.md 为准', cl.indexOf('仓级里程碑') >= 0 && cl.indexOf('engine/CHANGELOG.md') >= 0);

// ---------- E. 双账指针闭环（D-039②；W4 悬空指针清零） ----------
const ecl = txt(join(REPO, 'engine', 'CHANGELOG.md'));
t('E1 engine/CHANGELOG.md 反向指针指仓根 CHANGELOG.md', ecl.indexOf('CHANGELOG.md') >= 0 && ecl.indexOf('仓级') >= 0);
t('E2 指针闭环：engine 指针无「待 #41a 落盘」残留', ecl.indexOf('待 #41a 落盘') < 0);
t('E3 双账互指：仓根 CHANGELOG 指回 engine/CHANGELOG.md', cl.indexOf('engine/CHANGELOG.md') >= 0);

// ---------- F. 账本/文书落文 ----------
t('F1 A-051 账本行 done → implemented（2026-09-16）', /A-051[^\n]*done → implemented（2026-09-16）/.test(aLedge));
t('F2 issue 41a Status=done 且 checklist 全勾', /\*\*Status:\*\* done/.test(issue) && issue.indexOf('- [ ]') < 0);
const wf = txt(join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md'));
t('F3 WORKFLOW §4 lessons 含 #41a 条目', /#41a|41a.*分发收尾|分发收尾.*41a/.test(wf));
const nr = txt(join(REPO, '.scratch', 'macro-audit', 'handoffs', 'next-round.md'));
t('F4 next-round T6 行 ✅ DONE 且进度块含 #41a', /T6 分发收尾·仓内文档面（#41a\/R6-03[^）]*）✅ DONE 2026-09-16/.test(nr) && nr.indexOf('#41a') >= 0);
const bl = txt(join(REPO, '.scratch', 'architecture-recovery', 'BACKLOG.md'));
t('F5 BACKLOG #41a 行回写闭环', /#41a[^\n]*✅ 2026-09-16 已闭环/.test(bl));
const rep = existsSync(join(HERE, '41a-report.md')) ? txt(join(HERE, '41a-report.md')) : '';
t('F6 41a-report.md 在且六段齐备（①~⑥）', existsSync(join(HERE, '41a-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(m => rep.indexOf(m) >= 0));
t('F7 报告显式声明「上架动作未执行（用户闸门）」', rep.indexOf('上架动作未执行') >= 0 && rep.indexOf('用户闸门') >= 0);
const ma = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
t('F8 macro-audit 日报含 #41a 窗口节', existsSync(ma) && txt(ma).indexOf('#41a') >= 0);

// ---------- G. BOM（写入纪律） ----------
const newFiles = [
  join(EX, 'README.md'), clP, join(REPO, 'README.md'), join(REPO, 'engine', 'CHANGELOG.md'),
  issueP, join(REPO, '.scratch', 'architecture-recovery', 'handoffs', '41a-distribution-docs.md'),
  join(REPO, '.scratch', 'architecture-recovery', 'prompts', '41a-distribution-docs.md'),
  join(REPO, 'docs', 'decisions', 'README.md')
].concat(FOUR.map(f => join(EX, f)));
t('G1 全部新增/改动文件无 BOM', newFiles.every(noBom));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
