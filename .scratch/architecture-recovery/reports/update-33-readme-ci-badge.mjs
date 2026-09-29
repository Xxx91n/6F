// update-33-readme-ci-badge.mjs — D-175②⑦ (b)面欠账清零兑现：readme-ci-badge 挂载完成 status 翻转（幂等可重跑）
// 背景：trigger engine-ci-main-green fired 2026-09-22（main 实跑 35681529820 conclusion=success）→ CI 徽标同日
//   实挂 README.md:13（actions/workflows/engine-ci.yml/badge.svg?branch=main——徽标指 main 分支 workflow，D-089⑤ 锚）；
//   册项内纪律「挂载完成方翻 status」——挂载已完成而 status 逾期 pending=已触发未处置欠账（D-175② (b)面清零兑现）
// ① status pending→decided（挂门动作完成=拍板终态——33-check C 组 alarm 源消解）
// ② confirmations 追加 badge-mounted 确认行（实挂证据＋当前 main 红态如实披露——诚实徽记生效，CI cwd 缺陷另件修复）
// 纪律同款：幂等／写后 assert-back（BOM/status/确认行）／fail-closed exit 1
// 用法：node update-33-readme-ci-badge.mjs → 写回 33-gate-registry.json 并回读断言；exit 0=齐备
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REG = join(HERE, '33-gate-registry.json');
const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));

const ITEM_ID = 'readme-ci-badge';
const it = reg.items.find(i => i.id === ITEM_ID);
if (!it) { console.error('MIGRATION-ASSERT-FAIL: ' + ITEM_ID + ' missing'); process.exit(1); }
let changed = false;

if (it.status !== 'decided') {
  it.status = 'decided';
  changed = true;
}

const CONF = {
  at: '2026-09-29',
  by: 'R47-impl 执行批（轮48 T1，分支 r48-t1-exec）',
  criterion_version: 'D-089⑤/D-175②⑦',
  decision: 'badge-mounted',
  reason: '挂载完成翻 status（项内纪律「挂载完成方翻 status」兑现）：CI 徽标已于 2026-09-22 实挂 README.md（actions/workflows/engine-ci.yml/badge.svg?branch=main——engine-ci-main-green 事件 fired run 35681529820 success 同日解锁）；33-check H4 互等断言持续绿（occurred↔徽标在场）。如实披露：当前 main 最新实跑 36324002874（2026-09-27）conclusion=failure——根因=engine-ci.yml 末步 78-check 缺 working-directory 覆盖（job 默认 engine/ cwd 致 .scratch 路径错寻 MODULE_NOT_FOUND，e6724489 引入即带缺陷），徽标如实显红=诚实徽记生效非徽章缺陷；cwd 修复随本批同分支 engine-ci.yml 一行补丁落地。',
  evidence: 'README.md 徽标行＋gh run list --workflow engine-ci.yml --branch main 读数＋.github/workflows/engine-ci.yml 修复 diff'
};
if (!(it.confirmations || []).some(c => c.decision === 'badge-mounted')) {
  it.confirmations.push(CONF);
  changed = true;
}

if (changed) {
  fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n', 'utf8');
}

// --- assert-back（fail-closed） ---
const back = JSON.parse(fs.readFileSync(REG, 'utf8'));
const bit = back.items.find(i => i.id === ITEM_ID);
const hasBom = fs.readFileSync(REG)[0] === 0xEF;
const ok = !!bit && bit.status === 'decided'
  && bit.watch === 'event_bound' && bit.trigger_event === 'engine-ci-main-green'
  && (bit.confirmations || []).some(c => c.decision === 'badge-mounted' && !!c.at && !!c.by && !!c.criterion_version && !!c.reason && !!c.evidence)
  && !hasBom;
console.log('status=' + (bit && bit.status) + ' confs=' + ((bit && bit.confirmations) || []).length + ' BOM=' + hasBom);
if (!ok) { console.error('MIGRATION-ASSERT-FAIL'); process.exit(1); }
console.log(changed ? 'REGISTRY-UPDATED' : 'REGISTRY-IDEMPOTENT-SKIP');
