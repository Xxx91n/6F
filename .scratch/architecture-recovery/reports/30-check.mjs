// 30-check.mjs — R4-04 守卫：13 项清单齐备 + 置信域标注 + 待探针两字段 + 冻结数据零改动
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; } else { fail++; console.log('FAIL:', l); } };

const j = JSON.parse(fs.readFileSync(path.join(dir, '30-desk-calibration.json'), 'utf8'));
const WANT = [2,4,8,9,10,11,12,13,14,15,16,5,7];
ok(j.items.length === 13 && WANT.every(t => j.items.some(i => i.task === t)), 'A1 13 项齐备（11 desk + 5 锚行 + 7 单写者草案）');
ok(j.items.every(i => i.confidence && i.confidence.length > 0), 'A2 逐项置信域非空');
ok(j.items.filter(i => /单写者|多写者/.test(i.confidence)).length >= 3, 'A3 单写者域标注 ≥3（任务 2/4/7）');
ok(j.items.filter(i => i.task === 7).every(i => /单写者/.test(i.confidence) && /self-probe|多写者域登记/.test(i.draft)), 'A4 任务 7 单写者草案 + 多写者 self-probe 登记');
ok(j.items.filter(i => i.task === 5).every(i => /已锚/.test(i.draft)), 'A5 任务 5 已锚行');
let probeBad = 0;
for (const i of j.items) { if (i.probe && !(i.probe.satisfaction && i.probe.satisfaction.length > 0 && i.probe.review && i.probe.review.length > 0)) probeBad++; }
ok(probeBad === 0 && j.items.filter(i => i.probe).length === 10, 'A6 待探针占位 10 项全带「满足判据+复审时点」');
ok(j.items.every(i => i.draft && i.draft.length > 20), 'A7 逐项草案非空');
const md = fs.readFileSync(path.join(dir, '30-desk-calibration.md'), 'utf8');
ok(md.includes('置信域') && md.includes('满足判据') && md.includes('复审时点'), 'B1 md 表头两字段纪律出现');
// C. 冻结数据 + 上游零改动
const dirty = spawnSync('git', ['status', '--porcelain', '--', '.scratch/architecture-recovery/reports/23-measurements.json', '.scratch/architecture-recovery/reports/23-facts.jsonl', '.scratch/architecture-recovery/reports/23-first-report.json', '.scratch/architecture-recovery/reports/23-first-report.md', 'engine', 'docs/adr'], { cwd: root, encoding: 'utf8' }).stdout.trim();
ok(dirty === '', 'C1 冻结数据/engine/docs-adr 零改动（本票纯 desk）');

console.log('\nGUARD RESULT:', fail === 0 ? 'PASS' : 'FAIL', '(' + pass + ' pass, ' + fail + ' fail)');
process.exit(fail === 0 ? 0 : 1);
