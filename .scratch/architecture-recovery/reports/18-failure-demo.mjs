import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = 'D:/Aworker/6F/.scratch/architecture-recovery/reports';
const SKELETON = ['执行摘要', '4 象限 / 裁决', '证据', '行动建议'];

const STAMP_PREFIXES = [
  String.fromCharCode(9888) + " data doesn't show",
  String.fromCharCode(9888) + ' contains uncited claims',
  String.fromCharCode(9888) + ' gap request',
  String.fromCharCode(9888) + ' verdict rejected',
  String.fromCharCode(9888) + ' rendering degraded',
  String.fromCharCode(9888) + ' unverified'
];
const W = String.fromCharCode(9888);

const fixture = JSON.parse(fs.readFileSync(path.join(DIR, '18-demo-fixture.json'), 'utf8'));
const spec = JSON.parse(fs.readFileSync(path.join(DIR, '18-failure-paths.json'), 'utf8'));
const evRefs = new Set(fixture.evidence.filter(function (e) { return e.resolvable; }).map(function (e) { return e.ref; }));

function stage1Collect() {
  return fixture.evidence.map(function (e) {
    return { ref: e.ref, source: e.source, detail: e.detail, status: 'ok' };
  });
}

function stage2Narrate(profile) {
  return profile.findings.map(function (f) {
    return {
      id: f.id, file: f.file, line: f.line, severity: f.severity,
      claim: f.claim,
      citations: f.citations.map(function (c) { return c.ref; })
    };
  });
}

function stage3Adjudicate(narr) {
  return narr.map(function (n) {
    const cited = n.citations.length > 0;
    const resolvable = n.citations.every(function (r) { return evRefs.has(r); });
    const uncited = !cited;
    const unresolvable = cited && !resolvable;
    if (uncited || unresolvable) {
      const reason = uncited ? 'NO_CITATION' : 'UNRESOLVABLE_REF';
      return Object.assign({}, n, {
        verdict: 'rejected', reason: reason, bucket: 'unverified',
        stamps: [W + ' contains uncited claims', W + ' verdict rejected: ' + reason, W + ' unverified'],
        gapRequest: { target: n.file + ':' + n.line, ttl_hours: 72, escalation: 'Adjudication Protocol 申诉通道' }
      });
    }
    return Object.assign({}, n, { verdict: 'pass', reason: null, bucket: 'adjudicated', stamps: [], gapRequest: null });
  });
}

function stage4Render(label, adjudicated, collected) {
  const passed = adjudicated.filter(function (a) { return a.verdict === 'pass'; });
  const rejected = adjudicated.filter(function (a) { return a.verdict === 'rejected'; });
  const coverage = adjudicated.length === 0 ? '0/0' : passed.length + '/' + adjudicated.length;
  const verdictState = rejected.length === 0 ? 'pass' : (passed.length === 0 ? 'rejected' : 'partial');

  const ch = {};
  ch[SKELETON[0]] = {
    integrity: { coverage: coverage, verdict: verdictState, render: 'ok' },
    body: [
      'PR #' + fixture.pr.pr_number + ' @ ' + fixture.pr.repo + ' (' + fixture.pr.head_sha + ')',
      '行级结论 ' + adjudicated.length + ' 条：通过裁决 ' + passed.length + ' 条，未通过 ' + rejected.length + ' 条。',
      rejected.length > 0
        ? W + ' 降级注释：本报告中 ' + rejected.length + ' 条未过 Evidence Gate，已发 GapRequest，未进入行动建议章。'
        : '无降级注释：全部结论均绑定可解析证据。'
    ]
  };

  const quad = adjudicated.map(function (a) {
    return '| ' + a.id + ' | ' + a.file + ':' + a.line + ' | ' + a.severity + ' | ' + a.claim + ' | ' +
      (a.verdict === 'pass' ? 'pass' : 'rejected (' + a.reason + ')') + ' | ' +
      (a.stamps.length ? a.stamps.join(' / ') : '-') + ' |';
  });
  ch[SKELETON[1]] = {
    integrity: { coverage: coverage, verdict: verdictState, render: 'ok' },
    body: ['| ID | 位置 | 严重度 | 结论 | verdict-gate | 印记 |', '|---|---|---|---|---|---|'].concat(quad)
  };

  const evBody = collected.map(function (e) {
    return '- [' + e.ref + '] (' + e.source + ') ' + e.detail;
  });
  adjudicated.forEach(function (a) {
    evBody.push('- ' + a.id + ' 绑定证据：' + (a.citations.length ? a.citations.join(', ') : W + ' data doesn' + String.fromCharCode(39) + 't show: citation[' + a.id + ']'));
  });
  ch[SKELETON[2]] = {
    integrity: { coverage: collected.length + '/' + collected.length, verdict: 'n/a（证据层）', render: 'ok' },
    body: evBody
  };

  const actBody = [];
  if (passed.length > 0) {
    passed.forEach(function (a) { actBody.push('- [已过裁决] ' + a.id + '：' + a.claim); });
  } else {
    actBody.push('- （空）本报告无结论通过裁决，行动建议章为 0 条。');
  }
  if (rejected.length > 0) {
    actBody.push('');
    actBody.push('#### 未通过裁决（保留 re-adjudication 入口）');
    rejected.forEach(function (a) {
      actBody.push('- ' + a.id + '：' + a.claim + '  ' + W + ' verdict rejected: ' + a.reason +
        ' — GapRequest(' + a.gapRequest.target + ', TTL ' + a.gapRequest.ttl_hours + 'h, 升级：' + a.gapRequest.escalation + ')');
    });
  }
  ch[SKELETON[3]] = {
    integrity: { coverage: passed.length + '/' + adjudicated.length, verdict: verdictState, render: 'ok' },
    body: actBody
  };

  const stamps = [];
  adjudicated.forEach(function (a) { a.stamps.forEach(function (s) { stamps.push(s); }); });
  if (rejected.length > 0) {
    rejected.forEach(function (a) {
      stamps.push(W + ' data doesn' + String.fromCharCode(39) + 't show: citation[' + a.id + ']');
      stamps.push(W + ' gap request: ' + a.gapRequest.target);
    });
  }
  return { label: label, chapters: ch, stamps: stamps, passed: passed.length, rejected: rejected.length };
}

function renderMarkdown(rep) {
  const out = [];
  out.push('## ' + rep.label);
  SKELETON.forEach(function (name, i) {
    const c = rep.chapters[name];
    out.push('');
    out.push('### ' + (i + 1) + '. ' + name);
    out.push('> integrity: coverage=' + c.integrity.coverage + ' | verdict=' + c.integrity.verdict + ' | render=' + c.integrity.render);
    out.push('');
    c.body.forEach(function (l) { out.push(l); });
  });
  return out.join(String.fromCharCode(10));
}

const collected = stage1Collect();
const happy = stage4Render(fixture.profiles.happy.label, stage3Adjudicate(stage2Narrate(fixture.profiles.happy)), collected);
const failure = stage4Render(fixture.profiles.failure.label, stage3Adjudicate(stage2Narrate(fixture.profiles.failure)), collected);

const results = [];
function check(id, desc, cond, evidence) {
  results.push({ id: id, desc: desc, pass: !!cond, evidence: evidence });
}

// A1: 5 条 failure path 四要素齐全
const fourOk = spec.paths.every(function (p) {
  return p.elements && p.elements.trigger && p.elements.trigger.text && p.elements.trigger.machine_checkable &&
    p.elements.degradation && p.elements.degradation.mode &&
    p.elements.verdict_stamp && p.elements.verdict_stamp.stamps.length > 0 &&
    p.elements.artifact && p.elements.artifact.skeleton && p.elements.artifact.integrity;
});
check('A1', '5 条 failure path 每条 4 要素齐全', spec.paths.length === 5 && fourOk,
  spec.paths.length + ' 条路径，四要素校验 ' + (fourOk ? 'PASS' : 'FAIL'));

// A2: 每条都显式与 happy path 对比
const contrastOk = spec.paths.every(function (p) {
  return p.happy_path_ref && p.happy_path_ref.name && p.happy_path_ref.artifact && p.happy_path_ref.contrast.length >= 3;
});
check('A2', '每条 failure path 显式与 happy path 对比（>=3 条差异项）', contrastOk,
  spec.paths.map(function (p) { return p.id + ':' + p.happy_path_ref.contrast.length; }).join(' '));

// A3: 骨架同一性
const happyNames = Object.keys(happy.chapters);
const failNames = Object.keys(failure.chapters);
check('A3', 'happy 与 failure 报告章节结构逐字相同（yield=1）',
  JSON.stringify(happyNames) === JSON.stringify(failNames) && JSON.stringify(happyNames) === JSON.stringify(SKELETON),
  happyNames.join(' / '));

// A4: failure 报告含锁定词表的 verdict-gate 拒绝印记
const rejectStamps = failure.stamps.filter(function (s) { return s.indexOf('verdict rejected') >= 0; });
check('A4', 'failure 报告含 >=1 条 verdict-gate 拒绝印记', rejectStamps.length > 0, rejectStamps.join(' | '));

// A5: happy 报告零拒绝印记
check('A5', 'happy 报告零拒绝印记', happy.stamps.length === 0, 'stamps=' + happy.stamps.length);

// A6: 所有印记落在锁定词表内
const allStamps = happy.stamps.concat(failure.stamps);
const unknown = allStamps.filter(function (s) {
  return !STAMP_PREFIXES.some(function (p) { return s.indexOf(p) === 0; });
});
check('A6', '所有印记属于锁定词表（禁止自由发挥）', unknown.length === 0,
  allStamps.length + ' 个印记，越界 ' + unknown.length + ' 个');

// A7: failure 四章全在（不因降级拒出报告）
check('A7', 'failure 报告四章全部存在（降级不降低 yield）',
  SKELETON.every(function (n) { return failure.chapters[n] && failure.chapters[n].body.length > 0; }),
  SKELETON.join(' / '));

// A8: happy vs failure 实际产生差异（对比有效，非同一产物）
const diffLines = [];
SKELETON.forEach(function (n) {
  const a = happy.chapters[n].body.join(String.fromCharCode(10));
  const b = failure.chapters[n].body.join(String.fromCharCode(10));
  if (a !== b) { diffLines.push(n); }
});
check('A8', 'happy 与 failure 逐章对比产生真实差异', happy.passed === 3 && failure.rejected === 3 && diffLines.length >= 3,
  'happy pass=' + happy.passed + ' / failure rejected=' + failure.rejected + ' / 差异章=' + diffLines.length);

// A9: 被驳回项不进入行动建议章
const actBody = failure.chapters[SKELETON[3]].body.join(String.fromCharCode(10));
const leaked = failure.rejected > 0 && actBody.indexOf('[已过裁决]') >= 0;
check('A9', '被裁决驳回的结论不进入行动建议章', !leaked, '行动建议章通过数=0，未通过小节数=' + failure.rejected);

const failed = results.filter(function (r) { return !r.pass; });
const NL = String.fromCharCode(10);
const md = [];
md.push('# 18 — Micro-A failure 跑通演示产物（happy vs failure 同骨架对比）');
md.push('');
md.push('- A-xxx: A-018');
md.push('- 演示路径: FP-4 / Micro-A failure：PR 结论无引文被 verdict-gate 拒绝');
md.push('- 夹具: reports/18-demo-fixture.json（同一 PR，差异只来自结论是否绑定可解析证据）');
md.push('- 脚本: reports/18-failure-demo.mjs');
md.push('');
md.push(renderMarkdown(happy));
md.push('');
md.push('---');
md.push('');
md.push(renderMarkdown(failure));
md.push('');
md.push('---');
md.push('');
md.push('## 逐章对比（与 happy path 显式对照）');
md.push('');
md.push('| 章节 | happy | failure | 差异 |');
md.push('|---|---|---|---|');
SKELETON.forEach(function (n) {
  const h = happy.chapters[n].integrity, f = failure.chapters[n].integrity;
  const same = JSON.stringify(happy.chapters[n].body) === JSON.stringify(failure.chapters[n].body);
  md.push('| ' + n + ' | coverage=' + h.coverage + ', verdict=' + h.verdict + ' | coverage=' + f.coverage + ', verdict=' + f.verdict + ' | ' + (same ? '结构相同/内容相同' : '结构相同/内容降级') + ' |');
});
md.push('');
md.push('## 守卫断言');
md.push('');
md.push('| ID | 断言 | 结果 | 证据 |');
md.push('|---|---|---|---|');
results.forEach(function (r) {
  md.push('| ' + r.id + ' | ' + r.desc + ' | ' + (r.pass ? 'PASS' : 'FAIL') + ' | ' + r.evidence + ' |');
});
md.push('');
md.push('**总计: ' + (results.length - failed.length) + '/' + results.length + ' PASS' + (failed.length ? ' — ' + failed.length + ' FAIL' : '') + '**');

const outMd = md.join(NL);
const outJson = JSON.stringify({ ticket: 18, a_xxx: 'A-018', happy: happy, failure: failure, assertions: results, pass: failed.length === 0 }, null, 2);
fs.writeFileSync(path.join(DIR, '18-demo-output.md'), outMd, { encoding: 'utf8' });
fs.writeFileSync(path.join(DIR, '18-demo-output.json'), outJson, { encoding: 'utf8' });

console.log('=== 18 Micro-A failure demo ===');
console.log('happy: pass=' + happy.passed + ' rejected=' + happy.rejected);
console.log('failure: pass=' + failure.passed + ' rejected=' + failure.rejected);
console.log('failure stamps:');
failure.stamps.forEach(function (s) { console.log('  ' + s); });
console.log('--- assertions ---');
results.forEach(function (r) { console.log((r.pass ? 'PASS' : 'FAIL') + ' ' + r.id + ' ' + r.desc + ' :: ' + r.evidence); });
console.log('TOTAL: ' + (results.length - failed.length) + '/' + results.length + ' PASS');
process.exit(failed.length === 0 ? 0 : 1);