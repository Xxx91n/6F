// #36 守卫——explain 族 LLM 面：实物枚举对账 + env 门控契约 + 成本验收面 + 引擎不回归
// 用法：node 36-check.mjs → 逐条 PASS/FAIL；exit 0 = 全 PASS，exit 1 = 有 FAIL
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..', '..');
const ENG = join(ROOT, 'engine');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

// --- A. 实物枚举存档与对账 ---
const need = ['36-top-help.txt', '36-explain-help.txt', '36-explain-topics.txt', '36-diff-help.txt', '36-explain-llm-unconfigured.stdout.txt', '36-explain-llm-unconfigured.stderr.txt', '36-probe-measurements.json', '36-llm-faces-reconciliation.json'];
t('A1 枚举/证据存档齐备', need.every((f) => fs.existsSync(join(here, f))), need.filter((f) => !fs.existsSync(join(here, f))).join(','));
const pm = JSON.parse(fs.readFileSync(join(here, '36-probe-measurements.json'), 'utf8'));
t('A2 探针实测：version=0.28.0 + explain/diff 均带 --llm 旗标', pm.version === 'codelore 0.28.0' && pm.explain_help_has_llm_flag && pm.diff_help_has_llm_flag && pm.explain_help_mentions_env_family, '');
t('A3 门控关实测证据：--llm 未配置 → exit 4 + stderr 显式错误 + dossier 仍出（不静默）', pm.unconfigured_llm.exit === 4 && pm.unconfigured_llm.explicit_error && pm.unconfigured_llm.dossier_still_emitted, 'exit=' + pm.unconfigured_llm.exit);
const recon = JSON.parse(fs.readFileSync(join(here, '36-llm-faces-reconciliation.json'), 'utf8'));
t('A4 analyze 枚举 explain-* 面数=0 如实登记（explain 族非 analyze 成员）', recon.analyze_enum_explain_family.count === 0, '');
t('A5 explain topics=46 登记 + LLM 面=3（2 contracted + 1 deferred）', recon.explain_topics.count === 46 && recon.llm_faces.length === 3 && recon.llm_faces.filter((f) => f.disposition.startsWith('contracted')).length === 2, '');
const ev = Object.keys(recon.env_contract.vars).sort();
t('A6 env 契约五变量齐备（PROVIDER/BASE_URL/API_KEY/MODEL + ANTHROPIC_API_KEY）', JSON.stringify(ev) === JSON.stringify(['ANTHROPIC_API_KEY', 'CODELORE_LLM_API_KEY', 'CODELORE_LLM_BASE_URL', 'CODELORE_LLM_MODEL', 'CODELORE_LLM_PROVIDER']), ev.join(','));
t('A7 成本契约落文：计量字段 + 上限判据 + 超限降级路径 + 估算位注记', /calls_attempted/.test(recon.cost_contract.metering_fields) && /call_cap/.test(recon.cost_contract.cap_fields) && /call-cap-reached/.test(recon.cost_contract.over_cap_path) && /估算位/.test(recon.cost_contract.token_estimate_slot), '');

// --- B. 适配层契约（ADR-0014 纪律） ---
const src = fs.readFileSync(join(ENG, 'src', 'upstream', 'codelore.ts'), 'utf8');
t('B1 LLM 面出口齐备（FACETS/gate/collect/parser/env 族常量）', ['CODELORE_LLM_FACETS', 'resolveLlmGate', 'collectCodeloreLlm', 'parseLlmNarrative', 'CODELORE_LLM_ENV_VARS', 'codelore.llm_gate', 'codelore.llm_gated', 'codelore.llm_narrative', 'codelore.llm_error', 'codelore.llm_cost'].every((s) => src.includes(s)), '');
t('B2 适配层有进程调用且零业务规则词', /spawnSync/.test(src) && !/threshold|verdict|RED|score_band/.test(src), '');
t('B3 pin 0.28.0 + binary-discovery 不变 + 首批 30 面无 LLM 混入', src.includes("CODELORE_PINNED_VERSION = '0.28.0'") && src.includes('binary-discovery') && !/CODELORE_BATCH1_FACETS[^;]*explain/.test(src), '');
const dist = fs.readFileSync(join(ENG, 'dist', 'upstream', 'codelore.js'), 'utf8');
t('B4 dist 编译产物含 LLM 面出口', dist.includes('collectCodeloreLlm') && dist.includes('resolveLlmGate'), '');

// --- C. 契约测试接入与两形态 ---
const pkg = JSON.parse(fs.readFileSync(join(ENG, 'package.json'), 'utf8'));
t('C1 smoke 链接入 codelore-llm.test.mjs（CI 三平台同跑）', pkg.scripts.smoke.includes('codelore-llm.test.mjs'), '');
const testSrc = fs.readFileSync(join(ENG, 'test', 'codelore-llm.test.mjs'), 'utf8');
t('C2 两形态在测：门控关 runner 零调用 + 门控开注入回放 + 秘密值断言', testSrc.includes('throwRunner') && /runner must not be called/.test(testSrc) && testSrc.includes('s3cr3t'), '');
const llmRun = spawnSync('node', [join(ENG, 'test', 'codelore-llm.test.mjs')], { encoding: 'utf8' });
const m = (llmRun.stdout || '').match(/CODELORE-LLM-TEST-OK (\d+)\/(\d+)/);
t('C3 契约测试实跑全绿', llmRun.status === 0 && m && m[1] === m[2], (m && m[0]) || (llmRun.stderr || '').slice(-200));

// --- D. deferred 面跟踪位（防 #35 W1 重演） ---
const reg = JSON.parse(fs.readFileSync(join(here, '33-gate-registry.json'), 'utf8'));
const mcpItem = reg.items.find((i) => i.id === 'codelore-llm-mcp-face');
t('D1 mcp explain_file 挂 manual_watch 跟踪项（deferred 不静默丢失）', !!mcpItem && mcpItem.watch === 'manual_watch' && !!mcpItem.deadline && !!mcpItem.trigger && !!mcpItem.review_at && mcpItem.status === 'pending', '');
const g33 = spawnSync('node', [join(here, '33-check.mjs')], { encoding: 'utf8' });
t('D2 33-check 回归不破坏', g33.status === 0, (g33.stdout || '').trim().split('\n').pop());

// --- E. 门控语义活断言（守卫内嵌实跑，dist 直 import） ---
const C = await import(pathToFileURL(join(ENG, 'dist', 'upstream', 'codelore.js')).href);
const CTX = { runId: 'g36', traceId: 't'.padEnd(32, '0'), repoRef: 'guard', scale: 'Macro-C', observedAt: '2026-09-16T00:00:00Z' };
const resolver = (b) => ({ strategy: 'binary-discovery', binary: b, version: '0.28.0', pinned: true, error: null });
const boom = () => { throw new Error('must-not-call'); };
t('E1 门控判读：{} → 关（openai-compat 缺 MODEL）；{MODEL} → 开；{PROVIDER:bogus} → unknown', !C.resolveLlmGate({}).configured && C.resolveLlmGate({ CODELORE_LLM_MODEL: 'm' }).configured && C.resolveLlmGate({ CODELORE_LLM_PROVIDER: 'bogus' }).reason === 'unknown-provider', '');
t('E2 门控关 collect → llm_gated 披露 + runner 零调用 + llm_cost 汇总', (() => {
  const facts = C.collectCodeloreLlm({ repoRoot: 'guard', resolver, runner: boom, env: {}, explainPaths: ['a.ts'], diffRange: 'x..y' }, CTX);
  const cost = JSON.parse(facts.find((f) => f.metric === 'codelore.llm_cost').value_json);
  return facts.filter((f) => f.metric === 'codelore.llm_gated').length === 2 && cost.calls_attempted === 0;
})(), '');
t('E3 门控开 collect → llm_narrative + 计量字段（est_token_units/call_cap/cap_source）', (() => {
  const fake = 'fact sheet for a.ts\n\n[code-health]\n  score = 9\n\n## LLM narrative (advisory)\nall good.\n\nadvisory m-0, grounded\n';
  const facts = C.collectCodeloreLlm({ repoRoot: 'guard', resolver, runner: () => ({ ok: true, status: 0, stdout: fake, stderrTail: '' }), env: { CODELORE_LLM_MODEL: 'm' }, explainPaths: ['a.ts'], facets: [{ face: 'explain-file' }] }, CTX);
  const v = JSON.parse(facts.find((f) => f.metric === 'codelore.llm_narrative').value_json);
  const cost = JSON.parse(facts.find((f) => f.metric === 'codelore.llm_cost').value_json);
  return v.model === 'm-0' && v.grounded === true && v.est_token_units > 0 && cost.calls_succeeded === 1 && cost.cap_source === 'default';
})(), '');
t('E4 超限降级路径活断言：cap=1 时第 2 面 call-cap-reached', (() => {
  const fake = 'fact sheet\n\n[s]\n  k = 1\n\n## LLM narrative (advisory)\nn.\n\nadvisory m, grounded\n';
  const facts = C.collectCodeloreLlm({ repoRoot: 'guard', resolver, runner: () => ({ ok: true, status: 0, stdout: fake, stderrTail: '' }), env: { CODELORE_LLM_MODEL: 'm' }, maxLlmCalls: 1, explainPaths: ['a.ts', 'b.ts'], facets: [{ face: 'explain-file' }] }, CTX);
  return facts.some((f) => f.metric === 'codelore.llm_gated' && JSON.parse(f.value_json).reason === 'call-cap-reached');
})(), '');

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
