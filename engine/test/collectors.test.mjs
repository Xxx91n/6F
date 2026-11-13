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

// F1 标准样本：字段写成 dash，再用 ## 分节
const golden = ['# ADR-X', '', '- Status: accepted', '- Date: 2026-09-12', '- Deciders: u', '- Ledger: D-1', '', '## Context', 'c', '## Decision', 'd', '## Consequences', 'e'].join('\n');
let r = run(golden, null);
check('F1 标准样本 五件套 5/5', r.five.present === 5 && r.five.ratio === 1, JSON.stringify(r.five));
check('F1 Status 和 Date 都走 dash 读法', r['h:Status'].leg === 'dash' && r['h:Date'].leg === 'dash' && r.date.leg === 'dash' && r.date.date === '2026-09-12');

// F2 裸行 Status（Nygard 内联写法）+ 没有 Date，用 git 首提交补上
const bare = ['# Title', '', 'prose paragraph body.', '', 'Status: accepted'].join('\n');
r = run(bare, '2026-09-12T08:00:00+08:00');
check('F2 裸行 Status 走内联读法', r['h:Status'].present === true && r['h:Status'].leg === 'inline', JSON.stringify(r['h:Status']));
check('F2 日期走 git 读法', r['h:Date'].present === true && r['h:Date'].leg === 'git' && r.date.date === '2026-09-12', JSON.stringify(r['h:Date']));
check('F2 五件套 2/5', r.five.present === 2, JSON.stringify(r.five));

// F3 加粗的 Status，日期写在括号里，走 inline-iso 读法
const bold = ['# Title', '', '**Status: accepted（2026-09-12）｜Supersedes: ADR-0000**', '', '## Context', 'x', '## Decision', 'y', '## Consequences', 'z'].join('\n');
r = run(bold, null);
check('F3 加粗 Status 走内联读法', r['h:Status'].present === true && r['h:Status'].leg === 'inline');
check('F3 日期走 inline-iso 读法', r['h:Date'].present === true && r['h:Date'].leg === 'inline-iso' && r.date.date === '2026-09-12');
check('F3 五件套 5/5', r.five.present === 5, JSON.stringify(r.five));

// F4 裸标签节（全角冒号），节标题走内联读法
const bareSec = ['# Title', '', '- Status: accepted', '- Date: 2026-09-14', '', 'Considered Options: A … B …', 'Consequences：适配层成为契约面'].join('\n');
r = run(bareSec, null);
check('F4 裸 Considered Options 认作 Options 并走内联读法', r['s:Options'].present === true && r['s:Options'].leg === 'inline');
check('F4 全角冒号的 Consequences 走内联读法', r['s:Consequences'].present === true && r['s:Consequences'].leg === 'inline');

// F5 负样本：整篇只有正文，一个标签都没有，五件套全缺
r = run('only prose, no labels at all.', null);
check('F5 负样本 五件套 0/5', r.five.present === 0 && r['h:Status'].present === false && r['h:Date'].present === false);

// F6 v1 行为不变（留档对照）：裸行 Status 在 v1 里依然认不出
const v1Facts = C.collectAdrStructure({ documents: [{ path: 'fixture/adr.md', text: bare }] }, ctx);
const v1Status = v1Facts.find(function (f) { const v = JSON.parse(f.value_json); return f.metric === 'adr.header_field_present' && v.field === 'Status'; });
check('F6 v1 照旧（裸行 Status 依然认不出）', JSON.parse(v1Status.value_json).present === false);

// F7 只提名字、后面不带冒号的 Deciders 不算命中（形如 - ledger D-014）
r = run(['# T', '', '- ledger D-014（revised）'].join('\n'), null);
check('F7 没标标签只提一句的 ledger 不算命中', r['h:Ledger'].present === false);

// F8 inline-iso 读法：head-60 里全部匹配，按排序取最早（27-prereg §1 的 C 项：matches.sort()[0] 的语义，
// 不是取行序第一个）——后面一行日期更早就必须命中更早那个值
r = run(['# T', '', 'written 2026-09-15 during review', 'original decision 2026-09-10 recorded'].join('\n'), null);
check('F8 inline-iso 取排序最早（不是取第一行）', r['h:Date'].present === true && r['h:Date'].leg === 'inline-iso' && r.date.date === '2026-09-10' && r.date.leg === 'inline-iso');

let ok = true;
for (const x of results) { console.log((x[1] ? 'PASS ' : 'FAIL ') + x[0] + (x[2] ? ' :: ' + x[2] : '')); if (!x[1]) { ok = false; } }
console.log(ok ? ('COLLECTORS-TEST-OK ' + results.length + '/' + results.length) : 'COLLECTORS-TEST-FAIL');
process.exit(ok ? 0 : 1);
