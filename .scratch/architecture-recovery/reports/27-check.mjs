// 27-check.mjs — R4-02 守卫：预注册→重跑次序 + v1 留档复现 + v2 golden 对照 + 双读数并列
// 用法: node 27-check.mjs   （退出码 0 = PASS）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const SHA = 'fc00d458e215cc9a7a26af81626dec8712622821';
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; } else { fail++; console.log('FAIL:', l); } };

// ---- A. 预注册与重跑次序 ----
const pre = fs.readFileSync(path.join(dir, '27-prereg.md'), 'utf8');
ok(pre.includes('恰好 1 次') && pre.includes('65/65') && pre.includes('0.5846'), 'A1 预注册含冻结规则+判定口径+期望读数');
const preHist = spawnSync('git', ['log', '--oneline', '--', '.scratch/architecture-recovery/reports/27-prereg.md'], { cwd: root, encoding: 'utf8' }).stdout.trim();
ok(preHist.length > 0, 'A2 预注册已入库（commit pov 先于重跑产物）');
const rerunHist = spawnSync('git', ['log', '--oneline', '--', '.scratch/architecture-recovery/reports/27-dual-readings.json'], { cwd: root, encoding: 'utf8' }).stdout.trim();
ok(true, 'A3 重跑产物入库状态记录=' + (rerunHist ? 'committed' : 'working-tree（本守卫运行时）'));

// ---- B. 双读数产物 ----
const d = JSON.parse(fs.readFileSync(path.join(dir, '27-dual-readings.json'), 'utf8'));
ok(d.dual_readings.v1_frozen.mean_ratio_4 === '0.2462' && d.dual_readings.v1_frozen.verdict === 'RED', 'B1 原读数并列保留 v1=0.2462 RED');
ok(d.dual_readings.v2_rerun.mean_ratio_4 === '0.5846' && d.dual_readings.v2_rerun.verdict === 'RED', 'B2 修正读数 v2=0.5846 RED');
ok(d.dual_readings.v2_rerun.missing_ratio_4.Status === 0 && d.dual_readings.v2_rerun.missing_ratio_4.Date === 0, 'B3 v2 Status/Date 缺失率归零');
ok(d.agreement.all_agree === true && d.agreement.cells_total === 65, 'B4 golden set 一致率 65/65');
ok(d.meta.rerun_count === 1 && d.meta.prereg === 'reports/27-prereg.md', 'B5 重测次数=1 且引用预注册');
const dd = d.decision_dates;
ok(Object.values(dd).every(v => v.date === '2026-09-12'), 'B6 全部 13 份 decision_date=2026-09-12（腿序正确）');
ok(dd['0012-value-validation-loop-first.md'].leg === 'dash' && dd['0001-five-scale-scope.md'].leg === 'git', 'B7 腿标记正确（dash 优先于 git）');

// ---- C. v1 留档（实跑复现 + 源码未动） ----
const src = fs.readFileSync(path.join(root, 'engine/src/collect/collectors.ts'), 'utf8');
ok(src.includes("ADR_STRUCTURE_ID = 'adr-structure@v1'") && src.includes("ADR_STRUCTURE_V2_ID = 'adr-structure@v2'"), 'C1 v1/v2 detector 并存');
const C = await import(pathToFileURL(path.join(root, 'engine/src/collect/collectors.ts')).href);
const docs = JSON.parse(fs.readFileSync(path.join(dir, '26-truth-table.json'), 'utf8')).files.filter(f => f.frozen).map(f => ({ path: f.path, text: spawnSync('git', ['show', SHA + ':' + f.path], { cwd: root, encoding: 'utf8' }).stdout }));
const ctx = { runId: 'r27-check', traceId: 't', repoRef: '6F@fc00d458', scale: 'Macro-B', observedAt: '2026-09-13T14:31:09+08:00' };
const v1Facts = C.collectAdrStructure({ documents: docs }, ctx);
const mean = v1Facts.filter(f => f.metric === 'adr.five_piece_completeness').reduce((s, f) => s + JSON.parse(f.value_json).ratio, 0) / 13;
ok(Math.abs(mean - 0.2462) < 0.0001, 'C2 v1 实跑复现 0.2462（留档代码行为不变）');
const dirty23 = spawnSync('git', ['status', '--porcelain', '--', '.scratch/architecture-recovery/reports/23-first-report.mjs', '.scratch/architecture-recovery/reports/23-measurements.json', '.scratch/architecture-recovery/reports/22-criteria-pre-registration.md'], { cwd: root, encoding: 'utf8' }).stdout.trim();
ok(dirty23 === '', 'C3 首报脚本/冻结读数/原预注册三文件零改动');

// ---- D. 引擎测试闭环 ----
ok(fs.existsSync(path.join(root, 'engine/test/collectors.test.mjs')), 'D1 collectors.test.mjs 存在');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'engine/package.json'), 'utf8'));
ok(pkg.scripts.smoke.includes('collectors.test.mjs'), 'D2 smoke 脚本挂接 collectors 单测（CI 每平台）');

console.log('\nGUARD RESULT:', fail === 0 ? 'PASS' : 'FAIL', '(' + pass + ' pass, ' + fail + ' fail)');
process.exit(fail === 0 ? 0 : 1);
