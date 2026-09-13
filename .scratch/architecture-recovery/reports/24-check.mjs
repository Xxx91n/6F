// 守卫：24 缺口回流实测锚清扫（A-028 / spec §R3-D6）
// 用法：node .scratch/architecture-recovery/reports/24-check.mjs
// 约定：零新增依赖；只跑轻量 node 断言（构建/测试一律 CI）；退出码 0 = PASS。

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const R = (f) => join(HERE, f);

const PROMPT = R('24-atomcode-prompt.md');
const RESEARCH = R('24-atomcode-research.md');
const MAP = R('24-calibration-map.md');
const LEDGER = join(REPO, '.scratch', 'architecture-recovery', 'decision-ledger.md');
const WORKFLOW = join(REPO, '.scratch', 'architecture-recovery', 'WORKFLOW.md');
const GAP_SRC = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-12-report.md');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

// 既有 16 项缺口编号全集（macro-audit 2026-09-12-report.md §12：D-012×5 + D-013×4 + R2Q7×8，其中 R2Q7-6 性质变化吸收 → 16 active）
const KNOWN = new Set([
  'D-012-1','D-012-2','D-012-3','D-012-4','D-012-5',
  'D-013-1','D-013-2','D-013-3','D-013-4',
  'R2Q7-1','R2Q7-2','R2Q7-3','R2Q7-4','R2Q7-5','R2Q7-6','R2Q7-7','R2Q7-8'
]);
const ACTIVE = new Set([...KNOWN].filter((x) => x !== 'R2Q7-6'));

// ---- C1 三件套落盘且非空 ----
[['C1a', PROMPT, 500], ['C1b', RESEARCH, 8000], ['C1c', MAP, 1000]].forEach(function (e) {
  const ok = existsSync(e[1]) && Buffer.byteLength(readFileSync(e[1], 'utf8'), 'utf8') > e[2];
  check(e[0], ok, e[1].split('reports')[1] + ' bytes=' + (existsSync(e[1]) ? Buffer.byteLength(readFileSync(e[1], 'utf8'), 'utf8') : 0));
});

const research = readFileSync(RESEARCH, 'utf8');
const map = readFileSync(MAP, 'utf8');
const ledger = readFileSync(LEDGER, 'utf8');
const workflow = readFileSync(WORKFLOW, 'utf8');
const gapSrc = readFileSync(GAP_SRC, 'utf8');

// ---- C2 调研报告两轮齐备（轮1 先例 / 轮2 多仓复核）----
['CodeScene', 'GitClear', 'SonarQube', 'Structure101'].forEach(function (k, i) {
  check('C2' + 'abcd'[i], research.indexOf(k) >= 0, 'research contains ' + k);
});
['Just', 'Papadakis', 'ISO 13528', 'ICH E10', 'OWASP'].forEach(function (k, i) {
  check('C3' + 'abcde'[i], research.indexOf(k) >= 0, 'research contains ' + k);
});

// ---- C4 必备小节：执行摘要 / 对比矩阵 / 冲突点名 / 心智模型≥2 / 信息缺口 / 来源清单 / Sufficiency Gate ----
const sections = ['执行摘要', '对比矩阵', '冲突点名', '心智模型', '信息缺口', '来源清单', 'Sufficiency Gate', '多仓复核计划', '校准输入'];
sections.forEach(function (s, i) { check('C4' + String(i).padStart(2, '0'), research.indexOf(s) >= 0, 'research section: ' + s); });

// ---- C5 来源可回查：URL 计数 ≥ 20（15+13 源）----
const urlCount = (research.match(/https?:\/\/|[a-z0-9.-]+\.(com|org|io|de|net|se|edu)\//gi) || []).length;
check('C5', urlCount >= 20, 'url-like refs=' + urlCount);

// ---- C6 类比 ≥2（综合段 A 表行数）----
const secA = research.split('心智模型/类比映射')[1] || '';
const analogyRows = (secA.match(/\|\s*\d+\s*\|/g) || []).length;
check('C6', analogyRows >= 2, 'analogy rows=' + analogyRows);

// ---- C7 登记表全集：17 编号全部出现、active=16 声明在文 ----
const missing = [...KNOWN].filter((k) => map.indexOf(k) < 0);
check('C7a', missing.length === 0, 'missing gap ids: ' + JSON.stringify(missing));
check('C7b', /16\s*项/.test(map) && map.indexOf('R2Q7-6') >= 0 && /性质变化/.test(map), 'active-16 declared + R2Q7-6 marked nature-changed');

// ---- C8 CI 行只指向既有编号（不新造缺口）----
const ciRows = map.split('\n').filter((l) => /\|\s*CI-\d+/.test(l));
const ciRefs = ciRows.flatMap((l) => (l.match(/D-012-\d|D-013-\d|R2Q7-\d/g) || []));
const badRefs = ciRefs.filter((r) => !KNOWN.has(r));
check('C8a', ciRows.length >= 1, 'CI rows=' + ciRows.length);
check('C8b', badRefs.length === 0 && ciRefs.length >= ciRows.length, 'CI gap refs all in KNOWN set; bad=' + JSON.stringify(badRefs));
// 新造缺口扫描：映射文件内出现的「形似编号」都必须属于 KNOWN 或 CI-d 或既有 A-NNN/D-NNN 决策号
const suspicious = (map.match(/\b(GAP|IG|G)-\d{1,3}\b|缺口[-#]\d+/g) || []);
check('C8c', suspicious.length === 0, 'no invented gap ids: ' + JSON.stringify(suspicious));

// ---- C9 边界声明：校准输入不改写首报 / 不阻塞 ----
check('C9a', /不改写首报/.test(map) && /不阻塞首报/.test(map), 'map boundary clauses present');
check('C9b', /不改写首报/.test(research) && /不阻塞/.test(research), 'research boundary clauses present');
// 首报判定原文未被改写声明仍在（TC-1/TC-2/TC-3 + supported 原样引用）
check('C9c', /TC-2\s*RED/.test(map) && /supported/.test(map), 'map cites first-report verdicts verbatim without rewriting');

// ---- C10 缺口来源可解析：登记表引用的 §12.5 在 macro-audit 报告真实存在 ----
check('C10', /D-012\s*5\s*\+\s*D-013\s*4/.test(gapSrc) && /16\s*项/.test(gapSrc), 'gap source 2026-09-12-report.md §12.5 verified');

// ---- C11 ledger A-028 回写 done ----
const a028 = ledger.split('\n').find((l) => /\|\s*A-028\s*\|/.test(l)) || '';
check('C11', /done/.test(a028) && /票\s*#24/.test(a028) && /implemented/.test(a028), 'ledger A-028 status=' + (a028.slice(-160) || 'MISSING'));

// ---- C12 WORKFLOW §4 lessons 追加 1 行（2026-09-14 + #24）----
const wRow = workflow.split('\n').filter((l) => /^\|\s*2026-09-14/.test(l) && /#24|A-028/.test(l));
check('C12', wRow.length >= 1, 'WORKFLOW lesson rows for #24=' + wRow.length);

// ---------- 汇总 ----------
let failed = 0;
for (const r of results) {
  if (!r[1]) { failed = failed + 1; }
  console.log((r[1] ? 'PASS' : 'FAIL') + ' ' + r[0] + ' — ' + r[2]);
}
console.log('----');
console.log(results.length + ' checks, ' + (results.length - failed) + ' pass, ' + failed + ' fail');
if (failed > 0) { process.exit(1); }
console.log('24-check: PASS (exit 0)');
process.exit(0);
