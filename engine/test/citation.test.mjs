// citation.test.mjs —— #56 checker 语义边界测试（D-065：presence-level 文档化＋三表否定剥离＋引语表＋fail-safe＋二态维持）
// 分层：positive / neg-pre / neg-post / pseudo-neg / quoted / attributed / CJK / unbalanced / ungrounded / 披露
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const C = await import(pathToFileURL(join(HERE, '..', 'dist', 'report', 'citation.js')).href);

let n = 0;
function t(name, fn) { n++; fn(); console.log('PASS ' + name); }

function ev(excerpt, grounded) {
  return { evidence_id: 'EV-T', source: 'test', locator: 'L1', claim: 't', grounded: grounded !== false, collected_at: 't', reproduce_cmd: 'r', reproduce_absent_reason: null, required_tokens: [], excerpt: excerpt };
}
function cl(toks) { return { claim_id: 'CL-T', evidence_id: 'EV-T', required_tokens: toks }; }
function support(x, toks) { return C.checkCitationSupport(cl(toks), ev(x)); }

// ---------- A. presence-level 正向 ----------
t('A1 字面锚全命中 → supports', () => { const r = support('coverage ratio 0.85 measured', ['coverage', '0.85']); assert.equal(r.support, 'supports'); assert.deepEqual(r.missing_tokens, []); });
t('A2 部分锚缺席 → insufficient＋missing 明细', () => { const r = support('coverage measured', ['coverage', '0.85']); assert.equal(r.support, 'insufficient'); assert.deepEqual(r.missing_tokens, ['0.85']); });
t('A3 CJK 双锚全命中 → supports', () => { assert.equal(support('覆盖率 0.85 已达标', ['覆盖率', '0.85']).support, 'supports'); });

// ---------- B. pre-negation ----------
t('B1 does not 前置否定 → insufficient', () => { assert.equal(support('coverage ratio does not reach 0.85', ['coverage', '0.85']).support, 'insufficient'); });
t('B2 cannot 前置否定 → insufficient', () => { assert.equal(support('TC-2 cannot be judged RED', ['TC-2', 'RED']).support, 'insufficient'); });
t('B3 never/lacks/failed 前置 → insufficient', () => { assert.equal(support('the metric never reached 0.85', ['0.85']).support, 'insufficient'); assert.equal(support('bundle lacks 71 files', ['71']).support, 'insufficient'); assert.equal(support('coverage failed to hit 0.85', ['0.85']).support, 'insufficient'); });
t('B4 否定 cue 超窗 → 不剥（NEG_WINDOW_PRE 边界）', () => { const pad = 'x'.repeat(70); assert.equal(support('not ' + pad + ' coverage 0.85 hit', ['coverage', '0.85']).support, 'supports'); });

// ---------- C. post-negation ----------
t('C1 is incorrect 后置 → insufficient', () => { assert.equal(support('coverage 0.85 is incorrect', ['coverage', '0.85']).support, 'insufficient'); });
t('C2 unverified/was denied 后置 → insufficient', () => { assert.equal(support('the 0.85 figure remains unverified', ['0.85']).support, 'insufficient'); assert.equal(support('fact_count 280 was denied', ['280']).support, 'insufficient'); });
t('C3 cannot be confirmed 后置 → insufficient', () => { assert.equal(support('coverage 0.85 cannot be confirmed', ['coverage', '0.85']).support, 'insufficient'); });

// ---------- D. pseudo-negation 豁免 ----------
t('D1 not only/no doubt/not merely → supports', () => { assert.equal(support('coverage not only reached 0.85', ['0.85']).support, 'supports'); assert.equal(support('no doubt the metric hit 0.85', ['0.85']).support, 'supports'); assert.equal(support('coverage 0.85 is not merely a claim', ['0.85']).support, 'supports'); });
t('D2 nothing but/make no mistake → supports', () => { assert.equal(support('the count is nothing but 280', ['280']).support, 'supports'); assert.equal(support('make no mistake: coverage hit 0.85', ['0.85']).support, 'supports'); });

// ---------- E. CJK 否定（独立词表） ----------
t('E1 不/没有/未达到/无法/否认/并非 前置 → insufficient', () => { for (const x of ['覆盖率不支持 0.85 的说法', '覆盖率没有达到 0.85', '覆盖率未达到 0.85 阈值', '无法确认覆盖率为 0.85', '否认覆盖率达 0.85', '覆盖率并非 0.85']) { assert.equal(support(x, ['覆盖率', '0.85']).support, 'insufficient', x); } });
t('E2 不成立/有误 后置 → insufficient', () => { assert.equal(support('覆盖率 0.85 不成立', ['覆盖率', '0.85']).support, 'insufficient'); assert.equal(support('覆盖率 0.85 有误', ['覆盖率', '0.85']).support, 'insufficient'); });
t('E3 CJK 伪否定：不得不/非常/无疑/未必不 → supports', () => { for (const x of ['覆盖率不得不说达到 0.85', '覆盖率非常稳定在 0.85', '覆盖率无疑达到 0.85', '覆盖率未必不达到 0.85']) { assert.equal(support(x, ['覆盖率', '0.85']).support, 'supports', x); } });

// ---------- F. 引语包裹 ----------
t('F1 言语 cue+语句引语 → insufficient', () => { assert.equal(support('批评者说："coverage reached 0.85 in tests"', ['coverage', '0.85']).support, 'insufficient'); });
t('F2 CJK 角引语句 → insufficient', () => { assert.equal(support('批评者指出：「覆盖率达 0.85，结论成立」', ['覆盖率', '0.85']).support, 'insufficient'); });
t('F3 术语引号不剥（非语句形态） → supports', () => { assert.equal(support('the field "coverage" shows 0.85', ['coverage', '0.85']).support, 'supports'); assert.equal(support('「覆盖率」指标达 0.85', ['覆盖率', '0.85']).support, 'supports'); });
t('F4 语句形态引语无 cue 也剥 → insufficient', () => { assert.equal(support('outer text "the coverage ratio reached 0.85 yesterday" more', ['coverage', '0.85']).support, 'insufficient'); });

// ---------- G. 归属引导 ----------
t('G1 据称/they claimed 归属 → insufficient', () => { assert.equal(support('据称 coverage 已达 0.85', ['coverage', '0.85']).support, 'insufficient'); assert.equal(support('they claimed coverage was 0.85', ['coverage', '0.85']).support, 'insufficient'); });

// ---------- H. fail-safe 不确定语境 ----------
t('H1 悬挂直双引号 → 全篇掩蔽 insufficient', () => { assert.equal(support('coverage reached 0.85" trailing stray', ['coverage', '0.85']).support, 'insufficient'); });
t('H2 悬挂 CJK 闭号 → insufficient', () => { assert.equal(support('覆盖率 0.85 达标」残留闭号', ['覆盖率', '0.85']).support, 'insufficient'); });
t('H3 悬挂 CJK 开号：其后命中掩蔽、其前命中存活', () => { assert.equal(support('「coverage 0.85 未达标', ['coverage', '0.85']).support, 'insufficient'); assert.equal(support('覆盖率 0.85「未闭合引语', ['覆盖率', '0.85']).support, 'supports'); });

// ---------- I. 二态与结构 ----------
t('I1 输出恒二态（supports/insufficient 无第三态）', () => { const outs = C.checkAllCitations([cl(['x']), cl(['y'])], [ev('x present'), ev('no y here')]); for (const r of outs) { assert.ok(r.support === 'supports' || r.support === 'insufficient'); } });
t('I2 ungrounded → insufficient 一票否决', () => { const r = C.checkCitationSupport(cl(['coverage']), ev('coverage 0.85', false)); assert.equal(r.support, 'insufficient'); });
t('I3 context_flags 记录剥离明细（negated 机读位）', () => { const r = support('coverage does not reach 0.85', ['coverage', '0.85']); assert.ok(r.context_flags.some(function (f) { return f.indexOf('negated') === 0; }), JSON.stringify(r.context_flags)); });
t('I4 evidence_id 不可解析 → insufficient', () => { const r = C.checkAllCitations([{ claim_id: 'X', evidence_id: 'MISSING', required_tokens: ['a'] }], [ev('a')]); assert.equal(r[0].support, 'insufficient'); });

// ---------- J. 语义边界披露 ----------
t('J1 PRESENCE_LIMITS 语义边界披露四键全（supports 非语义蕴含）', () => { const L = C.PRESENCE_LIMITS; assert.ok(L.semantics.indexOf('presence-level') >= 0 && L.semantics.indexOf('非语义蕴含') >= 0); assert.deepEqual([...L.output_states], ['supports', 'insufficient']); assert.ok(L.fn_disclosure.indexOf('human-in-loop') >= 0); assert.ok(L.adversarial_fp_guard.length > 0); });
t('J2 预声明窗口常量导出（NEG_WINDOW_PRE/POST 正值）', () => { assert.ok(C.NEG_WINDOW_PRE > 0 && C.NEG_WINDOW_POST > 0); });


// ---------- K. CJK non-assert 语境窗（#61/D-069①——假想/示例语境非断言式主张，flag kind=non-asserted） ----------
const hasNa = (r) => r.context_flags.some(function (f) { return f.indexOf('non-asserted') === 0; });
t('K1 CJK pre 假想/示例 cue → insufficient＋non-asserted', () => { for (const c of ['假设覆盖率 0.85 已达标', '譬如覆盖率 0.85 已达标', '举例来说覆盖率 0.85 已达标', '设想覆盖率 0.85 已达标']) { const r = support(c, ['覆盖率', '0.85']); assert.equal(r.support, 'insufficient', c); assert.ok(hasNa(r), c + ' flags=' + r.context_flags); } });
t('K2 CJK post 限定 cue → insufficient＋non-asserted', () => { for (const c of ['覆盖率 0.85 理论上成立', '覆盖率 0.85 原则上成立', '覆盖率 0.85 仅供参考']) { const r = support(c, ['覆盖率', '0.85']); assert.equal(r.support, 'insufficient', c); assert.ok(hasNa(r), c + ' flags=' + r.context_flags); } });
t('K3 CJK non-assert 伪表逐词豁免 → supports（一词两用：假设=名词性 hypothesis）', () => { for (const c of ['零假设检验下覆盖率 0.85', '假设检验覆盖率 0.85 已达标', '工作假设覆盖率 0.85 已达标', '假设性覆盖率 0.85 已达标']) { assert.equal(support(c, ['覆盖率', '0.85']).support, 'supports', c); } });
t('K4 「假说」speech 误吞豁免 → supports（CJK_SPEECH_PSEUDO 同族补收）', () => { assert.equal(support('假说覆盖率 0.85', ['覆盖率', '0.85']).support, 'supports'); });
t('K5 「严格来说」不收（限定语非假想语境）→ 无 non-asserted flag', () => { const r = support('严格来说覆盖率 0.85 已达标', ['覆盖率', '0.85']); assert.ok(!hasNa(r), JSON.stringify(r.context_flags)); });
t('K6 「理论」不收「理论上」收（理论物理豁免）→ supports', () => { assert.equal(support('理论物理覆盖率 0.85 已达标', ['覆盖率', '0.85']).support, 'supports'); });
t('K7 EN non-assert 接线实证（此前声明未接）→ insufficient＋non-asserted', () => { const r = support('for example coverage 0.85 reached', ['coverage', '0.85']); assert.equal(r.support, 'insufficient'); assert.ok(hasNa(r), JSON.stringify(r.context_flags)); });
t('K8 赋值豁免复用（cue 紧邻 = 右侧非主张）→ supports', () => { assert.equal(support('mode=假设 覆盖率 0.85 已达标', ['覆盖率', '0.85']).support, 'supports'); });
t('K9 ≥2 字词形纪律：单字不吞（「设」不剥）→ supports', () => { assert.equal(support('设计覆盖率 0.85 已达标', ['覆盖率', '0.85']).support, 'supports'); });

console.log('CITATION-TEST-OK ' + n);
