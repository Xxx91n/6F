// 52a-gen-corpus.mjs —— #52a 合成 claim-evidence 语料生成器（D-061；确定性构造，版本化 golden claim set）
// 构造纪律：gold 标签=构造意图标签（合成语料身份如实披露）；双标子集 gold_b=同一标定者二轮独立标注
// （intra-rater——单人标定的诚实口径，非双人互标；限制披露随 eval JSON 一起走）。
// 分层=checker 判定空间：presence 成立/不成立、grounded=false/excerpt 空、证据锚不可解析、
//   语义对抗 FN（改写/同义——presence≠support 的 CiteEval 区分面）、语义对抗 FP（否定/引语包裹命中）、
//   边界样本（大小写/边界位/CJK 混排/部分命中）、band-leak 注入（6 模式×注入＋干净对照）。
// 产出：52a-checker-eval-corpus.json（UTF-8 无 BOM；内容哈希进 eval 结果作 corpus 身份指纹）。
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const TS = '2026-04-10T10:00:00Z';

let n = 0;
function mkItem(category, gold, goldB, excerpt, tokens, opts) {
  opts = opts || {};
  n++;
  const id = opts.id || ('52a-' + String(n).padStart(3, '0'));
  return {
    id: id, category: category, in_subset: opts.subset !== false,
    claim: { claim_id: 'CL-' + id, evidence_id: opts.missEv ? 'EV-NOPE-' + id : 'EV-' + id, required_tokens: tokens },
    evidence: { evidence_id: 'EV-' + id, source: 'synthetic://52a/' + id, locator: 'L1', claim: opts.claimText || 'synthetic claim ' + id, grounded: opts.grounded !== false, collected_at: TS, reproduce_cmd: 'node 52a-checker-eval.mjs', reproduce_absent_reason: null, required_tokens: [], excerpt: excerpt },
    gold: gold, gold_b: goldB, note: opts.note || ''
  };
}

const items = [];

// ---- A. presence 成立（全部 required_tokens 逐字命中；gold=supports） ----
const A = [
  ['coverage ratio 0.85 measured on intent docs', ['coverage', '0.85'], '全部命中（两锚 EN）'],
  ['fact_count = 129 collected this run', ['fact_count', '129'], '数值锚命中'],
  ['verdict gate decided at 2026-04-10', ['gate', '2026-04-10'], '日期锚命中'],
  ['骨架章序锁定 ADR-0006 裁定协议在', ['骨架', 'ADR-0006'], 'CJK+编号锚'],
  ['the receipt chain hash is stable across runs', ['receipt', 'stable', 'runs'], '三锚全中'],
  ['append-only fact table enforces immutability', ['append-only', 'immutability'], '概念双锚'],
  ['delta_days = 255 检出事后补写', ['delta_days', '255'], '指标锚 CJK 语境'],
  ['supersede 链命中 ADR-0000 标记', ['supersede', 'ADR-0000'], '链锚'],
  ['mean_ratio 0.60 threshold exceeded', ['mean_ratio', '0.60', 'threshold'], '三锚'],
  ['remote config execution disabled at clone', ['remote', 'disabled'], '位锚'],
  ['浅仓拒绝 shallow clone rejected', ['浅仓', 'rejected'], '中英混锚'],
  ['snapshot_fetched_at=2026-04-10T10:00:00Z recorded', ['snapshot_fetched_at', 'recorded'], '披露锚'],
  ['cache_hit=true preserved snapshot timestamp', ['cache_hit', 'timestamp'], '缓存锚'],
  ['hooksPath noop + protocol.ext.allow=never', ['hooksPath', 'protocol.ext'], '双配置锚'],
  ['kernel emits facts; host agent narrates', ['kernel', 'facts', 'narrates'], '分工锚'],
  ['the fixture repo is synthetic and deterministic', ['fixture', 'synthetic', 'deterministic'], '合成印记锚'],
  ['golden bytes diff clean on rerender', ['golden', 'diff'], 'golden 锚'],
  ['stability preview capabilities macro-b header', ['stability', 'preview', 'capabilities'], '报告头锚'],
  ['read model version 1.1.0 lag 0 seconds', ['1.1.0', 'lag', '0'], '读模锚'],
  ['evidence anchor EV-45 parses to line 7', ['EV-45', 'line', '7'], '引文锚']
];
for (const a of A) { items.push(mkItem('presence-supported', 'supports', 'supports', a[0], a[1], { note: a[2] })); }

// ---- B. presence 不成立（≥1 锚缺席；gold=insufficient） ----
const B = [
  ['coverage ratio measured on intent docs', ['coverage', '0.85'], '数值锚缺席'],
  ['fact_count collected this run', ['fact_count', '129'], '计数锚缺席'],
  ['the receipt chain is stable', ['receipt', 'hash', 'runs'], '两锚缺席'],
  ['骨架章序锁定 裁定协议在', ['骨架', 'ADR-0006'], '编号锚缺席'],
  ['append-only table enforces rules', ['append-only', 'immutability'], '概念锚缺席'],
  ['delta_days 检出补写', ['delta_days', '255'], '数值缺席'],
  ['supersede chain hit', ['supersede', 'ADR-0000'], '编号缺席'],
  ['mean_ratio threshold exceeded', ['mean_ratio', '0.60'], '阈值缺席'],
  ['remote config execution', ['remote', 'disabled'], '位锚缺席'],
  ['浅仓拒绝处理', ['浅仓', 'rejected'], 'EN 锚缺席'],
  ['snapshot recorded', ['snapshot_fetched_at', 'recorded'], '长锚缺席'],
  ['cache preserved timestamp', ['cache_hit', 'timestamp'], '命中锚缺席'],
  ['hooksPath noop', ['hooksPath', 'protocol.ext'], '协议锚缺席'],
  ['kernel emits facts', ['kernel', 'facts', 'narrates'], '尾锚缺席'],
  ['fixture repo is deterministic', ['fixture', 'synthetic'], '合成锚缺席'],
  ['golden rerender clean', ['golden', 'diff'], 'diff 锚缺席'],
  ['stability preview header', ['stability', 'capabilities'], 'capabilities 锚缺席'],
  ['read model lag 0', ['1.1.0', 'lag'], '版本锚缺席'],
  ['evidence anchor parses line', ['EV-45', 'line'], 'id 锚缺席'],
  ['totally unrelated sentence', ['receipt', 'chain'], '全锚缺席（无关引文）']
];
for (const b of B) { items.push(mkItem('presence-missing', 'insufficient', 'insufficient', b[0], b[1], { note: b[2] })); }

// ---- C. grounded=false / excerpt 空（引文未落地；gold=insufficient） ----
for (let i = 0; i < 5; i++) {
  items.push(mkItem('ungrounded', 'insufficient', 'insufficient', 'coverage 0.85 ' + i, ['coverage'], { grounded: false, note: 'grounded=false 锚在也被拒（有引文≠支撑）' }));
}
for (let i = 0; i < 5; i++) {
  items.push(mkItem('empty-excerpt', 'insufficient', 'insufficient', '', ['coverage'], { note: 'excerpt 空拒' }));
}

// ---- D. 证据锚不可解析（claim 指不存在 evidence_id；gold=insufficient） ----
for (let i = 0; i < 6; i++) {
  items.push(mkItem('unresolvable-anchor', 'insufficient', 'insufficient', 'receipt stable ' + i, ['receipt'], { missEv: true, note: 'evidence_id 不存在 → 锚不可解析拒' }));
}

// ---- E. 语义对抗 FN：锚缺席但改写/同义语义在场（gold=supports，presence-checker 必缺） ----
const E = [
  ['定位覆盖比值为 0.85，实测全绿', ['s1_keyword_coverage_ratio'], '改写锚（字段名 vs 中文释义）'],
  ['the lag between commit and ADR date is large', ['git.adr_lag_days'], '同义改写（lag 语义在场）'],
  ['five required ADR sections all present', ['adr.five_piece_completeness'], '改写（件名未字面出现）'],
  ['远端新提交对当前快照不可见', ['cache_hit'], '中文释义在（cache_hit 字面缺席）'],
  ['the receipt identifier looks like RCP- followed by hex', ['receipt_id'], '形式描述在，字段名字面缺席'],
  ['提交时间点以 ISO 8601 规范落盘', ['%cI'], '规范描述在，格式字面缺席'],
  ['clones never execute remote hooks', ['protocol.ext.allow'], '语义在场（hooks 禁），字面锚缺席'],
  ['判定结果落在三档之一：支持/不支持/证据不足', ['supported'], '枚举释义在'],
  ['the report header marks this run as preview stage', ['stability'], '概念锚缺席，语义在场'],
  ['每个事实都带追踪与回溯键', ['trace_id', 'baggage_id'], '双字段释义在'],
  ['supersedes the earlier decision record', ['adr.supersede_link_present'], '语义在，字段锚缺席'],
  ['流水线健康闸全部通过', ['pc1', 'pc2'], '正对照释义在，字面锚缺席']
];
for (const e of E) { items.push(mkItem('adversarial-fn-paraphrase', 'supports', 'supports', e[0], e[1], { note: e[2] })); }

// ---- F. 语义对抗 FP：锚字面命中但语境否定/引语包裹（gold=insufficient，presence-checker 必误判） ----
const F = [
  ['the repo does NOT support multi-language output', ['support', 'multi-language'], '否定包裹（NOT ... 命中锚）'],
  ['覆盖率未达 0.85 门槛', ['0.85', '门槛'], '否定语境（未达含锚）'],
  ['the report claims "append-only" but this is unverified text', ['append-only'], '引语包裹（他人主张非事实）'],
  ['determinism is absent: runs differ', ['determinism'], '否定语义（absent 锚同根）'],
  ['不支持浅仓——克隆深度必须全量', ['支持浅仓'], 'CJK 否定包裹（不支持含支持子串）'],
  ['the spec mentions verdict: pending as a hypothetical', ['verdict:'], '假设语境引语'],
  ['lacking five-piece completeness entirely', ['five', 'completeness'], '否定（lacking 含锚）'],
  ['unsupported: the evidence contradicts the claim', ['unsupported'], '陈述词为否定标签本身'],
  ['the doc says hooks execute but our config disables them', ['hooks', 'disables'], '对照句（他人说执行，我们禁）'],
  ['不记录 snapshot 时点——存在披露缺口', ['snapshot', '时点'], '否定包裹（不记录含记录面锚）'],
  ['cache-hit never occurs in this path', ['cache'], 'never 否定包裹'],
  ['the old pipeline emitted verdict_gate but the new one does not', ['verdict_gate', 'new'], '时间对照否定（新管线不含）']
];
for (const f of F) { items.push(mkItem('adversarial-fp-negation', 'insufficient', 'insufficient', f[0], f[1], { note: f[2] })); }

// ---- G. 边界样本（大小写/边界位/CJK 混排/部分命中/长锚） ----
const G = [
  ['COVERAGE Ratio 0.85 MEASURED', ['coverage', 'measured'], '全大写命中（checker 小写化）', 'supports', 'supports'],
  ['Coverage at start-of-string position', ['Coverage'], '边界位锚', 'supports', 'supports'],
  ['token at end is determinism', ['determinism'], '句尾锚', 'supports', 'supports'],
  ['the receipt_id field is RCP-abc123', ['receipt_id', 'RCP-abc123'], '组合锚命中', 'supports', 'supports'],
  ['partial hit: has coverage but no count', ['coverage', 'count'], '部分命中→insufficient', 'insufficient', 'insufficient'],
  ['CJK 锚「裁定协议」在句中', ['裁定协议'], 'CJK 引号包裹锚命中', 'supports', 'supports'],
  ['mixed 中英 coverage 覆盖 both present', ['coverage', '覆盖'], '双语锚双命中', 'supports', 'supports'],
  ['required_tokens empty list item', [], '空锚集：全锚（无）命中→supports', 'supports', 'supports'],
  ['very long token supercalifragilisticexpialidocious-token-xyz present', ['supercalifragilisticexpialidocious-token-xyz'], '超长锚命中', 'supports', 'supports'],
  ['token appears twice: anchor and anchor again', ['anchor'], '重复锚', 'supports', 'supports'],
  ['punct-attached token (receipt,) mid-sentence', ['receipt'], '标点附着锚命中', 'supports', 'supports'],
  ['tab\tand newline-free excerpt', ['tab', 'newline-free'], '转义面锚', 'supports', 'supports']
];
for (const g of G) { items.push(mkItem('boundary', g[3], g[4], g[0], g[1], { note: g[2] })); }

// ---- band-leak 注入面（narrative 段文本机检；gold_leak=是否应检出） ----
const bandItems = [
  { id: 'B-01', pattern: 'dimension-band-assignment', text: 'S1: supported 该维度达标', gold: true, note: '维度 band 赋值句' },
  { id: 'B-02', pattern: 'verdict-field-en', text: 'the verdict field shows supported', gold: true, note: 'verdict 裸词（从严本意）' },
  { id: 'B-03', pattern: 'band-field-en', text: 'band = insufficient per gate', gold: true, note: 'band 赋值' },
  { id: 'B-04', pattern: 'verdict-word-assertion', text: 'result: supported: yes it passed', gold: true, note: '判定词+冒号' },
  { id: 'B-05', pattern: 'cjk-verdict-assertion', text: '本段裁定为可信', gold: true, note: '中文裁定句式' },
  { id: 'B-06', pattern: 'quadrant-band-assertion', text: '象限裁定：绿', gold: true, note: '象限裁定句' },
  { id: 'B-07', pattern: null, text: 'the evidence cites receipt RCP-abc at line 3', gold: false, note: '干净对照（无红线词）' },
  { id: 'B-08', pattern: null, text: '该段仅引证据锚不涉判定', gold: false, note: 'CJK 干净对照' },
  { id: 'B-09', pattern: 'verdict-field-en', text: 'VERDICT overall says supported', gold: true, note: '大写 verdict 命中（i flag）' },
  { id: 'B-10', pattern: null, text: 'verdictless narrative without judgment words', gold: false, note: '干净对照——verdictless 词根但 \bverdict\b 边界不命中？复核：verdictless 含 verdict 前缀→应命中', gold_b: true, note2: '二轮复核修正：\bverdict\b 前缀命中 verdictless——gold_b=true（intra-rater 分歧如实留）' },
  { id: 'B-11', pattern: 'verdict-word-assertion', text: 'insufficient：证据缺口三处', gold: true, note: 'CJK 冒号判定词' },
  { id: 'B-12', pattern: null, text: 'supported systems theory is a field of study', gold: false, gold_b: false, note: 'supported 无冒号——非判定式，干净对照（二轮复核确认：无 verdict 词无判定句式）' },
  { id: 'B-13', pattern: 'cjk-verdict-assertion', text: '判红该仓', gold: true, note: '判红句' },
  { id: 'B-14', pattern: 'band-field-en', text: 'band: supported', gold: true, note: 'band 冒号' },
  { id: 'B-15', pattern: 'dimension-band-assignment', text: 'S3 = red', gold: true, note: '等号赋值' },
  { id: 'B-16', pattern: null, text: 'narrative about anchoring and citations only', gold: false, note: '干净对照' },
  { id: 'B-17', pattern: 'verdict-field-en', text: 'verdict_gate stamped', gold: true, note: 'verdict_gate 裸词（从严）' },
  { id: 'B-18', pattern: null, text: '该段引用 EV-1 证据行', gold: false, note: '干净对照' }
];

const corpus = {
  corpus_id: '52a-checker-eval-v1',
  built: 'construction',
  item_count: items.length,
  band_item_count: bandItems.length,
  disclosure: {
    synthetic: true,
    note: '合成 claim-evidence 语料：gold=构造意图标签；双标子集 gold_b=同一标定者二轮独立标注（intra-rater 口径——非双人互标，inter-rater κ 天花板在合成本质上退化为构造确定性）；对抗面（E/F 类）故意按 presence≠support 构造，FP/FN 分型即预期失配面；本集只用于标定测量，checker 阈值改动不得参照本集标签（防调参泄漏纪律 D-061）',
    limitations: ['合成 excerpt 非 wild slice', '双人互标缺席（intra-rater 替代如实披露）', 'gold 为构造意图非判后共识']
  },
  items: items,
  band_items: bandItems
};
const json = JSON.stringify(corpus, null, 2) + '\n';
writeFileSync(join(HERE, '52a-checker-eval-corpus.json'), json, 'utf8');
console.log('corpus items=' + items.length + ' band=' + bandItems.length + ' sha256=' + createHash('sha256').update(json).digest('hex').slice(0, 16));
