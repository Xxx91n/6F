// 28-apply.mjs — #28 ADR 治理卫生票：白名单就地修订执行脚本
// 规则：仅增结构标签/字段/勘误注记；原句逐字重分布（句级粒度，不删/不改写/不换序于句内）。
// 运行：node .scratch/architecture-recovery/reports/28-apply.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const ADR = path.join(ROOT, 'docs', 'adr');

const MARKER_BASE =
  '> 勘误补记（量测审计驱动 2026-09-15，#28 / A-033）：结构标签与 Date 字段补记；决策内容未改写。';
const MARKER_DATE =
  MARKER_BASE + 'Date 值 = 入库/commit 日期（git first-commit 2026-09-12）。';
const NOTE =
  '> 勘误注记：原文无独立 consequences 句；影响/范围性内容散见 Context 与 Decision 句内，未改写、未增补。';
const DATE_LINE = '- Date: 2026-09-12';

function splitSentences(para) {
  const parts = para.split('。');
  if (parts[parts.length - 1].trim() !== '') {
    throw new Error('trailing text after last 。: ' + para.slice(0, 40));
  }
  return parts.slice(0, -1).map((s) => s + '。');
}

// [file, needDate, sentenceCount, ctxIdx[], decIdx[], consIdx[]|'NOTE']
const CFG = [
  ['0001-five-scale-scope.md', true, 2, [1], [0], 'NOTE'],
  ['0002-no-mvp-slice.md', false, 2, [1], [0], 'NOTE'],
  ['0003-boundary-product-and-usage.md', true, 2, [1], [0], 'NOTE'],
  ['0004-strategic-quadrant-five-dims.md', true, 2, [1], [0], 'NOTE'],
  ['0005-hub-of-facts-with-federated-adjudication.md', true, 2, [1], [0], 'NOTE'],
  ['0006-shared-skeleton-scale-slice.md', true, 2, [1], [0], 'NOTE'],
  ['0007-ten-demo-paths.md', true, 2, [1], [0], 'NOTE'],
  ['0008-agent-plugin-five-layer-box.md', false, 4, [3], [0, 1], [2]],
  ['0009-intake-local-first-url-optin.md', false, 4, [3], [0, 1], [2]],
];

for (const [name, needDate, nSent, ctxIdx, decIdx, cons] of CFG) {
  const fp = path.join(ADR, name);
  const orig = fs.readFileSync(fp, 'utf8');
  if (orig.includes('\r')) throw new Error(name + ': unexpected CR');
  const lines = orig.split('\n');
  const title = lines[0];
  const statusIdx = lines.findIndex((l) => /^Status:/.test(l));
  if (statusIdx < 0) throw new Error(name + ': no Status line');
  const paraLines = lines.slice(1, statusIdx).filter((l) => l.trim() !== '');
  if (paraLines.length !== 1)
    throw new Error(name + ': expected 1 paragraph, got ' + paraLines.length);
  const sents = splitSentences(paraLines[0]);
  if (sents.length !== nSent)
    throw new Error(name + ': expected ' + nSent + ' sentences, got ' + sents.length);
  const statusLine = lines[statusIdx];
  const consText = cons === 'NOTE' ? NOTE : cons.map((i) => sents[i]).join('');
  const out = [
    title,
    needDate ? MARKER_DATE : MARKER_BASE,
    ...(needDate ? [DATE_LINE] : []),
    '',
    '## Context',
    '',
    ctxIdx.map((i) => sents[i]).join(''),
    '',
    '## Decision',
    '',
    decIdx.map((i) => sents[i]).join(''),
    '',
    '## Consequences',
    '',
    consText,
    '',
    statusLine,
    '',
  ].join('\n');
  fs.writeFileSync(fp, out, 'utf8');
  const rb = fs.readFileSync(fp);
  console.log(
    name,
    'bytes=' + rb.length,
    'tail=' + JSON.stringify(rb.toString('utf8').slice(-40))
  );
}

// ---- 0014 post-freeze row ----
const fp14 = path.join(ADR, '0014-upstream-integration-dual-track.md');
const o14 = fs.readFileSync(fp14, 'utf8');
const l14 = o14.split('\n');
// original layout: 0 title,1 '',2 -Status,3 -Date,4 -Deciders,5 '',6 P1(定版),7 '',8 P2(决策理由),9 '',10 P3(Considered Options+Consequences),11 ''
if (!l14[10].startsWith('Considered Options:')) throw new Error('0014 P3 layout changed');
const p1 = l14[6];
const p2 = l14[8];
const p3 = l14[10];
const seg = p3.split('Consequences：');
if (seg.length !== 2) throw new Error('0014 P3 split failed: ' + seg.length);
const optText = seg[0].replace(/^Considered Options:\s*/, '');
const consText = seg[1];
if (!optText.endsWith('。') || !consText.endsWith('。'))
  throw new Error('0014 segment endings wrong');
const out14 = [
  l14[0],
  MARKER_BASE,
  '',
  l14[2],
  l14[3],
  l14[4],
  '',
  '## Context',
  '',
  p2,
  '',
  '## Decision',
  '',
  p1,
  '',
  '## Considered Options',
  '',
  optText,
  '',
  '## Consequences',
  '',
  consText,
  '',
].join('\n');
fs.writeFileSync(fp14, out14, 'utf8');
const rb14 = fs.readFileSync(fp14);
console.log(
  '0014-upstream-integration-dual-track.md',
  'bytes=' + rb14.length,
  'tail=' + JSON.stringify(rb14.toString('utf8').slice(-40))
);
console.log('APPLY DONE');
