// 31-check.mjs — R4-05 守卫：适配器存在 + pin + golden fixtures + 探针产物 + provenance + 漂移报告 + 冻结零改动
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; } else { fail++; console.log('FAIL:', l); } };

const src = fs.readFileSync(path.join(root, 'engine/src/upstream/codelore.ts'), 'utf8');
ok(src.includes("CODELORE_PINNED_VERSION = '0.28.0'"), 'A1 上游版本 exact pin');
ok(src.includes("strategy: 'binary-discovery'") || src.includes("binary-discovery"), 'A2 运行时解析 = binary-discovery');
ok(/spawnSync/.test(src) && !/threshold|verdict|RED|score_band/.test(src), 'A3 适配层有进程调用且无业务规则词（ACL）');
ok(src.includes('../collect/collectors.js') && src.includes('makeFact'), 'A4 fact 形态复用既有 makeFact');

const pm = JSON.parse(fs.readFileSync(path.join(dir, '31-probe-measurements.json'), 'utf8'));
ok(pm.runtime_resolution.resolution.pinned === true && pm.runtime_resolution.resolution.version === '0.28.0', 'B1 实测 resolve pinned');
ok(pm.upstream_facts_count >= 5 && pm.upstream_metrics.includes('codelore.file_dossier'), 'B2 上游事实 ≥5 且含 file_dossier');
ok(pm.provenance.commit_pin && pm.provenance.spec_version && pm.provenance.data_fingerprint, 'B3 provenance 三要素齐备');
ok(Number(pm.diff.frozen_set.tc2_v1_mean) === 0.2462 && Number(pm.diff.current_tree.tc2_v2_mean) === 1, 'B4 diff 记录冻结读数与当前树 v2=1.0');

const facts = fs.readFileSync(path.join(dir, '31-upstream-facts.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
ok(facts.every((f) => f.collector_id === 'codelore-adapter@v1' && f.fact_id && f.trace_id), 'C1 上游事实 schema v0 字段齐备');

const t = fs.readFileSync(path.join(root, 'engine/test/codelore-adapter.test.mjs'), 'utf8');
ok(fs.readdirSync(path.join(root, 'engine/test/fixtures/codelore')).length >= 4, 'D1 golden fixtures ≥4（explain×2+summary+version）');
ok(t.includes('shape drift') && t.includes('G7'), 'D2 契约测试含漂移拒绝 + 错误路径用例');

const drift = fs.readFileSync(path.join(dir, '31-upstream-drift.md'), 'utf8');
ok(drift.includes('任务 1') && drift.includes('任务 3') && /binary.?discovery/.test(drift), 'E1 漂移报告含任务1/3锚+解析判定');
ok(drift.includes('plugin.schema.json') && drift.includes('不符合'), 'E2 P1 schema 预核对发现落文');

const dirty = spawnSync('git', ['status', '--porcelain', '--', '.scratch/architecture-recovery/reports/23-measurements.json', '.scratch/architecture-recovery/reports/23-facts.jsonl', 'docs/adr'], { cwd: root, encoding: 'utf8' }).stdout.trim();
ok(dirty === '', 'F1 冻结产物与 docs/adr 零改动（探针平行产物纪律）');

console.log('\nGUARD RESULT:', fail === 0 ? 'PASS' : 'FAIL', '(' + pass + ' pass, ' + fail + ' fail)');
process.exit(fail === 0 ? 0 : 1);
