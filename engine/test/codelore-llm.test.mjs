// codelore-llm.test.mjs — explain 族 LLM 面 golden 契约测试两形态（#36/A-041/D-035②）
// 形态一 门控关：env 未配置 → llm_gate(configured=false) + 每面 llm_gated 降级披露 + runner 零调用（不真调 LLM 的机检证明）。
// 形态二 门控开：env 注入 + runner 回放 synthetic cassette → llm_narrative + llm_cost 计量。
// 绝不真调 LLM、不需要真 key；红证 = 未配置不静默/不超 cap/env 值不落 fact/畸形输入拒识。
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const C = await import(pathToFileURL(join(root, 'dist', 'upstream', 'codelore.js')).href);
const FX = join(HERE, 'fixtures', 'codelore', 'llm');
const manifest = JSON.parse(readFileSync(join(FX, 'manifest.json'), 'utf8'));
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const ADAPTER_SRC = readFileSync(join(root, 'src', 'upstream', 'codelore.ts'), 'utf8');
const fx = (n) => readFileSync(join(FX, n), 'utf8');

let n = 0;
const t = (name, fn) => { fn(); n++; };

const CTX = { runId: 'ut36', traceId: 't'.padEnd(32, '0'), repoRef: 'fixture', scale: 'Macro-C', observedAt: '2026-09-16T00:00:00Z' };
const fakeResolver = (binary) => ({ strategy: 'binary-discovery', binary, version: '0.28.0', pinned: true, error: null });
const throwRunner = () => { throw new Error('runner must not be called (gate closed)'); };
const J = (f) => JSON.parse(f.value_json);

// ---------- A. 契约表与 env 族 ----------
t('A1 LLM 面契约表 = explain-file + diff 两面', () => {
  assert.deepEqual(C.CODELORE_LLM_FACETS.map((f) => f.face), ['explain-file', 'diff']);
});
t('A2 CODELORE_LLM_* env 族五变量钉死（0.28.0 实物枚举）', () => {
  assert.deepEqual([...C.CODELORE_LLM_ENV_VARS].sort(), ['ANTHROPIC_API_KEY', 'CODELORE_LLM_API_KEY', 'CODELORE_LLM_BASE_URL', 'CODELORE_LLM_MODEL', 'CODELORE_LLM_PROVIDER'].sort());
});
t('A3 pin 0.28.0 不变 + binary-discovery 不变', () => {
  assert.equal(C.CODELORE_PINNED_VERSION, '0.28.0');
});
t('A4 manifest 三件 synthetic cassette sha256 钉死', () => {
  assert.equal(manifest.synthetic, true);
  for (const [name, spec] of Object.entries(manifest.files)) {
    const p = join(FX, spec.file);
    assert.ok(existsSync(p), name + ' missing');
    const raw = readFileSync(p, 'utf8');
    assert.equal(sha256(raw), spec.sha256, name + ' drift');
    assert.equal(Buffer.byteLength(raw, 'utf8'), spec.bytes, name + ' bytes drift');
  }
});

// ---------- B. 门控判读矩阵（纯函数） ----------
t('B1 空 env → 门控关（local-first 缺省 openai-compat，缺 CODELORE_LLM_MODEL）', () => {
  const g = C.resolveLlmGate({});
  assert.equal(g.configured, false);
  assert.equal(g.provider, 'openai-compat');
  assert.equal(g.reason, 'missing-env');
  assert.deepEqual(g.missing_env, ['CODELORE_LLM_MODEL']);
});
t('B2 CODELORE_LLM_MODEL 在 → 门控开', () => {
  const g = C.resolveLlmGate({ CODELORE_LLM_MODEL: 'ollama/qwen' });
  assert.equal(g.configured, true);
  assert.equal(g.provider, 'openai-compat');
  assert.deepEqual(g.missing_env, []);
});
t('B3 ANTHROPIC_API_KEY 在（无显式 PROVIDER）→ anthropic 门控开', () => {
  const g = C.resolveLlmGate({ ANTHROPIC_API_KEY: 'k' });
  assert.equal(g.configured, true);
  assert.equal(g.provider, 'anthropic');
});
t('B4 显式 PROVIDER=anthropic 但缺 key → 门控关 missing-env', () => {
  const g = C.resolveLlmGate({ CODELORE_LLM_PROVIDER: 'anthropic' });
  assert.equal(g.configured, false);
  assert.deepEqual(g.missing_env, ['ANTHROPIC_API_KEY']);
});
t('B5 未知 PROVIDER → unknown-provider 门控关', () => {
  const g = C.resolveLlmGate({ CODELORE_LLM_PROVIDER: 'bogus', CODELORE_LLM_MODEL: 'm' });
  assert.equal(g.configured, false);
  assert.equal(g.reason, 'unknown-provider');
  assert.equal(g.provider, null);
});
t('B6 空白值按未配置处理（trim）', () => {
  const g = C.resolveLlmGate({ CODELORE_LLM_MODEL: '   ' });
  assert.equal(g.configured, false);
  assert.deepEqual(g.missing_env, ['CODELORE_LLM_MODEL']);
});

// ---------- C. 形态一：门控关 = 显式降级披露 ----------
t('C1 门控关 → resolution+llm_gate+逐面 llm_gated+llm_cost，runner 零调用', () => {
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner: throwRunner, env: {}, explainPaths: ['a.ts', 'b.ts'], diffRange: 'r1..r2' }, CTX);
  assert.equal(facts[0].metric, 'upstream.resolution');
  assert.equal(facts[1].metric, 'codelore.llm_gate');
  const gate = J(facts[1]);
  assert.equal(gate.configured, false);
  assert.equal(gate.env_family, 'CODELORE_LLM_*');
  const gated = facts.filter((f) => f.metric === 'codelore.llm_gated');
  assert.equal(gated.length, 3);
  assert.deepEqual(gated.map((f) => f.subject_ref), ['a.ts', 'b.ts', 'r1..r2']);
  for (const f of gated) {
    const v = J(f);
    assert.equal(v.reason, 'gate-missing-env');
    assert.deepEqual(v.missing_env, ['CODELORE_LLM_MODEL']);
    assert.equal(v.provider, 'openai-compat');
  }
  const cost = J(facts.find((f) => f.metric === 'codelore.llm_cost'));
  assert.equal(cost.calls_attempted, 0);
  assert.equal(cost.calls_succeeded, 0);
  assert.deepEqual(cost.gated_faces.sort(), ['diff', 'explain-file']);
});
t('C2 门控关不静默：gated fact evidence 指向 env 族而非 argv', () => {
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner: throwRunner, env: {}, explainPaths: ['a.ts'], facets: [C.CODELORE_LLM_FACETS[0]] }, CTX);
  const g = facts.find((f) => f.metric === 'codelore.llm_gated');
  assert.equal(g.evidence_ref, 'env CODELORE_LLM_*');
});
t('C3 未 pin/二进制缺失 → 只出 resolution（沿用既有短路语义）', () => {
  const resolver = (binary) => ({ strategy: 'binary-discovery', binary, version: '9.9.9', pinned: false, error: null });
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver, runner: throwRunner, env: {} }, CTX);
  assert.equal(facts.length, 1);
  assert.equal(J(facts[0]).pinned, false);
});

// ---------- D. 形态二：门控开 = 正常形态（注入 runner 回放 cassette，绝不真调 LLM） ----------
t('D1 门控开全量 → llm_narrative ×3 + llm_cost 计量齐备', () => {
  const seenArgv = [];
  const runner = (bin, args) => {
    seenArgv.push(args.join(' '));
    if (args[0] === 'explain') return { ok: true, status: 0, stdout: fx('explain-llm-golden.txt'), stderrTail: '' };
    return { ok: true, status: 0, stdout: fx('diff-llm-golden.txt'), stderrTail: '' };
  };
  const env = { CODELORE_LLM_MODEL: 'fixture-model-0', CODELORE_LLM_BASE_URL: 'http://localhost:11434/v1' };
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env, explainPaths: ['src/demo.ts'], diffRange: 'HEAD~3..HEAD' }, CTX);
  assert.equal(seenArgv.length, 2);
  assert.equal(seenArgv[0], 'explain src/demo.ts --repo fixture --llm');
  assert.equal(seenArgv[1], 'diff HEAD~3..HEAD --repo fixture --format markdown --llm');
  const narr = facts.filter((f) => f.metric === 'codelore.llm_narrative');
  assert.equal(narr.length, 2);
  const v = J(narr[0]);
  assert.equal(v.face, 'explain-file');
  assert.equal(v.model, 'fixture-model-0');
  assert.equal(v.grounded, true);
  assert.deepEqual(v.uncited_claims, []);
  assert.ok(v.narrative.includes('code-health score is 80.5'));
  assert.equal(v.narrative_chars, v.narrative.length);
  assert.ok(v.base_chars > 0 && v.est_token_units === Math.ceil((v.base_chars + v.narrative_chars) / 4));
  const cost = J(facts.find((f) => f.metric === 'codelore.llm_cost'));
  assert.deepEqual([cost.calls_attempted, cost.calls_succeeded, cost.calls_failed, cost.calls_capped], [2, 2, 0, 0]);
  assert.equal(cost.call_cap, C.CODELORE_LLM_DEFAULT_CALL_CAP);
  assert.equal(cost.cap_source, 'default');
  assert.ok(cost.est_token_units_total > 0 && cost.narrative_chars_total > 0);
});
t('D2 uncited stamp → grounded=false + claims 原样列出', () => {
  const runner = () => ({ ok: true, status: 0, stdout: fx('explain-llm-uncited.txt'), stderrTail: '' });
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env: { CODELORE_LLM_MODEL: 'm' }, explainPaths: ['src/risky.ts'], facets: [C.CODELORE_LLM_FACETS[0]] }, CTX);
  const v = J(facts.find((f) => f.metric === 'codelore.llm_narrative'));
  assert.equal(v.grounded, false);
  assert.deepEqual(v.uncited_claims, ['copied from elsewhere', 'abandoned last week']);
});
t('D3 缺 narrative 段标 → llm_error(detail=narrative-marker-absent) 不出假阳性', () => {
  const runner = () => ({ ok: true, status: 0, stdout: 'fact sheet only\n\n[code-health]\n  score = 1\n', stderrTail: '' });
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env: { CODELORE_LLM_MODEL: 'm' }, explainPaths: ['x.ts'], facets: [C.CODELORE_LLM_FACETS[0]] }, CTX);
  const e = facts.find((f) => f.metric === 'codelore.llm_error');
  assert.ok(e);
  assert.equal(J(e).detail, 'narrative-marker-absent');
});
t('D4 runner 非零退出 → llm_error 不中断其余面', () => {
  const runner = (bin, args) => args[0] === 'explain' && args[1] === 'bad.ts'
    ? { ok: false, status: 4, stdout: '', stderrTail: 'configure an LLM endpoint' }
    : { ok: true, status: 0, stdout: fx('explain-llm-golden.txt'), stderrTail: '' };
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env: { CODELORE_LLM_MODEL: 'm' }, explainPaths: ['bad.ts', 'good.ts'], facets: [C.CODELORE_LLM_FACETS[0]] }, CTX);
  assert.ok(facts.find((f) => f.metric === 'codelore.llm_error' && f.subject_ref === 'bad.ts'));
  assert.ok(facts.find((f) => f.metric === 'codelore.llm_narrative' && f.subject_ref === 'good.ts'));
  assert.equal(J(facts.find((f) => f.metric === 'codelore.llm_cost')).calls_failed, 1);
});
t('D5 成本上限 input：maxLlmCalls=1 → 第 2 面 llm_gated(call-cap-reached)', () => {
  const runner = () => ({ ok: true, status: 0, stdout: fx('explain-llm-golden.txt'), stderrTail: '' });
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env: { CODELORE_LLM_MODEL: 'm' }, maxLlmCalls: 1, explainPaths: ['a.ts', 'b.ts'], facets: [C.CODELORE_LLM_FACETS[0]] }, CTX);
  assert.equal(facts.filter((f) => f.metric === 'codelore.llm_narrative').length, 1);
  const g = facts.find((f) => f.metric === 'codelore.llm_gated');
  assert.equal(J(g).reason, 'call-cap-reached');
  assert.equal(J(g).call_cap, 1);
  const cost = J(facts.find((f) => f.metric === 'codelore.llm_cost'));
  assert.equal(cost.calls_capped, 1);
  assert.equal(cost.cap_source, 'input');
});
t('D6 成本上限 env：MACRO_AUDIT_CODELORE_LLM_MAX_CALLS=1 生效且 cap_source=env', () => {
  const runner = () => ({ ok: true, status: 0, stdout: fx('explain-llm-golden.txt'), stderrTail: '' });
  const env = { CODELORE_LLM_MODEL: 'm', MACRO_AUDIT_CODELORE_LLM_MAX_CALLS: '1' };
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env, explainPaths: ['a.ts', 'b.ts'], facets: [C.CODELORE_LLM_FACETS[0]] }, CTX);
  const cost = J(facts.find((f) => f.metric === 'codelore.llm_cost'));
  assert.equal(cost.call_cap, 1);
  assert.equal(cost.cap_source, 'env');
  assert.equal(cost.calls_capped, 1);
});
t('D7 diff 面缺 diffRange → llm_gated(param-missing:diff-range)，不计调用', () => {
  const runner = throwRunner;
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env: { CODELORE_LLM_MODEL: 'm' }, facets: [C.CODELORE_LLM_FACETS[1]] }, CTX);
  const g = facts.find((f) => f.metric === 'codelore.llm_gated');
  assert.equal(J(g).reason, 'param-missing:diff-range');
  assert.equal(J(facts.find((f) => f.metric === 'codelore.llm_cost')).calls_attempted, 0);
});
t('D8 llmRefresh → argv 带 --llm-refresh', () => {
  const seen = [];
  const runner = (bin, args) => { seen.push(args.join(' ')); return { ok: true, status: 0, stdout: fx('explain-llm-golden.txt'), stderrTail: '' }; };
  C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env: { CODELORE_LLM_MODEL: 'm' }, llmRefresh: true, explainPaths: ['a.ts'], facets: [C.CODELORE_LLM_FACETS[0]] }, CTX);
  assert.ok(seen[0].endsWith('--llm --llm-refresh'));
});

// ---------- E. env 值保密（值永不进 fact，只落变量名） ----------
t('E1 env 秘密值不出现在任何 fact', () => {
  const runner = () => ({ ok: true, status: 0, stdout: fx('explain-llm-golden.txt'), stderrTail: '' });
  const env = { CODELORE_LLM_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'sk-ant-s3cr3t', CODELORE_LLM_API_KEY: 'sk-oa-s3cr3t' };
  const facts = C.collectCodeloreLlm({ repoRoot: 'fixture', resolver: fakeResolver, runner, env, explainPaths: ['a.ts'], diffRange: 'r..r' }, CTX);
  for (const f of facts) {
    assert.ok(!f.value_json.includes('s3cr3t'), f.metric + ' leaks secret');
    assert.ok(!f.evidence_ref.includes('s3cr3t'));
  }
});

// ---------- F. 解析器红证 ----------
t('F1 无段标输入 → narrative=null 其余字段空', () => {
  const p = C.parseLlmNarrative('plain text\n[sec]\n k = v\n');
  assert.equal(p.narrative, null);
  assert.equal(p.stamp, null);
});
t('F2 段标后无 stamp 行 → narrative 在、stamp/model/grounded 空', () => {
  const p = C.parseLlmNarrative('x\n## LLM narrative (advisory)\nhello world\n');
  assert.equal(p.narrative, 'hello world');
  assert.equal(p.stamp, null);
  assert.equal(p.grounded, null);
});

// ---------- G. 适配层零业务规则词 ----------
t('G1 适配层有进程调用且零业务规则词', () => {
  assert.ok(/spawnSync/.test(ADAPTER_SRC));
  assert.ok(!/threshold|verdict|RED|score_band/.test(ADAPTER_SRC), 'business-rule word in adapter');
});

console.log('CODELORE-LLM-TEST-OK ' + n + '/' + n);
