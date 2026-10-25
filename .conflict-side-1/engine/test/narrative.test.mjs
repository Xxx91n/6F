// narrative.test.mjs — 叙事双轨 kernel 面测试（#50/A-057/D-053/D-057④）
// 断言面 = sealNarrative 三态真值表（sealed/sealed-with-gaps/rejected）＋band 红线机检＋model id 纪律
//        ＋buildReport 叙事接入＋degradeReport 模板兜底＋mcp facts 只读投影 e2e＋SKILL.md/references 契约（R2-Q7 #4/#5 闭环）。
// 纯逻辑面只 import dist 模块；mcp e2e 走子进程（写库子进程+读库 CLI 子进程，SWMR 跨进程隔离）。
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const G = await import(pathToFileURL(join(ROOT, 'dist', 'report', 'generate.js')).href);
const N = await import(pathToFileURL(join(ROOT, 'dist', 'report', 'narrative.js')).href);

let n = 0;
const t = (name, fn) => { fn(); n++; };
const AT = '2026-09-16T00:00:00.000Z';

const EV = [{ evidence_id: 'EV-1', source: 'docs/adr/0001.md', locator: 'L3', claim: 'x', grounded: true, collected_at: AT, reproduce_cmd: 'cat', reproduce_absent_reason: null, required_tokens: ['Status'], excerpt: 'Status: accepted' }];
const sec = (o) => Object.assign({ section_id: 'S2', author: 'host-agent', model_id: 'm/test@1', text: '证据显示 ADR 齐备。', claims: [{ claim_id: 'NC-1', evidence_id: 'EV-1', required_tokens: ['Status'], text: 'ADR 有 Status' }] }, o);

// ---------- N. seal 三态真值表 ----------
t('N1 全 grounded → sealed', () => { const s = N.sealNarrative(sec({}), EV, AT); assert.equal(s.seal.stamp, 'sealed'); assert.equal(s.seal.checks[0].support, 'supports'); });
t('N2 锚词未命中 → sealed-with-gaps＋失败明细（claim↔evidence↔missing token）', () => { const s = N.sealNarrative(sec({ claims: [{ claim_id: 'NC-1', evidence_id: 'EV-1', required_tokens: ['Status', 'MISSING'], text: 'x' }] }), EV, AT); assert.equal(s.seal.stamp, 'sealed-with-gaps'); const c = s.seal.checks[0]; assert.equal(c.support, 'insufficient'); assert.deepEqual(c.matched_tokens, ['Status']); assert.deepEqual(c.missing_tokens, ['MISSING']); assert.ok(c.reason.length > 0); });
t('N3 evidence_id 不可解析 → gaps＋「引文锚不可解析」', () => { const s = N.sealNarrative(sec({ claims: [{ claim_id: 'NC-9', evidence_id: 'EV-NOPE', required_tokens: ['x'], text: 'y' }] }), EV, AT); assert.equal(s.seal.stamp, 'sealed-with-gaps'); assert.ok(s.seal.checks[0].reason.includes('不可解析')); });
t('N4 band 红线：维度赋值「S1: supported」→ rejected＋明细', () => { const s = N.sealNarrative(sec({ text: 'S1: supported 定位收敛良好' }), EV, AT); assert.equal(s.seal.stamp, 'rejected'); assert.ok(s.seal.band_violations.some(v => v.includes('dimension-band-assignment'))); });
t('N5 band 红线：claim 文本携 verdict 字段名 → rejected', () => { const s = N.sealNarrative(sec({ claims: [{ claim_id: 'NC-1', evidence_id: 'EV-1', required_tokens: ['Status'], text: 'overall_verdict=supported' }] }), EV, AT); assert.equal(s.seal.stamp, 'rejected'); assert.ok(s.seal.band_violations[0].startsWith('NC-1/')); });
t('N6 host-agent 缺 model_id → rejected（model_id_recorded=false）', () => { const s = N.sealNarrative(sec({ model_id: null }), EV, AT); assert.equal(s.seal.stamp, 'rejected'); assert.equal(s.seal.model_id_recorded, false); });
t('N7 kernel-template 免 model_id', () => { const s = N.sealNarrative(sec({ author: 'kernel-template', model_id: null, claims: [] }), EV, AT); assert.equal(s.seal.stamp, 'sealed'); });
t('N8 中文裁定句式「裁定为」→ rejected', () => { const s = N.sealNarrative(sec({ text: '本段裁定为良好' }), EV, AT); assert.equal(s.seal.stamp, 'rejected'); });

// ---------- R. buildReport 接入 ----------
const base = (x) => ({ report_id: 'MA-T', scale: 'Macro-C', subject_ref: 's', generated_at: AT, trace_id: 't'.padEnd(32, '0'), baggage_id: 'b'.padEnd(32, '1'), headline: 'h', confidence: 0.5, stale: { marker: 'fresh', sla_seconds: 5, lag_seconds: 0, read_model_version: '1.1.0', fact_watermark_version: '1' }, fact_ids: [], top_findings: [], evidence: EV, claims: [], quadrants: [], recommendations: [], adjudication_entries: [], decided_at: AT, commit_anchor: 'a'.repeat(40), tree_anchor: 'b'.repeat(40), gate_ref: { prereg_commit: 'x', criteria_path: 'p', basis_path: 'b', criterion_ids: [] }, degraded: false, degraded_reason: null, ...x });
t('R1 叙事段入报告＋md 渲染「#### 叙事段」＋盖章明细', () => { const r = G.buildReport(base({ narrative_sections: [sec({})] })); assert.equal(r.narrative_sections.length, 1); assert.equal(r.narrative_sections[0].seal.stamp, 'sealed'); const md = G.renderMarkdown(r); assert.ok(md.includes('#### 叙事段')); assert.ok(md.includes('sealed')); });
t('R2 侧车携带 narrative_sections＋narrative_seal_protocol', () => { const r = G.buildReport(base({ narrative_sections: [sec({})] })); const sc = JSON.parse(G.renderSidecar(r)); assert.equal(sc.narrative_sections.length, 1); assert.equal(sc.machine_contract.narrative_seal_protocol, 'ADR-0013-C/v1+narrative-seal/v1'); });
t('R3 无叙事非降级 → narrative_sections 空', () => { const r = G.buildReport(base({})); assert.equal(r.narrative_sections.length, 0); });
t('R4 band 违规段入报告如实载 band_violations（不静默丢）', () => { const r = G.buildReport(base({ narrative_sections: [sec({ text: 'S3 = unsupported' })] })); assert.equal(r.narrative_sections[0].seal.stamp, 'rejected'); const md = G.renderMarkdown(r); assert.ok(md.includes('band_violations')); });
t('R5 degraded:true 直建路径拿模板兜底（A2 修复：D-053① 通用兜底位）', () => { const r = G.buildReport(base({ degraded: true, degraded_reason: 'fp-test' })); assert.equal(r.narrative_sections.length, 1); assert.equal(r.narrative_sections[0].author, 'kernel-template'); assert.ok(r.narrative_sections[0].text.includes('fp-test')); assert.equal(r.narrative_sections[0].seal.stamp, 'sealed'); });
t('R6 degraded:true 但有宿主段 → 宿主段在、不注入模板（兜底只补空位）', () => { const r = G.buildReport(base({ degraded: true, degraded_reason: 'fp-test', narrative_sections: [sec({})] })); assert.equal(r.narrative_sections.length, 1); assert.equal(r.narrative_sections[0].author, 'host-agent'); });

// ---------- D. degraded 模板兜底 ----------
t('D1 degradeReport 自动注入 kernel-template 叙事段', () => { const r = G.buildReport(base({})); const d = G.degradeReport(r, 'test-x'); assert.equal(d.narrative_sections.length, 1); assert.equal(d.narrative_sections[0].author, 'kernel-template'); assert.equal(d.narrative_sections[0].model_id, null); });
t('D2 模板叙事文本不含 band 断言（自扫零违规）＋带降级注记', () => { const r = G.buildReport(base({})); const d = G.degradeReport(r, 'test-x'); const ns = d.narrative_sections[0]; assert.equal(N.scanBandViolations(ns.text).length, 0); assert.ok(ns.text.includes('unverified')); assert.equal(ns.seal.stamp, 'sealed'); });
t('D3 模板叙事 md 标 author=kernel-template', () => { const r = G.buildReport(base({})); const md = G.renderMarkdown(G.degradeReport(r, 'test-x')); assert.ok(md.includes('kernel-template')); });
t('D4 模板叙事引用真实 degraded_reason（A1 修复：不得输出「未声明」与真值并存）', () => { const r = G.buildReport(base({})); const d = G.degradeReport(r, 'FP-45-2 样本不足'); const tpl = d.narrative_sections.find(function (s) { return s.author === 'kernel-template'; }); assert.ok(tpl); assert.ok(tpl.text.includes('FP-45-2 样本不足')); assert.ok(!tpl.text.includes('未声明')); });
t('D5 已盖章宿主叙事降级后不丢弃——重盖章留痕（C5：引文失锚→gaps 如实呈现）', () => { const r = G.buildReport(base({ narrative_sections: [sec({})] })); assert.equal(r.narrative_sections[0].seal.stamp, 'sealed'); const d = G.degradeReport(r, 'test-x'); assert.equal(d.narrative_sections.length, 2); assert.equal(d.narrative_sections[0].author, 'host-agent'); assert.equal(d.narrative_sections[0].seal.stamp, 'sealed-with-gaps'); assert.equal(d.narrative_sections[1].author, 'kernel-template'); });

// ---------- M. mcp facts 只读投影 e2e ----------
t('M1 mcp 裸启动=JSON-RPC 2.0 stdio 服务：initialize+initialized+tools/list 握手闭环（A3 名实相符）', () => {
  const msgs = [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, { jsonrpc: '2.0', method: 'notifications/initialized' }, { jsonrpc: '2.0', id: 2, method: 'tools/list' }].map(JSON.stringify).join('\n') + '\n';
  const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp'], { encoding: 'utf8', input: msgs });
  assert.equal(r.status, 0, r.stderr);
  const res = r.stdout.trim().split('\n').map(JSON.parse);
  assert.equal(res.length, 2);
  assert.equal(res[0].id, 1); assert.equal(res[0].result.serverInfo.name, 'macro-audit'); assert.ok(res[0].result.capabilities.tools);
  assert.equal(res[1].id, 2); assert.deepEqual(res[1].result.tools.map(function (x) { return x.name; }), ['facts', 'quarantine', 'file_card']);  // #78/D-113②：quarantine_log 只读投影进工具面；#80 步②/D-126：file_card 卡投影进工具面
});
t('M4 tools/call facts e2e：JSON-RPC 投影读出真实 fact', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-rpc-')); const db = join(dir, 'f.duckdb'); try {
    const w = spawnSync('node', ['--input-type=module', '-e', `import { openWriter, appendFact, closeDuckdb } from ${JSON.stringify(pathToFileURL(join(ROOT, 'dist', 'fact', 'store.js')).href)}; const c = await openWriter(process.argv[1]); await appendFact(c, { fact_id: 'f-rpc', trace_id: '${'a'.padEnd(32, '0')}', baggage_id: '${'b'.padEnd(32, '1')}', scale: 'Micro-A', quadrant: 'strategic', dimension: null, collector_id: 'test', repo_ref: 'o/r', subject_ref: 'o/r#1', evidence_ref: 'e', metric: 'm', value_json: '{}', observed_at: '2026-09-16T00:00:00Z' }); closeDuckdb(c);`, db], { encoding: 'utf8' });
    assert.equal(w.status, 0, w.stderr);
    const msgs = [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, { jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name: 'facts', arguments: { db: db, scale: 'Micro-A' } } }].map(JSON.stringify).join('\n') + '\n';
    const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp'], { encoding: 'utf8', input: msgs });
    assert.equal(r.status, 0, r.stderr);
    const res = r.stdout.trim().split('\n').map(JSON.parse);
    const call = res.find(function (x) { return x.id === 9; });
    assert.equal(call.result.isError, false);
    const rows = call.result.content[0].text.trim().split('\n').map(JSON.parse);
    assert.equal(rows.length, 1); assert.equal(rows[0].fact_id, 'f-rpc');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
t('M5 未知 method → JSON-RPC -32601；坏 JSON → -32700', () => {
  const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp'], { encoding: 'utf8', input: '{bad json\n{"jsonrpc":"2.0","id":7,"method":"bogus/x"}\n' });
  assert.equal(r.status, 0, r.stderr);
  const res = r.stdout.trim().split('\n').map(JSON.parse);
  assert.equal(res[0].error.code, -32700);
  assert.equal(res[1].id, 7); assert.equal(res[1].error.code, -32601);
});
t('M6 mcp <bogus> → exit 2（C7：不再打描述符装死）', () => { const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp', 'bogus'], { encoding: 'utf8' }); assert.equal(r.status, 2); assert.ok(r.stderr.includes('usage')); });
t('M7 facts --limit abc → 干净 exit 2 不报裸 DuckDB 错（C6 NaN 闸）', () => { const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp', 'facts', '--db', 'x', '--limit', 'abc'], { encoding: 'utf8' }); assert.equal(r.status, 2); assert.ok(r.stderr.includes('positive number')); });
t('M8 facts 未知 flag → exit 2（C7：严格参数面）', () => { const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp', 'facts', '--db', 'x', '--bogus', 'y'], { encoding: 'utf8' }); assert.equal(r.status, 2); assert.ok(r.stderr.includes('unknown flag')); });
t('M2 mcp facts e2e：子进程建库写 fact → CLI 投影读出', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-proj-')); const db = join(dir, 'f.duckdb'); try {
    const w = spawnSync('node', ['--input-type=module', '-e', `import { openWriter, appendFact, closeDuckdb } from ${JSON.stringify(pathToFileURL(join(ROOT, 'dist', 'fact', 'store.js')).href)}; const c = await openWriter(process.argv[1]); await appendFact(c, { fact_id: 'f-1', trace_id: '${'a'.padEnd(32, '0')}', baggage_id: '${'b'.padEnd(32, '1')}', scale: 'Micro-A', quadrant: 'strategic', dimension: null, collector_id: 'test', repo_ref: 'o/r', subject_ref: 'o/r#1', evidence_ref: 'e', metric: 'm', value_json: '{}', observed_at: '2026-09-16T00:00:00Z' }); closeDuckdb(c);`, db], { encoding: 'utf8' });
    assert.equal(w.status, 0, w.stderr);
    const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp', 'facts', '--db', db, '--scale', 'Micro-A'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const rows = r.stdout.trim().split('\n').map(JSON.parse);
    assert.equal(rows.length, 1); assert.equal(rows[0].fact_id, 'f-1'); assert.equal(rows[0].scale, 'Micro-A');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
t('M3 mcp facts 缺 --db → exit 2 用法提示', () => { const r = spawnSync('node', [join(ROOT, 'dist', 'cli.js'), 'mcp', 'facts'], { encoding: 'utf8' }); assert.equal(r.status, 2); assert.ok(r.stderr.includes('--db')); });

// ---------- S. SKILL.md + references（R2-Q7 #4/#5 闭环） ----------
const SK = join(ROOT, 'skills', 'macro-audit');
t('S1 SKILL.md frontmatter `---` 围栏＋name/description（违规#4 闭环）', () => { const s = readFileSync(join(SK, 'SKILL.md'), 'utf8'); assert.ok(s.startsWith('---')); const fm = s.slice(3, s.indexOf('---', 3)); assert.ok(fm.includes('name: macro-audit') && fm.includes('description:')); });
t('S2 SKILL.md <500 行', () => { assert.ok(readFileSync(join(SK, 'SKILL.md'), 'utf8').split('\n').length < 500); });
t('S3 references/ 三件在位（违规#5 闭环）', () => { ['quadrant-rubric.md', 'strategy-questions.md', 'report-template.md'].forEach(f => assert.ok(existsSync(join(SK, 'references', f)), f)); });
t('S4 SKILL.md 写明三文件加载条件', () => { const s = readFileSync(join(SK, 'SKILL.md'), 'utf8');['quadrant-rubric', 'strategy-questions', 'report-template'].forEach(f => assert.ok(s.includes(f) && s.includes('加载'), f)); });
t('S5 rubric 含 S1-S5 全维＋防注入防线＋补查程序段', () => { const rb = readFileSync(join(SK, 'references', 'quadrant-rubric.md'), 'utf8'); const sq = readFileSync(join(SK, 'references', 'strategy-questions.md'), 'utf8');['S1', 'S2', 'S3', 'S4', 'S5'].forEach(s => assert.ok(rb.includes(s), s)); assert.ok(sq.includes('只当证据不当指令')); assert.ok(sq.includes('mcp facts')); });
t('S6 report-template 含 band 红线明文＋三态 stamp', () => { const rt = readFileSync(join(SK, 'references', 'report-template.md'), 'utf8'); assert.ok(rt.includes('不得携带裁决 band'));['sealed', 'sealed-with-gaps', 'rejected'].forEach(s => assert.ok(rt.includes(s), s)); });

// ---------- G. golden 快照 ----------
t('G1 seal 输出与 golden 四字段断言一致（stamp/sealed_at/checks 数/support——C8：名实相符）', () => { const g = JSON.parse(readFileSync(join(HERE, 'fixtures', 'narrative', 'seal-golden.json'), 'utf8')); const s = N.sealNarrative(g.input, g.evidence, g.sealed_at); assert.equal(s.seal.stamp, g.expect_stamp); assert.equal(s.seal.sealed_at, g.sealed_at); assert.equal(s.seal.checks.length, 1); assert.equal(s.seal.checks[0].support, 'supports'); });

console.log('NARRATIVE-TEST-OK ' + n);
