// 29-check.mjs — T4 守卫：C 裁定原文不可变 + disposition 追加 + 双读数口径
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; } else { fail++; console.log('FAIL:', l); } };

const l = fs.readFileSync(path.join(root, '.scratch/architecture-recovery/decision-ledger.md'), 'utf8');
// A. 原裁定行不可变（逐字断言）
ok(l.includes('| 用户裁定原文（逐字） | supported 。 |'), 'A1 人裁定原文逐字保留');
ok(l.includes('2026-09-13T10:49:04.195Z'), 'A2 原时间戳未改');
ok(l.includes('| 规则推导（参照） | unsupported（TC-2 RED 主导，per 22-c-adjudication-basis B2） |'), 'A3 规则推导原文保留');
// B. disposition 存在且位于 C 裁定节内（张力记录行之后、下一个 ## 之前）
const iT = l.indexOf('| 张力记录 |');
const iD = l.indexOf('### disposition 补记（2026-09-15，票 #29');
const iNext = l.indexOf('\n## ', iT);
ok(iD > iT && iD < iNext, 'B1 disposition 追加在 C 裁定节内、原表之后');
ok(l.includes('CAPA reopen') && l.includes('原文与时间戳不改写'), 'B2 reopen 性质声明');
ok(l.includes('0.2462 RED') && l.includes('0.5846 RED'), 'B3 双读数并列（原+修正）');
ok(l.includes('invalid') && l.includes('reportable value'), 'B4 成对动作措辞（invalid + reportable value）');
ok(l.includes('证据链') && l.includes('26-truth-table.json') && l.includes('27-dual-readings.json') && l.includes('28-check.mjs'), 'B5 证据链三锚齐全');
// C. 账本行 + 证据文件齐备
ok(/\| A-034 \|[^\n]+done → implemented/.test(l), 'C1 A-034 状态 done');
for (const f of ['26-truth-table.json', '27-dual-readings.json', '28-check.mjs']) {
  ok(fs.existsSync(path.join(dir, f)), 'C2 证据文件存在: ' + f);
}
const dr = JSON.parse(fs.readFileSync(path.join(dir, '27-dual-readings.json'), 'utf8'));
ok(dr.dual_readings.v1_frozen.mean_ratio_4 === '0.2462' && dr.dual_readings.v2_rerun.mean_ratio_4 === '0.5846', 'C3 账本引用读数与 27-dual-readings.json 一致');

console.log('\nGUARD RESULT:', fail === 0 ? 'PASS' : 'FAIL', '(' + pass + ' pass, ' + fail + ' fail)');
process.exit(fail === 0 ? 0 : 1);
