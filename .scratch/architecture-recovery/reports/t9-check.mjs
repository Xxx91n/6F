// t9-check.mjs — 轮 14 T9 D-025 勘误双读数纪律呈报守卫（A-062）
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const AR = join(REPO, '.scratch', 'architecture-recovery');
let pass = 0, fail = 0;
function t(n, ok, d) { if (ok) { pass++; console.log('PASS '+n); } else { fail++; console.log('FAIL '+n+(d?' :: '+d:'')); } }

const dr = existsSync(join(HERE,'27-dual-readings.md')) ? readFileSync(join(HERE,'27-dual-readings.md'),'utf8') : '';
const led = readFileSync(join(AR,'decision-ledger.md'),'utf8');

// A. 双读数并存（D-025③：原 RED 不撤回 + 修正读数勘误并列）
t('A1 27-dual-readings.md 在（erratum 八节结构）', dr.length>0 && dr.includes('新旧并列结果表'));
t('A2 原读数 v1=0.2462 RED 保留不撤（dated measurement 标注）', dr.includes('0.2462') && dr.includes('dated measurement') && dr.includes('保留不撤'));
t('A3 修正读数 v2=0.5846 为 reportable value', dr.includes('0.5846') && dr.includes('reportable value'));
t('A4 逐格 delta 表 65 cells 标注', dr.includes('65') && dr.includes('delta'));
t('A5 verdict 方向不变声明（RED 维持＋归因收窄）', dr.includes('RED') && dr.includes('结论变更声明'));

// B. 账本成对动作（原读数标 invalid + 修正读数成 reportable value，原文不改写）
const di = led.indexOf('disposition 补记');
t('B1 C 裁定节 disposition 补记在（CAPA reopen）', di>0 && led.includes('CAPA reopen'));
t('B2 成对动作措辞：原读数保留不撤＋修正读数 reportable', led.includes('原读数保留不撤') && led.includes('修正读数成为 reportable value'));
t('B3 原裁定 supported 逐字保留（2026-09-13T10:49:04.195Z 时间戳不改写）', led.includes('supported') && led.includes('2026-09-13T10:49:04.195Z'));
t('B4 量测误差归因 AC-26-1~5 登记在案', led.includes('AC-26-1') && led.includes('AC-26-2'));
t('B5 真实缺失 33 格清零注记（#28 治理卫生）', led.includes('33 格') && led.includes('清零'));

// C. 证据链工件
t('C1 26-truth-table.json 真值表在', existsSync(join(HERE,'26-truth-table.json')));
t('C2 27-dual-readings.json 机读双读数在', existsSync(join(HERE,'27-dual-readings.json')));
t('C3 28-check.mjs 治理清零守卫在', existsSync(join(HERE,'28-check.mjs')));

// D. 呈报文档
t('D1 A-062 行在且标 implemented', led.includes('| A-062 |') && new RegExp('\\| A-062 \\|[^\\n]*implemented').test(led));
t('D2 日报含 T9', (existsSync(join(REPO,'.scratch','macro-audit','reports','2026-09-17-report.md'))?readFileSync(join(REPO,'.scratch','macro-audit','reports','2026-09-17-report.md'),'utf8'):'').includes('T9'));
t('D3 WORKFLOW lessons 含 T9', readFileSync(join(AR,'WORKFLOW.md'),'utf8').includes('T9'));

// E. BOM
const allF=[join(HERE,'t9-check.mjs'),join(HERE,'27-dual-readings.md'),join(AR,'decision-ledger.md')];
t('E1 全部相关文件无 BOM', allF.every(f=>{const b=readFileSync(f);return !(b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF);}));

console.log('---');
console.log(fail===0?'PASS '+pass+'/'+(pass+fail):'FAIL '+fail+'/'+(pass+fail));
process.exit(fail===0?0:1);
