// 28-check.mjs — #28 ADR 治理卫生票守卫
// 验收口径（对照 reports/26-truth-table.json real-gap 清单 + 任务书）：
//  (a) 0001~0009 每份含 ## Context / ## Decision / ## Consequences + 勘误补记 marker；
//      6 份 Date-gap（0001/0003~0007）含 `- Date: 2026-09-12`，且值 = git first-commit 日期；
//      0002/0008/0009 不得新增 `- Date:` 字段（I-inline 已恢复，非 real-gap）。
//  (b) 原句逐字保留：frozen @fc00d458（0001~0009）/ HEAD（0014，冻结后新增）逐句比对，
//      whitespace-tolerant 子串断言。
//  (c) `Status:` 行与冻结内容逐字节一致。
//  (d) 0014 含 ## Context / ## Decision / ## Considered Options / ## Consequences + 勘误补记。
//  (e) 改动面仅限 docs/adr/{0001~0009,0014} 与 .scratch/architecture-recovery/reports/28-*；
//      engine/、decision-ledger.md、README.md、WORKFLOW.md、spec.md、issues/handoffs/prompts 零改动。
// 运行：node .scratch/architecture-recovery/reports/28-check.mjs（或于 reports/ 目录内 node 28-check.mjs）
import { execSync } from 'node:child_process';
import { commitsByGrep, touchedPaths } from './_lib/check-kit.mjs';
import { need, groupProbe, gitObjectNeedOk } from './_lib/env-contract.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
const PROTECTED_SURFACE = '#28 ADR 治理卫生票守卫';


const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const FROZEN = 'fc00d458e215cc9a7a26af81626dec8712622821';

let pass = 0,
  fail = 0;
function check(name, cond, extra = '') {
  if (cond) {
    pass++;
    console.log('PASS  ' + name);
  } else {
    fail++;
    console.log('FAIL  ' + name + (extra ? '  -- ' + extra : ''));
  }
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const git = (args) =>
  execSync('git -c core.quotePath=false ' + args, { cwd: ROOT, encoding: 'utf8' });

const NINE = [
  '0001-five-scale-scope.md',
  '0002-no-mvp-slice.md',
  '0003-boundary-product-and-usage.md',
  '0004-strategic-quadrant-five-dims.md',
  '0005-hub-of-facts-with-federated-adjudication.md',
  '0006-shared-skeleton-scale-slice.md',
  '0007-ten-demo-paths.md',
  '0008-agent-plugin-five-layer-box.md',
  '0009-intake-local-first-url-optin.md',
];
const DATE_GAP = new Set([
  '0001-five-scale-scope.md',
  '0003-boundary-product-and-usage.md',
  '0004-strategic-quadrant-five-dims.md',
  '0005-hub-of-facts-with-federated-adjudication.md',
  '0006-shared-skeleton-scale-slice.md',
  '0007-ten-demo-paths.md',
]);
const NO_DATE = new Set([
  '0002-no-mvp-slice.md',
  '0008-agent-plugin-five-layer-box.md',
  '0009-intake-local-first-url-optin.md',
]);

// 将冻结文本拆成「必须逐字出现」的片段：逐非空行 → 按「。」断句（保留句号）→
// 剥除已按规则转换为 `## ` 标题的裸行标签前缀（0014 的 Considered Options: / Consequences：）。
function fragments(text) {
  const frags = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split('。');
    for (let i = 0; i < parts.length - 1; i++) frags.push(parts[i] + '。');
    const tail = parts[parts.length - 1].trim();
    if (tail) frags.push(tail);
  }
  return frags
    .map((f) =>
      f.replace(/^Considered Options:\s*/, '').replace(/^Consequences：\s*/, '')
    )
    .filter(Boolean);
}

// ---------- (a)(b)(c) 0001~0009 ----------
// git-object 前置（D-163②）：frozen @fc00d458 非分支祖先 clone 不携带——缺席借仓内 bundle 临时仓零写入物化
const GO28 = groupProbe('28-check', 'a-c', [need('git-object:' + FROZEN, gitObjectNeedOk(ROOT, FROZEN, path.join(HERE, '23-frozen-' + FROZEN.slice(0, 8) + '.bundle')))]);
if (GO28) for (const name of NINE) {
  const rel = 'docs/adr/' + name;
  const cur = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const frozen = git('show ' + FROZEN + ':' + rel);

  for (const sect of ['## Context', '## Decision', '## Consequences']) {
    check(name + ' has ' + sect, cur.split('\n').some((l) => l === sect));
  }
  check(name + ' errata marker', cur.includes('勘误补记'));
  check(
    name + ' exactly one marker line',
    cur.split('\n').filter((l) => l.startsWith('> 勘误补记（量测审计驱动')).length === 1
  );

  if (DATE_GAP.has(name)) {
    check(name + ' - Date: 2026-09-12', cur.split('\n').includes('- Date: 2026-09-12'));
    check(
      name + ' marker states Date=commit date',
      /勘误补记[^\n]*Date 值 = 入库\/commit 日期/.test(cur)
    );
    const first = git('log --follow --format=%aI --reverse -- ' + rel)
      .split('\n')[0]
      .trim();
    check(name + ' Date=git first-commit', first.startsWith('2026-09-12'), first);
  }
  if (NO_DATE.has(name)) {
    check(name + ' no - Date: field added', !/^- Date:/m.test(cur));
  }

  // (b) 原句逐字保留
  const hay = norm(cur);
  const missing = fragments(frozen).filter((f) => !hay.includes(norm(f)));
  check(name + ' verbatim sentences preserved', missing.length === 0, missing.join(' | ').slice(0, 200));

  // (c) Status 行逐字节一致
  const frozenStatus = frozen.split('\n').find((l) => /^Status:/.test(l));
  check(
    name + ' Status line byte-identical',
    !!frozenStatus && cur.split('\n').includes(frozenStatus),
    JSON.stringify(frozenStatus)
  );

  // 标题行逐字节一致 + 文件卫生
  check(name + ' title byte-identical', cur.split('\n')[0] === frozen.split('\n')[0]);
  check(name + ' LF/no-CR/single-trailing-LF', !cur.includes('\r') && cur.endsWith('\n') && !cur.endsWith('\n\n'));
}

// ---------- (d) 0014 ----------
const rel14 = 'docs/adr/0014-upstream-integration-dual-track.md';
const cur14 = fs.readFileSync(path.join(ROOT, rel14), 'utf8');
const orig14 = git('show HEAD:' + rel14); // 冻结后新增，冻结 SHA 无此文件；HEAD = 本票改动前版本
for (const sect of ['## Context', '## Decision', '## Considered Options', '## Consequences']) {
  check('0014 has ' + sect, cur14.split('\n').some((l) => l === sect));
}
check('0014 errata marker', cur14.includes('勘误补记'));
const missing14 = fragments(orig14).filter((f) => !norm(cur14).includes(norm(f)));
check('0014 verbatim sentences preserved', missing14.length === 0, missing14.join(' | ').slice(0, 200));
check('0014 title byte-identical', cur14.split('\n')[0] === orig14.split('\n')[0]);
check('0014 header fields byte-identical', ['- Status: accepted', '- Date: 2026-09-14'].every((l) => cur14.split('\n').includes(l)));
check('0014 LF/no-CR/single-trailing-LF', !cur14.includes('\r') && cur14.endsWith('\n') && !cur14.endsWith('\n\n'));

// ---------- (e) 改动面白名单 ----------
// 并发注记：本票执行期间观察到 engine/package.json 被仓内并行 Agent 改动
// （diff 仅为末尾补一个换行；本票所有写操作仅落在 docs/adr 与 reports/28-*）。
// 不还原他人改动（多 Agent 纪律）；改用指纹豁免：该路径仅当其 diff 与观察时
// 完全一致（sha256 如下）才放行——证明非本票所触、且未被进一步漂移。
import { createHash } from 'node:crypto';
const FOREIGN_EXCEPTIONS = {
  'engine/package.json':
    'd77f79ae08b7d22ee044c2d4a5fb6da697687b63ed81e60da95e1ab117c2013e',
};
const diffHash = (p) =>
  createHash('sha256')
    .update(git('diff -- ' + p))
    .digest('hex');
const isForeignKnown = (p) =>
  Object.hasOwn(FOREIGN_EXCEPTIONS, p) && diffHash(p) === FOREIGN_EXCEPTIONS[p];

// R37/#75批1（D-094(b) 工具时代漂移）：GitButler 合成索引令 git status porcelain 现幻影 MM——票面范围断言改钉票面 commit 集物证（A-033 触碰面 ⊆ 允许集）。
// FOREIGN_EXCEPTIONS/isForeignKnown/diffHash 系 porcelain 时代「并发外部漂移指纹豁免」机件——机制退役留痕不删（D-044 禁裸删）。
// R38/#75批2（r37 审计 P-5）：机件收编 _lib/check-kit.mjs（spawnSync argv + core.quotePath=false 同语义）。
const a33 = commitsByGrep(ROOT, 'A-033');
const touched28 = touchedPaths(ROOT, a33);
const allowed = new Set([
  ...NINE.map((n) => 'docs/adr/' + n),
  rel14,
]);
const bookkeep28 = new Set([
  '.scratch/architecture-recovery/decision-ledger.md',
  '.scratch/architecture-recovery/README.md',
  '.scratch/architecture-recovery/WORKFLOW.md',
]);
const isAllowed = (p) => allowed.has(p) || bookkeep28.has(p) || p.startsWith('.scratch/architecture-recovery/reports/28-');
const stray = [...touched28].filter((p) => !isAllowed(p));
check('scope: A-033 票面 commit 集触碰面 ⊆ docs/adr(0001~0009,0014)+reports/28-*+簿记三件（' + a33.length + ' commits/' + touched28.size + ' paths 物证）', a33.length > 0 && stray.length === 0, stray.join(', '));

// 高敏路径票面零触（时代域钉——engine/spec/issues/handoffs/prompts 本票无涉）
const sensitive = [
  'engine',
  '.scratch/architecture-recovery/spec.md',
  '.scratch/architecture-recovery/issues',
  '.scratch/architecture-recovery/handoffs',
  '.scratch/architecture-recovery/prompts',
];
const touchedSensitive = [...touched28].filter((p) => sensitive.some((s) => p === s || p.startsWith(s + '/')));
check('scope: A-033 票面零触 engine/spec/issues/handoffs/prompts', touchedSensitive.length === 0, touchedSensitive.join(', '));

console.log('----------------------------------------');
console.log(`${pass} pass, ${fail} fail`);
console.log('GUARD RESULT: ' + (fail === 0 ? 'PASS' : 'FAIL'));
process.exit(fail === 0 ? 0 : 1);
