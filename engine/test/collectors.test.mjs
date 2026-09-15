// collectors.test.mjs — adr-structure@v2 回退链单测（CI 每平台；作用于 dist 编译产物）
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = await import(pathToFileURL(join(root, 'dist', 'collect', 'collectors.js')).href);

const results = [];
function check(name, pass, detail) { results.push([name, !!pass, detail || '']); }

const ctx = { runId: 'ut', traceId: 't'.padEnd(32, '0'), repoRef: 'fixture', scale: 'Macro-B', observedAt: '2026-09-15T00:00:00Z' };

function run(doc, firstCommit) {
  const facts = C.collectAdrStructureV2({ documents: [{ path: 'fixture/adr.md', text: doc, first_commit_date: firstCommit || null }] }, ctx);
  const m = {};
  for (const f of facts) {
    const v = JSON.parse(f.value_json);
    if (f.metric === 'adr.header_field_present') { m['h:' + v.field] = v; }
    if (f.metric === 'adr.section_present') { m['s:' + v.section] = v; }
    if (f.metric === 'adr.five_piece_completeness') { m.five = v; }
    if (f.metric === 'adr.decision_date') { m.date = v; }
  }
  return m;
}

// F1 golden：dash 字段 + ## 节
const golden = ['# ADR-X', '', '- Status: accepted', '- Date: 2026-09-12', '- Deciders: u', '- Ledger: D-1', '', '## Context', 'c', '## Decision', 'd', '## Consequences', 'e'].join('\n');
let r = run(golden, null);
check('F1 golden five=5/5', r.five.present === 5 && r.five.ratio === 1, JSON.stringify(r.five));
check('F1 legs all dash', r['h:Status'].leg === 'dash' && r['h:Date'].leg === 'dash' && r.date.leg === 'dash' && r.date.date === '2026-09-12');

// F2 裸行 Status（Nygard 内联）+ 无 Date + git 首提交注入
const bare = ['# Title', '', 'prose paragraph body.', '', 'Status: accepted'].join('\n');
r = run(bare, '2026-09-12T08:00:00+08:00');
check('F2 bare Status inline leg', r['h:Status'].present === true && r['h:Status'].leg === 'inline', JSON.stringify(r['h:Status']));
check('F2 Date git leg', r['h:Date'].present === true && r['h:Date'].leg === 'git' && r.date.date === '2026-09-12', JSON.stringify(r['h:Date']));
check('F2 five=2/5', r.five.present === 2, JSON.stringify(r.five));

// F3 bold Status + 括号内嵌日期 → inline-iso
const bold = ['# Title', '', '**Status: accepted（2026-09-12）｜Supersedes: ADR-0000**', '', '## Context', 'x', '## Decision', 'y', '## Consequences', 'z'].join('\n');
r = run(bold, null);
check('F3 bold Status inline leg', r['h:Status'].present === true && r['h:Status'].leg === 'inline');
check('F3 Date inline-iso leg', r['h:Date'].present === true && r['h:Date'].leg === 'inline-iso' && r.date.date === '2026-09-12');
check('F3 five=5/5', r.five.present === 5, JSON.stringify(r.five));

// F4 裸标签节（全角冒号）→ section inline 腿
const bareSec = ['# Title', '', '- Status: accepted', '- Date: 2026-09-14', '', 'Considered Options: A … B …', 'Consequences：适配层成为契约面'].join('\n');
r = run(bareSec, null);
check('F4 bare Considered Options -> Options inline', r['s:Options'].present === true && r['s:Options'].leg === 'inline');
check('F4 fullwidth Consequences: inline', r['s:Consequences'].present === true && r['s:Consequences'].leg === 'inline');

// F5 负样本：纯散文无任何标签 → 全缺
r = run('only prose, no labels at all.', null);
check('F5 negative five=0/5', r.five.present === 0 && r['h:Status'].present === false && r['h:Date'].present === false);

// F6 v1 行为不变（留档对照）：裸行 Status 对 v1 仍 miss
const v1Facts = C.collectAdrStructure({ documents: [{ path: 'fixture/adr.md', text: bare }] }, ctx);
const v1Status = v1Facts.find(function (f) { const v = JSON.parse(f.value_json); return f.metric === 'adr.header_field_present' && v.field === 'Status'; });
check('F6 v1 unchanged (bare Status missed)', JSON.parse(v1Status.value_json).present === false);

// F7 Deciders 无冒号裸提及不命中（- ledger D-014 形态）
r = run(['# T', '', '- ledger D-014（revised）'].join('\n'), null);
check('F7 unlabeled ledger mention absent', r['h:Ledger'].present === false);

let ok = true;
for (const x of results) { console.log((x[1] ? 'PASS ' : 'FAIL ') + x[0] + (x[2] ? ' :: ' + x[2] : '')); if (!x[1]) { ok = false; } }
console.log(ok ? ('COLLECTORS-TEST-OK ' + results.length + '/' + results.length) : 'COLLECTORS-TEST-FAIL');
process.exit(ok ? 0 : 1);
