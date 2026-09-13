// 守卫：25 铺开与分发收尾（A-030 / spec §R3-D7）
// 用法：node .scratch/architecture-recovery/reports/25-check.mjs
// 约定：零新增依赖；只跑轻量 node 断言（构建/测试一律 CI）；退出码 0 = PASS。

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const NL = String.fromCharCode(10);
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const R = (f) => join(HERE, f);

const PROMPT = R('25-atomcode-prompt.md');
const RESEARCH = R('25-atomcode-research.md');
const CHECKLIST = R('25-rollout-checklist.md');
const REPORT = R('25-report.md');
const LEDGER = join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md');
const WORKFLOW = join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md');
const BACKLOG = join(REPO, '.scratch', 'architecture-recovery', 'BACKLOG.md');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }
const L = (s) => s.split(NL);
const firstCell = (l) => { const c = l.split('|')[1]; return c === undefined ? '' : c.trim(); };
const isDigit = (ch) => ch >= '0' && ch <= '9';
const isRowId = (id) => (id.length >= 2 && 'BPD'.indexOf(id[0]) >= 0 && isDigit(id[1]) && (id.length === 2 || id[2] === '.' || isDigit(id[2]))) || id.indexOf('B5-') === 0;

// ---- C1 五件套落盘且非空 ----
[['C1a', PROMPT, 500], ['C1b', RESEARCH, 8000], ['C1c', CHECKLIST, 3000], ['C1d', REPORT, 1500]].forEach(function (e) {
  const ok = existsSync(e[1]) && Buffer.byteLength(readFileSync(e[1], 'utf8'), 'utf8') > e[2];
  check(e[0], ok, e[1].split('reports')[1] + ' bytes=' + (existsSync(e[1]) ? Buffer.byteLength(readFileSync(e[1], 'utf8'), 'utf8') : 0));
});

const research = readFileSync(RESEARCH, 'utf8');
const checklist = readFileSync(CHECKLIST, 'utf8');
const report = readFileSync(REPORT, 'utf8');
const ledger = readFileSync(LEDGER, 'utf8');
const workflow = readFileSync(WORKFLOW, 'utf8');
const backlog = readFileSync(BACKLOG, 'utf8');

// ---- C2 调研报告必备小节 + 类比>=2 + 可回查来源>=10 ----
['执行摘要', '对比矩阵', '冲突点名', '心智模型', '信息缺口', '来源清单', 'Sufficiency Gate', '校准输入'].forEach(function (s, i) {
  check('C2' + String(i).padStart(2, '0'), research.indexOf(s) >= 0, 'research section: ' + s);
});
const secA = research.split('心智模型/类比映射')[1] || '';
const analogyRows = L(secA).filter(function (l) { return l.trim().charAt(0) === '|' && isDigit(firstCell(l).charAt(0)); }).length;
check('C2a', analogyRows >= 2, 'analogy rows=' + analogyRows);
const urlCount = ['.com/', '.org/', '.io/', '.net/', '.edu/', '.de/', '.se/'].reduce(function (n, t) { return n + research.split(t).length - 1; }, 0);
check('C2b', urlCount >= 10, 'url-like refs=' + urlCount);

// ---- C3 清单每行动作项带「待用户拍板」（B4.1 行豁免，走 C4）----
const actionRows = L(checklist).filter(function (l) {
  return l.trim().charAt(0) === '|' && isRowId(firstCell(l)) && l.indexOf('B4.1') < 0;
});
const unmarked = actionRows.filter(function (l) { return l.indexOf('待用户拍板') < 0; });
check('C3a', actionRows.length >= 20, 'action rows=' + actionRows.length);
check('C3b', unmarked.length === 0, 'rows missing 待用户拍板: ' + JSON.stringify(unmarked.map(function (l) { return l.slice(0, 30); })));

// ---- C4 B4.1 一行带过：全文恰 1 次 + 含「已被 D-015 取代」+ 无独立小节 ----
const b41count = checklist.split('B4.1').length - 1;
const b41line = L(checklist).find(function (l) { return l.indexOf('B4.1') >= 0; }) || '';
check('C4a', b41count === 1, 'B4.1 occurrences=' + b41count);
check('C4b', b41line.indexOf('已被 D-015 取代') >= 0 && b41line.indexOf('不立项') >= 0, 'B4.1 row marker');
check('C4c', !L(checklist).some(function (l) { return l.trim().charAt(0) === '#' && l.indexOf('B4.1') >= 0; }), 'no dedicated B4.1 heading');

// ---- C5 零实施：违禁执行声明扫描 + 零实施声明在文 ----
const forbid = ['已上架', '已推送', '已发布插件', '上架完成', 'push 已执行', '已立票', '已创建立票', '已删除 e-branch'];
const hit = forbid.filter(function (w) { return checklist.indexOf(w) >= 0 || report.indexOf(w) >= 0; });
check('C5a', hit.length === 0, 'forbidden exec claims: ' + JSON.stringify(hit));
check('C5b', checklist.indexOf('零实施') >= 0 && report.indexOf('不实施任何上架或 push') >= 0, 'zero-impl declarations present');

// ---- C6 每项前置条件可执行判定（能/不能/需什么）----
const noJudg = actionRows.filter(function (l) { const c = l.split('|')[3] || ''; return c.indexOf('能') < 0; });
const noNeed = actionRows.filter(function (l) { return l.indexOf('需') < 0; });
check('C6a', noJudg.length === 0, 'rows missing 能/不能 judgment: ' + JSON.stringify(noJudg.map(function (l) { return l.slice(0, 30); })));
check('C6b', noNeed.length === 0, 'rows missing 需什么: ' + JSON.stringify(noNeed.map(function (l) { return l.slice(0, 30); })));

// ---- C7 BACKLOG 编号全覆盖 ----
const backlogIds = [];
L(backlog).forEach(function (l) { l.split(/[^A-Za-z0-9.-]+/).forEach(function (tok) { if (isRowId(tok) && tok.indexOf('.') > 0 && backlogIds.indexOf(tok) < 0) backlogIds.push(tok); }); });
const missingIds = backlogIds.filter(function (id) { return checklist.indexOf(id) < 0; });
check('C7a', backlogIds.length >= 10, 'backlog ids found=' + backlogIds.length + ' ' + backlogIds.join(','));
check('C7b', missingIds.length === 0, 'backlog ids missing in checklist: ' + JSON.stringify(missingIds));

// ---- C8 ledger A-030 回写 done + implemented ----
const a30 = L(ledger).find(function (l) { return firstCell(l) === 'A-030'; }) || '';
check('C8a', a30.indexOf('done') >= 0 && a30.indexOf('票 #25') >= 0, 'A-030 done marker');
check('C8b', a30.indexOf('implemented') >= 0 && a30.indexOf('2026-09-14') >= 0, 'A-030 implemented marker');
check('C8c', a30.indexOf('未开工') < 0, 'A-030 deferred cleared');

// ---- C9 WORKFLOW §4 lessons 追加 1 行 ----
const wrows = L(workflow).filter(function (l) { return l.trim().indexOf('| 2026-09-14') === 0; });
check('C9a', wrows.some(function (l) { return l.indexOf('#25') >= 0; }), 'WORKFLOW lesson row for #25, rows today=' + wrows.length);

// ---- C10 报告四要件 + commit msg 引用 A-030 ----
['完成定义', '阻塞', 'lessons', '引用文件'].forEach(function (s, i) {
  check('C10' + 'abcd'[i], report.indexOf(s) >= 0, 'report section: ' + s);
});
check('C10e', report.indexOf('25: close A-030') >= 0, 'commit msg references A-030');

// ---- 汇总 ----
let fail = 0;
results.forEach(function (r) { if (!r[1]) fail++; console.log((r[1] ? 'PASS' : 'FAIL') + ' ' + r[0] + ' — ' + r[2]); });
console.log('----');
console.log(fail === 0 ? 'PASS ' + results.length + '/' + results.length : 'FAIL ' + fail + '/' + results.length);
process.exit(fail === 0 ? 0 : 1);
