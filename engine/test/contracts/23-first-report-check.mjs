// 守卫：23 首报全链与三层闸门（A-026 / A-027 / spec §R3-D5）
// 用法：node engine/test/contracts/23-first-report-check.mjs
// 约定：零三方依赖；骨架读 engine/dist/report/generate.js，判据绑定读 engine/src/collect/collectors.ts（Node 类型剥离）；退出码 0 = PASS。
// 分工（#37）：断言面对象＝仓内冻结产物，本守卫不重渲染——重渲染的逐字节 diff 归 golden-ci，两者不重叠。

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { need, groupProbe, gitObjectNeedOk } from './_lib/env-contract.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'portable';
// D-214① consumption_forms（多形态消费方——R-anchor 组级 need git-object:）：dev-full=完整克隆全断言面；ci-shallow=CI 浅克隆（冻结对象借仓内 bundle 临时仓零写入物化，主仓零写）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '守卫：23 首报全链与三层闸门（A-026 / A-027 / spec §R3-D5）';


const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
// R37/#75批1：generate.ts 采用 NodeNext .js specifier（import '../intake/quarantine.js'）——Node 类型剥离不做 .js→.ts 映射
// → 改导 engine/dist 编译面（同一契约出口 REPORT_SKELETON/skeletonOf 等；dist 陈旧由 check-dist/rebuild-diff 另守）。
const GENERATE_JS = join(REPO, 'engine', 'dist', 'report', 'generate.js');
const G = await import(pathToFileURL(GENERATE_JS).href);

const PRE_REG = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '22-criteria-pre-registration.md');
const C_BASIS = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '22-c-adjudication-basis.md');
const FACTS_JSONL = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '23-facts.jsonl');
// 记录载体 = #40 归档进仓的两份退役决策记录（只读档案）。原载体 .scratch/gov-audit/ 不在仓里、
// 却可能在开发机上残留——CI 与 dev 因此对不上。关键判断判据见下方 P1。
const ARCHIVE_LEDGERS = ['architecture-recovery-ledger.md', 'macro-audit-ledger.md']
  .map(function (f) { return join(REPO, 'docs', 'archive', 'decisions', f); });
const SKELETON_JSON = join(REPO, 'engine', 'test', 'fixtures', 'contracts', '14-skeleton-fields.json');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

const gates = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','23-gates.json'), 'utf8'));
/** 解析冻结 JSONL：跳过纯空白行，并容忍各行首尾空白与前导 BOM。 */
function parseFactsJsonl(text) {
  return text.split(/\r?\n/)
    .filter(function (line) { return line.trim().length > 0; })
    .map(function (line) { return JSON.parse(line.trim()); });
}
const facts23 = parseFactsJsonl(readFileSync(FACTS_JSONL, 'utf8'));
const mdHappy = readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report.md'), 'utf8');
const mdFail = readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report-failure.md'), 'utf8');
const carHappy = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report.json'), 'utf8'));
const carFail = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','23-first-report-failure.json'), 'utf8'));
const skeletonContract = JSON.parse(readFileSync(SKELETON_JSON, 'utf8'));
const preRegText = readFileSync(PRE_REG, 'utf8');
const cBasisText = readFileSync(C_BASIS, 'utf8');
const ledgerText = ARCHIVE_LEDGERS.filter(function (p) { return existsSync(p); })
  .map(function (p) { return readFileSync(p, 'utf8'); }).join('\n');

// ---------- 开跑前三查（启动器 delta 第 1 条：任一缺 = 停票） ----------
const ciIds = gates.preflight.t19_ci_run_ids;
const report19 = existsSync(join(REPO,'engine','test','fixtures','contracts','19-report.md')) ? readFileSync(join(REPO,'engine','test','fixtures','contracts','19-report.md'), 'utf8') : '';
// 判定只做一次，断言与 detail 共用同一判定——归档记录必须真起关键作用（≥1 个 run 见于记录）。
// 只判文件在不在是不够的：记录被截断或清空时，19-report.md 单腿仍能把 P1 顶绿＝原死载体悄悄回落的复现。
const ciLand = (Array.isArray(ciIds) ? ciIds : []).map(function (r) {
  return { run: r, ledger: ledgerText.indexOf(r) >= 0, report: report19.indexOf(r) >= 0 };
});
function ciStamp(l) {
  if (l.ledger) { return l.run + '@archive-ledger'; }
  if (l.report) { return l.run + '@19-report'; }
  return l.run + '@MISSING';
}
const ledgerBearing = ciLand.some(function (l) { return l.ledger; });
const ciArchived = ciLand.length > 0 && ledgerBearing
  && ciLand.every(function (l) { return l.ledger || l.report; });
check('P1', ciArchived, '票 19 CI 证据在档（双载体＝docs/archive/decisions 归档记录＋19-report.md）：'
  + ciLand.map(ciStamp).join(' ') + (ledgerBearing ? '' : '｜归档记录零命中＝载体又死了'));
// P2 diff-filter=AM：只认内容建立提交，排除退役删除提交（治理庭后语义保持）
let preregCommit = '';
try {
  preregCommit = execFileSync('git', ['log', '--diff-filter=AM', '--format=%H', '-1', '--', '.scratch/architecture-recovery/reports/22-criteria-pre-registration.md'], { cwd: REPO, encoding: 'utf8' }).trim();
} catch (e) { preregCommit = ''; }
// R37 返工 F1（D-094(b) 短 SHA 字面钉脆性）：%h auto-abbrev 随对象库 7→8 跳变——钉钉=commit 存在性（%H 前缀等值）非显示宽度
check('P2', preregCommit.length > 0 && preregCommit.startsWith(gates.preflight.t22_prereg_commit), '票 22 预声明已 commit：' + preregCommit + '（预期 ' + gates.preflight.t22_prereg_commit + '）');
// 认段落形制（表首列的行标签 `| Bn |`），不认标签的任意子串——正文顺带提到 B3 不算该段存在
const cBasisMissing = ['B1', 'B2', 'B3', 'B4', 'B5'].filter(function (s) {
  return !new RegExp('^\\|\\s*' + s + '\\s*\\|', 'm').test(cBasisText);
});
check('P3', existsSync(C_BASIS) && cBasisMissing.length === 0, 'C 层裁定依据预入库文件可指认：22-c-adjudication-basis.md 五段齐备（要求 B1-B5）' + (cBasisMissing.length ? '，缺 ' + cBasisMissing.join(', ') : ''));

// ---------- A 闸：形式达标（骨架 + 引文 + Receipt） ----------
const skHappy = G.skeletonOf(mdHappy);
const skFail = G.skeletonOf(mdFail);
const expectedSk = G.REPORT_SKELETON.map(function (c) { return c.id + ' ' + c.name; });
check('A1', skHappy.length === 4 && skHappy.join('|') === expectedSk.join('|'), 'happy 章顺序锁定：' + skHappy.join(' -> '));
check('A2', skFail.length === 4 && skFail.join('|') === expectedSk.join('|'), 'failure 与 happy 同骨架：' + skFail.join(' -> '));

function chapterBody(md, id) {
  const lines = md.split(String.fromCharCode(10));
  let started = false;
  const out = [];
  for (const line of lines) {
    if (line.indexOf('## C') === 0) {
      started = line.indexOf('## ' + id) === 0;
      continue;
    }
    if (started && line.trim().length > 0 && line.indexOf('# ') !== 0) { out.push(line); }
  }
  return out;
}
for (const ch of G.REPORT_SKELETON) {
  check('A3-' + ch.id, chapterBody(mdHappy, ch.id).length > 0 && chapterBody(mdFail, ch.id).length > 0, '章 ' + ch.id + ' 在 happy 与 failure 两产物中均非空');
}

check('A4', mdHappy.indexOf('RECEIPT ' + carHappy.receipt.receipt_id) >= 0 && carHappy.receipt.chain_hash.length === 64, 'Receipt 印记存在：' + carHappy.receipt.receipt_id + ' / chain 64 hex');
check('A5', carHappy.evidence.length > 0 && carHappy.evidence.every(function (e) { return e.evidence_id && e.source && e.locator; }), '每条证据含可解析引文锚（evidence_id + source + locator）：' + carHappy.evidence.length + ' 条');

// 旧 ADR 正文已随 tracker #171 删除，但冻结首报里的引文仍要逐字可查。按 docs/authority.md §3
// 记的同一套回查办法，从删除提交的父提交取回最后一份正文；不把「路径已删」当成引文失配。
function readCitationSource(src) {
  const local = join(REPO, src.replace(/^\.scratch\/architecture-recovery\/reports\//, 'engine/test/fixtures/contracts/'));
  if (existsSync(local)) { return readFileSync(local, 'utf8'); }
  if (src.indexOf('docs/adr/') !== 0) { return null; }
  try {
    const deletedAt = execFileSync('git', ['log', '--diff-filter=D', '--format=%H', '-1', '--', src], { cwd: REPO, encoding: 'utf8' }).trim();
    if (deletedAt.length === 0) { return null; }
    return execFileSync('git', ['show', deletedAt + '^:' + src], { cwd: REPO, encoding: 'utf8' });
  } catch (e) { return null; }
}

const badAnchor = carHappy.evidence.filter(function (e) {
  const text = readCitationSource(e.source);
  if (text === null) { return true; }
  const lines = text.split(String.fromCharCode(10));
  const ln = Number(e.locator.slice(1));
  if (!(ln >= 1 && ln <= lines.length)) { return true; }
  return lines[ln - 1].trim() !== e.excerpt.trim();
});
check('A6', badAnchor.length === 0, '引文逐字回查：' + carHappy.evidence.length + ' 条全部在 source@locator 行命中（' + badAnchor.length + ' 条失配）');

const supHappy = carHappy.citation_checks.filter(function (c) { return c.support === 'supports'; });
check('A7', supHappy.length === carHappy.citation_checks.length && carHappy.citation_checks.length > 0, '引文→结论支持关系校验：' + supHappy.length + '/' + carHappy.citation_checks.length + ' supports');

const COLLECT_TS = join(REPO, 'engine', 'src', 'collect', 'collectors.ts');
const C = await import(pathToFileURL(COLLECT_TS).href);

// 骨架字段必含清单与 A-014 契约对齐（跨票扩展他人契约：只比对不改写）
for (const ch of G.REPORT_SKELETON) {
  const contract = skeletonContract.skeleton.chapters.find(function (c) { return c.id === ch.id; });
  if (!contract) {
    check('A8-' + ch.id, false, '契约缺章 ' + ch.id);
    continue;
  }
  const want = contract.fields.map(function (f) { return f.name; }).sort().join(',');
  const got = ch.required_fields.slice().sort().join(',');
  check('A8-' + ch.id, want === got, '章 ' + ch.id + ' 必含字段清单与 14-skeleton-fields.json 逐项对齐（' + ch.required_fields.length + ' 项）');
}

// ---------- B 闸：内容非平凡（正对照 2/2 先行，再读真判据） ----------
check('B1', gates.B.pc1.pass === true && gates.B.pc2.pass === true, '正对照 2/2 命中（PC-1 ' + gates.B.pc1.adr_fact_count + '/' + gates.B.pc1.pos_fact_count + ' 事实，PC-2 delta_days=' + gates.B.pc2.delta_days + '）');
const ids = carHappy.adjudication.entries.map(function (e) { return e.criterion_id; });
const firstTc = ids.findIndex(function (x) { return x.indexOf('TC-') === 0; });
const pc1Idx = ids.indexOf('PC-1');
const pc2Idx = ids.indexOf('PC-2');
// 两枚正对照都必须真在条目里且先于首个真判据——取 max 会让缺席的那枚（indexOf=-1）被另一枚掩护掉
const lastPc = Math.max(pc1Idx, pc2Idx);
check('B2', pc1Idx >= 0 && pc2Idx >= 0 && firstTc >= 0 && lastPc < firstTc, '执行顺序不可倒（两枚 PC 均须索引 >=0 且 < firstTC）：PC-1 索引 ' + pc1Idx + '、PC-2 索引 ' + pc2Idx + '、firstTC 索引 ' + firstTc);
// ---------- B3 四层（tracker #76 / tracker #130）：字面 ↔ 统计重算 ↔ 裁决重导 ↔ 事实重算 ----------
// 规则的成文权威 = 22-criteria-pre-registration.md §3.1（TC-1）/§3.2（TC-2）/§3.3（TC-3），跑前写死；
// 下面三个 derive 只做指针式兑现，不另立第二套正文。阈值取自冻结件 threshold 块，其字面由 B4 逐项钉死（跑后未调）。
// 判定条件＝字面 ∧ 记录自洽 ∧ 事实对账 ∧ 对照表全过 ∧ 六类齐备；事实对账只读 23-facts.jsonl，
// 按 23-first-report.mjs 的聚合式静态重算，不调用采集器、不重渲染。
// 零分母一律按产线同式取 0（collectors.ts 与 23-first-report.mjs 都这么写），守卫另判会把这些合法记录误报成红。
function r4(x) { return Number(x).toFixed(4); }

/** 取指定 metric 的冻结事实，解析 value_json 并保留生成器落记录所用的 subject_ref。 */
function factValues(metric) {
  return facts23.filter(function (f) { return f.metric === metric; }).map(function (f) {
    return { path: f.subject_ref, value: JSON.parse(f.value_json) };
  });
}
const tc1Facts = factValues('git.adr_lag_days');
const tc2Facts = factValues('adr.five_piece_completeness');
const tc3Facts = factValues('positioning.keyword_coverage');

/** 按生成器规则，以 lag 事实条数与 delta_days 严格过阈条数重算 TC-1 原始计数。 */
function deriveTc1Facts(entries, t) {
  return {
    judgeable_n: entries.length,
    backfill_n: entries.filter(function (e) { return e.value.delta_days > t.threshold.lag_days; }).length
  };
}
/** 返回 TC-1 冻结记录与事实重算的逐字段失配，空数组表示全等。 */
function tc1FactDiff(t, entries) {
  const f = deriveTc1Facts(entries, t);
  const diff = [];
  for (const k of ['judgeable_n', 'backfill_n']) {
    if (t[k] !== f[k]) { diff.push(k + ' 记录=' + t[k] + ' 事实=' + f[k]); }
  }
  return diff;
}
/** 供内存对照表使用的 TC-1 事实全等谓词。 */
function matchesTc1Facts(t, entries) { return tc1FactDiff(t, entries).length === 0; }

/**
 * 按生成器的条数、missing 累加、ratio 算术平均重算 TC-2。
 * mean 不能只从 missing_counts 反推，否则只改事实 ratio 而保留 missing 时仍会漏报。
 */
function deriveTc2Facts(entries) {
  const counts = {};
  for (const k of C.ADR_FIVE_PIECE) { counts[k] = 0; }
  let ratioSum = 0;
  for (const e of entries) {
    ratioSum = ratioSum + e.value.ratio;
    for (const k of e.value.missing) { counts[k] = counts[k] + 1; }
  }
  return {
    total: entries.length,
    missing_counts: counts,
    mean_ratio_4: r4(entries.length === 0 ? 0 : ratioSum / entries.length)
  };
}
/** 返回 TC-2 total、缺失字段集与计数、mean 的记录／事实失配。 */
function tc2FactDiff(t, entries) {
  const f = deriveTc2Facts(entries);
  const diff = [];
  if (t.total !== f.total) { diff.push('total 记录=' + t.total + ' 事实=' + f.total); }
  const factKeys = Object.keys(f.missing_counts).sort();
  const recordKeys = Object.keys(t.missing_counts).sort();
  if (recordKeys.join(',') !== factKeys.join(',')) {
    diff.push('missing_counts 字段集 记录=' + recordKeys.join('/') + ' 事实=' + factKeys.join('/'));
  }
  for (const k of factKeys) {
    if (t.missing_counts[k] !== f.missing_counts[k]) {
      diff.push('missing_counts.' + k + ' 记录=' + t.missing_counts[k] + ' 事实=' + f.missing_counts[k]);
    }
  }
  if (t.mean_ratio_4 !== f.mean_ratio_4) { diff.push('mean_ratio_4 记录=' + t.mean_ratio_4 + ' 事实=' + f.mean_ratio_4); }
  return diff;
}
/** 供内存对照表使用的 TC-2 事实全等谓词。 */
function matchesTc2Facts(t, entries) { return tc2FactDiff(t, entries).length === 0; }

/** 逐项比较两个字符串数组，兼拒非数组与等长异值。 */
function sameStrings(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length
    && a.every(function (x, i) { return x === b[i]; });
}
/** TC-3 原始 ratio 只接受有限 number，拒绝 null、字符串及 NaN／Infinity 的强制转换。 */
function validTc3Ratio(value) { return typeof value === 'number' && Number.isFinite(value); }
/** 按生成器落值重算 TC-3 逐源字段，并以合法的原始 ratio 取首个最低源。 */
function deriveTc3Facts(entries) {
  const per = entries.map(function (e) {
    const ratioValid = validTc3Ratio(e.value.ratio);
    return {
      path: e.path, hit: e.value.hit, keywords: e.value.keywords,
      ratio_4: ratioValid ? r4(e.value.ratio) : null, ratio_valid: ratioValid, missed: e.value.missed
    };
  });
  let lowest = null;
  for (const e of entries) {
    if (!validTc3Ratio(e.value.ratio)) { continue; }
    if (lowest === null || e.value.ratio < lowest.value.ratio) { lowest = e; }
  }
  return {
    per_source: per,
    lowest_path: lowest === null ? null : lowest.path,
    lowest_ratio_4: r4(lowest === null ? 0 : lowest.value.ratio)
  };
}
/** 返回 TC-3 源条数、逐源落值及最低源的记录／事实失配。 */
function tc3FactDiff(t, entries) {
  const f = deriveTc3Facts(entries);
  const diff = [];
  if (t.per_source.length !== f.per_source.length) {
    diff.push('per_source.length 记录=' + t.per_source.length + ' 事实=' + f.per_source.length);
  }
  const shared = Math.min(t.per_source.length, f.per_source.length);
  for (let i = 0; i < shared; i++) {
    const s = t.per_source[i];
    const p = f.per_source[i];
    for (const k of ['path', 'hit', 'keywords']) {
      if (s[k] !== p[k]) { diff.push('per_source[' + i + '].' + k + ' 记录=' + s[k] + ' 事实=' + p[k]); }
    }
    if (!p.ratio_valid) {
      diff.push('per_source[' + i + '].ratio 非有限数字 事实=' + String(entries[i].value.ratio));
    } else if (s.ratio_4 !== p.ratio_4) {
      diff.push('per_source[' + i + '].ratio_4 记录=' + s.ratio_4 + ' 事实=' + p.ratio_4);
    }
    if (!sameStrings(s.missed, p.missed)) {
      diff.push('per_source[' + i + '].missed 记录=' + JSON.stringify(s.missed) + ' 事实=' + JSON.stringify(p.missed));
    }
  }
  for (const k of ['lowest_path', 'lowest_ratio_4']) {
    if (t[k] !== f[k]) { diff.push(k + ' 记录=' + t[k] + ' 事实=' + f[k]); }
  }
  return diff;
}
/** 供内存对照表使用的 TC-3 事实全等谓词。 */
function matchesTc3Facts(t, entries) { return tc3FactDiff(t, entries).length === 0; }

// §3.1 的两条：可执行门槛（否则判 INCONCLUSIVE）＋判失败方向（严格大于）；ratio 是 0–1 的占比
function deriveTc1(t) {
  const ratio = t.judgeable_n === 0 ? 0 : t.backfill_n / t.judgeable_n;
  return {
    ratio: ratio,
    ratio_4: r4(ratio),
    verdict: t.judgeable_n < t.threshold.min_n ? 'INCONCLUSIVE' : (ratio > t.threshold.ratio_red ? 'RED' : 'NOT_RED')
  };
}
function consistentTc1(t) {
  const d = deriveTc1(t);
  return d.ratio >= 0 && d.ratio <= 1 && d.ratio_4 === t.ratio_4 && d.verdict === t.verdict;
}

// §3.2 的两条独立判失败臂（任一命中即 RED）。mean 与逐字段缺失率同源于缺失计数，靠采集器
// ratio = 现件数/5 闭合（Σ ratio = 5·total − Σ 缺失），所以两条臂都能从原始计数独立重算。
function deriveTc2(t) {
  const fields = C.ADR_FIVE_PIECE.slice().sort();
  const keys = Object.keys(t.missing_counts).sort();
  const ratio = {};
  let sumMissing = 0;
  for (const k of keys) {
    ratio[k] = t.total === 0 ? 0 : t.missing_counts[k] / t.total;
    sumMissing = sumMissing + t.missing_counts[k];
  }
  const mean = t.total === 0 ? 0 : (fields.length * t.total - sumMissing) / (fields.length * t.total);
  const cond_a = mean < t.threshold.mean_red;
  const cond_b = keys.some(function (k) { return ratio[k] > t.threshold.field_missing_red; });
  return {
    keys: keys,
    fieldSetOk: keys.join(',') === fields.join(','),
    ratio: ratio,
    mean: mean,
    mean_4: r4(mean),
    cond_a: cond_a,
    cond_b: cond_b,
    verdict: (cond_a || cond_b) ? 'RED' : 'NOT_RED'
  };
}
function inUnitInterval(xs) {
  return xs.every(function (x) { return x >= 0 && x <= 1; });
}
function consistentTc2(t) {
  const d = deriveTc2(t);
  const ratioKeys = Object.keys(t.missing_ratio_4).sort();
  return d.fieldSetOk
    && inUnitInterval([d.mean].concat(ratioKeys.map(function (k) { return d.ratio[k]; })))
    && ratioKeys.join(',') === d.keys.join(',')
    && ratioKeys.every(function (k) { return Number(t.missing_ratio_4[k]).toFixed(4) === r4(d.ratio[k]); })
    && d.mean_4 === t.mean_ratio_4
    && d.cond_a === t.cond_a && d.cond_b === t.cond_b
    && d.verdict === t.verdict;
}

// §3.3 的三条：每源 ratio = hit/keywords、取最低一条、按 red/green 分档。
// 并列最低时「最低一条」不唯一（§3.3 只要求取最低，没写取哪一枚），故路径只断言落在 argmin 集内。
function tc3Band(t, r) { return r < t.threshold.red ? 'RED' : (r < t.threshold.green ? 'AMBER' : 'GREEN'); }
function deriveTc3(t) {
  const per = t.per_source.map(function (s) {
    return { path: s.path, ratio: s.keywords === 0 ? 0 : s.hit / s.keywords };
  });
  let lowest = null;
  for (const p of per) { if (lowest === null || p.ratio < lowest.ratio) { lowest = p; } }
  // 无源时与产线同式取 ratio 0（23-first-report.mjs 的 `tc3Lowest ? … : 0`），守卫不自造第四档；
  // 也不抛——未捕获异常会把整条 contracts-run 拉成栈回溯，属 tracker #72 立过的同一失败模式
  const lowestRatio = lowest === null ? 0 : lowest.ratio;
  return {
    per: per,
    lowest_ratio_4: r4(lowestRatio),
    lowest_paths: lowest === null ? [] : per.filter(function (p) { return p.ratio === lowestRatio; }).map(function (p) { return p.path; }),
    verdict: tc3Band(t, lowestRatio)
  };
}
function consistentTc3(t) {
  const d = deriveTc3(t);
  return inUnitInterval(d.per.map(function (p) { return p.ratio; }))
    // §3.3 的采集规则：每源 hit＋missed 恰为 top_n 个关键词，一个都不许两写或漏计
    && t.per_source.every(function (s) {
      return s.hit + s.missed.length === s.keywords && s.keywords <= t.threshold.top_n;
    })
    && d.per.every(function (p, i) { return p.path === t.per_source[i].path && r4(p.ratio) === t.per_source[i].ratio_4; })
    && d.lowest_ratio_4 === t.lowest_ratio_4
    && d.lowest_paths.indexOf(t.lowest_path) >= 0
    && d.verdict === t.verdict;
}

function badCases(cases) {
  return cases.filter(function (c) { return !c[1]; }).map(function (c) { return c[0]; });
}

const tc1 = gates.B.tc1;
const tc2 = gates.B.tc2;
const tc3 = gates.B.tc3;
const minN = tc1.threshold.min_n;
const t2keys = Object.keys(tc2.missing_counts);
function tc2Counts(each) {
  const c = {};
  for (const k of t2keys) { c[k] = each; }
  return c;
}
function tc2CountsOnlyFirst(n) {
  const c = tc2Counts(0);
  c[t2keys[0]] = n;
  return c;
}
// 三个 record() 把一条样本的各派生量按同一规则算齐（统计量与裁决互相自洽），
// 用于正对照（自洽样本必须放行，否则重导是恒否的空臂）与谎报对照（只改一处，必须判否）。
function tc1Record(judgeable, backfill) {
  const d = deriveTc1(Object.assign({}, tc1, { judgeable_n: judgeable, backfill_n: backfill }));
  return Object.assign({}, tc1, { judgeable_n: judgeable, backfill_n: backfill, ratio_4: d.ratio_4, verdict: d.verdict });
}
function tc2Record(total, counts) {
  const d = deriveTc2(Object.assign({}, tc2, { total: total, missing_counts: counts }));
  const ratios = {};
  for (const k of t2keys) { ratios[k] = Number(d.ratio[k].toFixed(4)); }
  return Object.assign({}, tc2, {
    total: total, missing_counts: counts, missing_ratio_4: ratios,
    mean_ratio_4: d.mean_4, cond_a: d.cond_a, cond_b: d.cond_b, verdict: d.verdict
  });
}
function tc3Record(per) {
  const d = deriveTc3(Object.assign({}, tc3, { per_source: per }));
  return Object.assign({}, tc3, {
    per_source: per, lowest_ratio_4: d.lowest_ratio_4, lowest_path: d.lowest_paths[0], verdict: d.verdict
  });
}
// 合成意图源连 ratio_4 与 missed 清单一起按同规则组齐，否则逐源谎报臂会把正对照一并判否（＝自证空臂）
function tc3Source(path, hit, keywords) {
  const missed = [];
  for (let i = 0; i < keywords - hit; i++) { missed.push('m' + i); }
  return { path: path, hit: hit, keywords: keywords, ratio_4: r4(keywords === 0 ? 0 : hit / keywords), missed: missed };
}
// 谎报对照通用形：样本先按同规则算齐，再只改 field 一处——判否必须只由这一处起关键判断作用，
// witness 当场复核其余量仍相符（否则「恒否的重导」也能把对照臂伪装成非永远通过）。
function lieArm(consistent, derive, base, field, value, witness) {
  const lied = Object.assign({}, base);
  lied[field] = value;
  return !consistent(lied) && witness(derive(lied), lied);
}
/** 只改内存事实副本的解析值，供对照表注入；两个冻结 JSON 文件均不写。 */
function editFactValue(entries, index, patch) {
  return entries.map(function (e, i) {
    return i === index ? { path: e.path, value: Object.assign({}, e.value, patch) } : e;
  });
}
// 每行第三槽＝用例类。判定要求六类齐备：整表被清空、或只留一类，是「臂不再参与判定」最后一种能全绿的形制
// （`tXBad.length === 0` 对空表永远通过，光有臂拦不住它）。
const TC_CLASSES = ['正对照', '边界', '谎报', '域', '注入', '同式'];
function classGaps(cases) {
  const gaps = cases.filter(function (c) { return typeof c[2] !== 'string' || c[2].length === 0; })
    .map(function (c) { return c[0] + ' 未标类'; });
  for (const cls of TC_CLASSES) {
    if (!cases.some(function (c) { return c[2] === cls; })) { gaps.push(cls + ' 整类缺失'); }
  }
  return gaps;
}

const d1 = deriveTc1(tc1);
const d2 = deriveTc2(tc2);
const d3 = deriveTc3(tc3);
const f1 = deriveTc1Facts(tc1Facts, tc1);
const f2 = deriveTc2Facts(tc2Facts);
const f3 = deriveTc3Facts(tc3Facts);
const tc1FactDiffs = tc1FactDiff(tc1, tc1Facts);
const tc2FactDiffs = tc2FactDiff(tc2, tc2Facts);
const tc3FactDiffs = tc3FactDiff(tc3, tc3Facts);
const tc1FactOk = tc1FactDiffs.length === 0;
const tc2FactOk = tc2FactDiffs.length === 0;
const tc3FactOk = tc3FactDiffs.length === 0;
const tc1Cases = [
  ['正对照：达门槛的自洽样本放行', consistentTc1(tc1Record(minN, 0)) && consistentTc1(tc1Record(minN, minN)), '正对照'],
  ['门槛下判 INCONCLUSIVE', deriveTc1(Object.assign({}, tc1, { judgeable_n: minN - 1, backfill_n: 0 })).verdict === 'INCONCLUSIVE', '边界'],
  ['达门槛不判 INCONCLUSIVE', deriveTc1(Object.assign({}, tc1, { judgeable_n: minN, backfill_n: 0 })).verdict !== 'INCONCLUSIVE', '边界'],
  ['门槛优先于判失败方向（两臂同时中仍判 INCONCLUSIVE）', (function () {
    const both = Object.assign({}, tc1, { judgeable_n: minN - 1, backfill_n: minN - 1 });
    return deriveTc1(both).verdict === 'INCONCLUSIVE' && deriveTc1(both).ratio_4 === '1.0000';
  })(), '边界'],
  ['ratio 恰等于 ratio_red 不判失败（严格大于）', tc1Record(minN, 1).ratio_4 === '0.2000' && tc1Record(minN, 1).verdict === 'NOT_RED', '边界'],
  ['达门槛且超 ratio_red 判 RED', tc1Record(minN, minN).verdict === 'RED', '边界'],
  ['可判定数 0 取 0.0000 判 INCONCLUSIVE（与产线同式，不产 NaN）', consistentTc1(tc1Record(0, 0)) && tc1Record(0, 0).ratio_4 === '0.0000', '同式'],
  ['ratio 谎报必否（裁决与门槛仍自洽，只由统计重算起关键判断作用）', lieArm(consistentTc1, deriveTc1, tc1Record(minN, 1), 'ratio_4', '0.9000',
    function (d, l) { return d.verdict === l.verdict; }), '谎报'],
  ['裁决谎报 INCONCLUSIVE 必否（统计量全自洽，只由裁决重导关键判断）', lieArm(consistentTc1, deriveTc1, tc1Record(minN, 0), 'verdict', 'INCONCLUSIVE',
    function (d, l) { return d.ratio_4 === l.ratio_4; }), '谎报'],
  ['占比越出 0–1 必否（补写数超过可判定数）', !consistentTc1(tc1Record(tc1.judgeable_n, tc1.judgeable_n + 1)), '域'],
  ['tracker #76 注入 judgeable_n=999 必否', !consistentTc1(Object.assign({}, tc1, { judgeable_n: 999 })), '注入'],
  ['事实过阈或删行而计数照抄必否（backfill/judgeable 两臂；更新后的记录可放行）', (function () {
    const changed = editFactValue(tc1Facts, 0, { delta_days: tc1.threshold.lag_days + 1 });
    const raw = deriveTc1Facts(changed, tc1);
    const updated = tc1Record(raw.judgeable_n, raw.backfill_n);
    const removed = tc1Facts.slice(1);
    const removedRaw = deriveTc1Facts(removed, tc1);
    // 恰等 90 天不算补写：既钉严格大于，也证明事实变了但记录无需变时事实臂不是恒否。
    const boundary = editFactValue(tc1Facts, 0, { delta_days: tc1.threshold.lag_days });
    const boundaryRaw = deriveTc1Facts(boundary, tc1);
    return consistentTc1(tc1) && raw.backfill_n === tc1.backfill_n + 1
      && !matchesTc1Facts(tc1, changed)
      && consistentTc1(updated) && matchesTc1Facts(updated, changed)
      && removedRaw.judgeable_n === tc1.judgeable_n - 1 && removedRaw.backfill_n === tc1.backfill_n
      && !matchesTc1Facts(tc1, removed)
      && boundaryRaw.judgeable_n === tc1.judgeable_n && boundaryRaw.backfill_n === tc1.backfill_n
      && matchesTc1Facts(tc1, boundary);
  })(), '注入'],
  ['JSONL 纯空白行跳过且 BOM／首尾空白可解析', (function () {
    const row = { fact_id: 'parse-whitespace', metric: 'git.adr_lag_days', subject_ref: 'parse-subject', value_json: '{"delta_days":-1}' };
    try {
      const parsed = parseFactsJsonl(' \t \n \ufeff ' + JSON.stringify(row) + ' \t\n');
      return parsed.length === 1 && parsed[0].fact_id === row.fact_id
        && parsed[0].subject_ref === row.subject_ref
        && JSON.parse(parsed[0].value_json).delta_days === -1;
    } catch (e) { return false; }
  })(), '注入']
];
const tc2Cases = [
  ['正对照：两臂皆未中的自洽样本放行', consistentTc2(tc2Record(10, tc2Counts(0))) && deriveTc2(tc2Record(10, tc2Counts(0))).verdict === 'NOT_RED', '正对照'],
  ['仅 (a) 命中判 RED', (function () { const d = deriveTc2(Object.assign({}, tc2, { total: 10, missing_counts: tc2Counts(5) })); return d.verdict === 'RED' && d.cond_a && !d.cond_b; })(), '边界'],
  ['mean 恰等于 mean_red 不判 (a)（严格小于）', (function () { const d = deriveTc2(Object.assign({}, tc2, { total: 10, missing_counts: tc2Counts(4) })); return d.mean_4 === '0.6000' && !d.cond_a && d.verdict === 'NOT_RED'; })(), '边界'],
  ['仅 (b) 命中判 RED', (function () { const d = deriveTc2(Object.assign({}, tc2, { total: 10, missing_counts: tc2CountsOnlyFirst(6) })); return d.verdict === 'RED' && !d.cond_a && d.cond_b; })(), '边界'],
  ['缺失率恰等于 field_missing_red 不判 (b)（严格大于）', (function () { const d = deriveTc2(Object.assign({}, tc2, { total: 10, missing_counts: tc2CountsOnlyFirst(5) })); return r4(d.ratio[t2keys[0]]) === '0.5000' && !d.cond_b && d.verdict === 'NOT_RED'; })(), '边界'],
  ['total 0 取 0.0000 判 RED（与产线同式，不产 NaN）', consistentTc2(tc2Record(0, tc2Counts(0))) && tc2Record(0, tc2Counts(0)).mean_ratio_4 === '0.0000', '同式'],
  ['逐字段缺失率谎报必否', (function () {
    const lied = Object.assign({}, tc2, { missing_ratio_4: (function () { const m = {}; for (const k of t2keys) { m[k] = 0; } return m; })() });
    return !consistentTc2(lied) && Number(tc2.missing_ratio_4[t2keys[0]]).toFixed(4) === r4(d2.ratio[t2keys[0]]);
  })(), '谎报'],
  ['字段集缺一枚必否', (function () {
    const m = Object.assign({}, tc2.missing_ratio_4);
    delete m[t2keys[0]];
    return !consistentTc2(Object.assign({}, tc2, { missing_ratio_4: m }));
  })(), '谎报'],
  ['字段名集越出五件套必否（计数与比率仍逐项对齐）', (function () {
    const base = tc2Record(tc2.total, tc2.missing_counts);
    const ren = function (obj) {
      const m = {};
      for (const k of Object.keys(obj)) { m[k === t2keys[0] ? 'StatusX' : k] = obj[k]; }
      return m;
    };
    const lied = Object.assign({}, base, { missing_counts: ren(base.missing_counts), missing_ratio_4: ren(base.missing_ratio_4) });
    return !consistentTc2(lied) && deriveTc2(lied).mean_4 === lied.mean_ratio_4 && deriveTc2(lied).verdict === lied.verdict;
  })(), '谎报'],
  ['cond_a 谎报必否（mean 与裁决仍自洽）', lieArm(consistentTc2, deriveTc2, tc2Record(10, tc2Counts(4)), 'cond_a', true,
    function (d, l) { return d.mean_4 === l.mean_ratio_4 && d.verdict === l.verdict; }), '谎报'],
  ['cond_b 谎报必否（缺失率与裁决仍自洽）', lieArm(consistentTc2, deriveTc2, tc2Record(10, tc2CountsOnlyFirst(6)), 'cond_b', false,
    function (d, l) { return d.mean_4 === l.mean_ratio_4 && d.verdict === l.verdict; }), '谎报'],
  ['缺失计数越出 0–total 必否（其余各量按同规则算齐）', !consistentTc2(tc2Record(tc2.total, (function () { const c = Object.assign({}, tc2.missing_counts); c[t2keys[0]] = tc2.total + 1; return c; })())), '域'],
  ['统计量全自洽而裁决谎报 RED 必否（只由裁决重导关键判断）', lieArm(consistentTc2, deriveTc2, tc2Record(10, tc2Counts(0)), 'verdict', 'RED',
    function (d, l) { return !d.cond_a && !d.cond_b && d.mean_4 === l.mean_ratio_4; }), '谎报'],
  ['tracker #76 注入 mean_ratio_4=0.9 必否', !consistentTc2(Object.assign({}, tc2, { mean_ratio_4: '0.9' })), '注入'],
  ['票面注入只改 mean 字面：记录不自洽，而 RED 仍由 (b) 臂独立撑住', (function () {
    // §3.2 的两条臂各自独立：票面「mean 抬到 0.9 就该不再 RED」把 (a) 当成唯一关键判断臂，
    // 实测缺失计数未动 ⇒ (b) 仍真 ⇒ 该改的是统计量与计数的相符性，不是裁决
    const inj = Object.assign({}, tc2, { mean_ratio_4: '0.9' });
    const d = deriveTc2(inj);
    return d.verdict === 'RED' && d.cond_b && !consistentTc2(inj);
  })(), '注入'],
  ['事实 missing 少一项而 missing_counts 照抄必否（total 与 mean 不变）', (function () {
    const changed = editFactValue(tc2Facts, 0, {
      missing: tc2Facts[0].value.missing.filter(function (k) { return k !== 'Status'; })
    });
    const raw = deriveTc2Facts(changed);
    return consistentTc2(tc2) && raw.total === tc2.total && raw.mean_ratio_4 === tc2.mean_ratio_4
      && raw.missing_counts.Status === tc2.missing_counts.Status - 1
      && !matchesTc2Facts(tc2, changed);
  })(), '注入'],
  ['事实 ratio 或条数漂移而记录照抄必否（mean/total 两臂分开判别）', (function () {
    const index = tc2Facts.findIndex(function (e) { return e.value.ratio > 0; });
    const changed = editFactValue(tc2Facts, index, { ratio: 0 });
    const raw = deriveTc2Facts(changed);
    const mean = tc2Facts.reduce(function (s, e) { return s + e.value.ratio; }, 0) / tc2Facts.length;
    // 补一条 ratio=现均值、missing=空的事实：mean 与缺失计数都不变，只剩 total 一臂可判否。
    const added = tc2Facts.concat([{ path: 'fact-injected-total', value: { ratio: mean, missing: [] } }]);
    const addedRaw = deriveTc2Facts(added);
    return index >= 0 && consistentTc2(tc2) && raw.total === tc2.total && raw.mean_ratio_4 !== tc2.mean_ratio_4
      && C.ADR_FIVE_PIECE.every(function (k) { return raw.missing_counts[k] === tc2.missing_counts[k]; })
      && !matchesTc2Facts(tc2, changed)
      && addedRaw.total === tc2.total + 1 && addedRaw.mean_ratio_4 === tc2.mean_ratio_4
      && C.ADR_FIVE_PIECE.every(function (k) { return addedRaw.missing_counts[k] === tc2.missing_counts[k]; })
      && !matchesTc2Facts(tc2, added);
  })(), '注入']
];
const tc3Cases = [
  ['正对照：抬到绿线以上的自洽样本判 GREEN', (function () {
    const rec = tc3Record(tc3.per_source.map(function (s) { return tc3Source(s.path, s.keywords, s.keywords); }));
    return consistentTc3(rec) && rec.verdict === 'GREEN';
  })(), '正对照'],
  ['三档边界 RED/AMBER/GREEN', tc3Band(tc3, tc3.threshold.red - 0.01) === 'RED'
    && tc3Band(tc3, tc3.threshold.red) === 'AMBER'
    && tc3Band(tc3, tc3.threshold.green - 0.01) === 'AMBER'
    && tc3Band(tc3, tc3.threshold.green) === 'GREEN', '边界'],
  ['取最低不取首条', (function () {
    const src = [tc3Source('low', 4, 10), tc3Source('high', 9, 10)];
    const dLow = deriveTc3(Object.assign({}, tc3, { per_source: src }));
    const dHigh = deriveTc3(Object.assign({}, tc3, { per_source: src.slice().reverse() }));
    return dLow.verdict === 'RED' && dHigh.lowest_ratio_4 === '0.4000' && dHigh.lowest_paths.indexOf('low') >= 0;
  })(), '边界'],
  ['keywords 0 取 0.0000 判 RED（与产线同式，不产 NaN）', (function () {
    const rec = tc3Record([tc3Source('zero', 0, 0)]);
    return consistentTc3(rec) && rec.lowest_ratio_4 === '0.0000' && rec.verdict === 'RED';
  })(), '同式'],
  ['空 per_source 取产线同式的 0.0000/RED 且判否而非抛', (function () {
    const empty = Object.assign({}, tc3, { per_source: [] });
    const d = deriveTc3(empty);
    const faked = Object.assign({}, empty, { lowest_ratio_4: '0.6000', lowest_path: null, verdict: 'AMBER' });
    const honest = Object.assign({}, empty, { lowest_ratio_4: d.lowest_ratio_4, lowest_path: null, verdict: d.verdict });
    // 值面钉产线同式（自造第四档或改取 0.6 即红）；空源本身仍必须判否——argmin 路径集是空集，
    // 而 §3.3 的意图源是冻结的（两枚，B6 同标准），空源记录不属于任何合法现场
    return d.lowest_ratio_4 === '0.0000' && d.verdict === 'RED' && d.lowest_paths.length === 0
      && !consistentTc3(faked) && !consistentTc3(honest);
  })(), '同式'],
  ['逐源 ratio_4 谎报必否（最低值与裁决仍自洽）', (function () {
    const lied = Object.assign({}, tc3, { per_source: tc3.per_source.map(function (s, i) {
      return Object.assign({}, s, { ratio_4: i === 0 ? '0.9900' : s.ratio_4 });
    }) });
    return !consistentTc3(lied) && deriveTc3(lied).lowest_ratio_4 === lied.lowest_ratio_4 && deriveTc3(lied).verdict === lied.verdict;
  })(), '谎报'],
  ['missed 清单与计数不符必否（hit＋missed 须等于 keywords）', (function () {
    const lied = Object.assign({}, tc3, { per_source: tc3.per_source.map(function (s, i) {
      return Object.assign({}, s, { missed: i === 0 ? [] : s.missed });
    }) });
    return !consistentTc3(lied) && deriveTc3(lied).per.every(function (p, i) {
      return r4(p.ratio) === lied.per_source[i].ratio_4;
    });
  })(), '谎报'],
  ['keywords 越过冻结 top_n 必否', !consistentTc3(Object.assign({}, tc3, {
    threshold: Object.assign({}, tc3.threshold, { top_n: tc3.per_source[0].keywords - 1 })
  })), '域'],
  ['lowest_path 落在 argmin 之外必否', lieArm(consistentTc3, deriveTc3, tc3, 'lowest_path', tc3.per_source[0].path,
    function (d, l) { return d.lowest_ratio_4 === l.lowest_ratio_4; }), '谎报'],
  ['裁决谎报 AMBER 必否（统计量四处全自洽，只由分带关键判断）', lieArm(consistentTc3, deriveTc3,
    tc3Record(tc3.per_source.map(function (s) { return tc3Source(s.path, s.keywords, s.keywords); })), 'verdict', 'AMBER',
    function (d, l) { return d.lowest_ratio_4 === l.lowest_ratio_4 && d.lowest_paths.indexOf(l.lowest_path) >= 0; }), '谎报'],
  ['占比越出 0–1 必否（hit>keywords 同时破 hit＋missed=keywords）', (function () {
    const per = tc3.per_source.map(function (s, i) { return tc3Source(s.path, i === 0 ? s.keywords + 1 : s.hit, s.keywords); });
    return !consistentTc3(tc3Record(per));
  })(), '域'],
  ['命中数为负必否（missed 清单仍能闭合，只由占比域臂关键判断）', (function () {
    const per = [tc3Source('neg', -1, tc3.per_source[0].keywords), tc3Source('ok', 12, 20)];
    const rec = tc3Record(per);
    return rec.per_source[0].missed.length === tc3.per_source[0].keywords + 1 && !consistentTc3(rec);
  })(), '域'],
  ['tracker #76 注入 lowest_ratio_4=0.99 必否', !consistentTc3(Object.assign({}, tc3, { lowest_ratio_4: '0.9900' })), '注入'],
  ['事实 hit 或源条数漂移而记录照抄必否（其余字段与最低源不变）', (function () {
    const changed = editFactValue(tc3Facts, 0, { hit: tc3Facts[0].value.hit + 1 });
    const raw = deriveTc3Facts(changed);
    // 重复非最低源：已有位置及最低源全不变，只剩 per_source.length 一臂可判否。
    const addedIndex = tc3Facts.findIndex(function (e) { return e.path !== tc3.lowest_path; });
    if (addedIndex < 0) { return false; }
    const added = tc3Facts.concat([tc3Facts[addedIndex]]);
    const addedRaw = deriveTc3Facts(added);
    return consistentTc3(tc3) && raw.per_source[0].keywords === tc3.per_source[0].keywords
      && raw.per_source[0].ratio_4 === tc3.per_source[0].ratio_4
      && raw.lowest_path === tc3.lowest_path && raw.lowest_ratio_4 === tc3.lowest_ratio_4
      && !matchesTc3Facts(tc3, changed)
      && addedRaw.per_source.length === tc3.per_source.length + 1
      && addedRaw.lowest_path === tc3.lowest_path && addedRaw.lowest_ratio_4 === tc3.lowest_ratio_4
      && !matchesTc3Facts(tc3, added);
  })(), '注入'],
  ['事实 keywords 漂移而记录照抄必否（hit/ratio/最低源均不变）', (function () {
    const changed = editFactValue(tc3Facts, 0, { keywords: tc3Facts[0].value.keywords - 1 });
    const raw = deriveTc3Facts(changed);
    return consistentTc3(tc3) && raw.per_source[0].hit === tc3.per_source[0].hit
      && raw.per_source[0].ratio_4 === tc3.per_source[0].ratio_4
      && raw.lowest_path === tc3.lowest_path && raw.lowest_ratio_4 === tc3.lowest_ratio_4
      && !matchesTc3Facts(tc3, changed);
  })(), '注入'],
  ['事实 ratio／最低字段／并列首个各臂分别判别', (function () {
    // 改非最低源且不改最低归属：只有逐源 ratio_4 对账能判否，最低值臂不得代打。
    const index = tc3Facts.findIndex(function (e) { return e.path !== tc3.lowest_path; });
    if (index < 0) { return false; }
    const changed = editFactValue(tc3Facts, index, { ratio: 0.9 });
    const raw = deriveTc3Facts(changed);
    const lowestValueLied = Object.assign({}, tc3, { lowest_ratio_4: '0.9000' });
    const lowestPathLied = Object.assign({}, tc3, { lowest_path: tc3.per_source[index].path });
    // 两源原始 ratio 并列时生成器保留首个；<= 会错取末个。
    const tied = tc3Facts.map(function (e) {
      return { path: e.path, value: Object.assign({}, e.value, { ratio: 0.6 }) };
    });
    const tiedRaw = deriveTc3Facts(tied);
    // 旧式 Number(null) 会把非最低源变成 0.0000 并抢下最低源；记录按旧结果伪造时也必须判否。
    const nullFacts = editFactValue(tc3Facts, index, { ratio: null });
    const nullRecord = Object.assign({}, tc3, {
      per_source: tc3.per_source.map(function (s, i) {
        return Object.assign({}, s, { ratio_4: i === index ? '0.0000' : s.ratio_4 });
      }),
      lowest_path: tc3.per_source[index].path, lowest_ratio_4: '0.0000'
    });
    const nullDiff = tc3FactDiff(nullRecord, nullFacts);
    return consistentTc3(tc3) && raw.per_source[index].hit === tc3.per_source[index].hit
      && raw.per_source[index].keywords === tc3.per_source[index].keywords
      && raw.per_source[index].ratio_4 === '0.9000'
      && raw.per_source.every(function (p) { return p.ratio_valid; })
      && raw.lowest_path === tc3.lowest_path && raw.lowest_ratio_4 === tc3.lowest_ratio_4
      && !matchesTc3Facts(tc3, changed)
      && !matchesTc3Facts(lowestValueLied, tc3Facts) && !matchesTc3Facts(lowestPathLied, tc3Facts)
      && tiedRaw.lowest_path === tc3Facts[0].path && tiedRaw.lowest_ratio_4 === '0.6000'
      && validTc3Ratio(0) && !validTc3Ratio(null) && !validTc3Ratio(NaN)
      && !validTc3Ratio(Infinity) && !validTc3Ratio('0.6')
      && nullDiff.length === 3
      && nullDiff.some(function (d) { return d.indexOf('per_source[' + index + '].ratio 非有限数字') === 0; })
      && nullDiff.some(function (d) { return d.indexOf('lowest_path ') === 0; })
      && nullDiff.some(function (d) { return d.indexOf('lowest_ratio_4 ') === 0; });
  })(), '注入'],
  ['事实 missed 等长换词而清单照抄必否（其余计数与最低源不变）', (function () {
    const missed = tc3Facts[0].value.missed.slice();
    if (missed.length > 0) { missed[0] = 'fact-injected-miss'; }
    const changed = editFactValue(tc3Facts, 0, { missed: missed });
    const raw = deriveTc3Facts(changed);
    return missed.length > 0 && consistentTc3(tc3)
      && raw.per_source[0].hit === tc3.per_source[0].hit
      && raw.per_source[0].keywords === tc3.per_source[0].keywords
      && raw.per_source[0].ratio_4 === tc3.per_source[0].ratio_4
      && raw.lowest_path === tc3.lowest_path && raw.lowest_ratio_4 === tc3.lowest_ratio_4
      && !matchesTc3Facts(tc3, changed);
  })(), '注入'],
  ['非最低事实源 path 漂移而记录照抄必否（最低源不变）', (function () {
    const index = tc3Facts.findIndex(function (e) { return e.path !== tc3.lowest_path; });
    if (index < 0) { return false; }
    const changed = editFactValue(tc3Facts, index, {});
    changed[index] = { path: 'fact-injected-path', value: changed[index].value };
    const raw = deriveTc3Facts(changed);
    return consistentTc3(tc3) && raw.lowest_path === tc3.lowest_path
      && raw.per_source[index].hit === tc3.per_source[index].hit
      && raw.per_source[index].ratio_4 === tc3.per_source[index].ratio_4
      && !matchesTc3Facts(tc3, changed);
  })(), '注入']
];

const tc1Bad = badCases(tc1Cases);
const tc2Bad = badCases(tc2Cases);
const tc3Bad = badCases(tc3Cases);
const tc1Gaps = classGaps(tc1Cases);
const tc2Gaps = classGaps(tc2Cases);
const tc3Gaps = classGaps(tc3Cases);
// 五条都放条件里而非表里，避免空表或单行永远通过把任一变量的不变量旁路。
check('B3-TC1', tc1.verdict === 'INCONCLUSIVE' && consistentTc1(tc1) && tc1FactOk && tc1Bad.length === 0 && tc1Gaps.length === 0,
  'TC-1 判 ' + tc1.verdict + '（可判定数 ' + tc1.judgeable_n + '／门槛 ' + minN + '／ratio_red ' + tc1.threshold.ratio_red
  + '，ratio ' + tc1.backfill_n + '/' + tc1.judgeable_n + ' 重算 ' + d1.ratio_4 + ' vs 记录 ' + tc1.ratio_4 + '，裁决重导 ' + d1.verdict
  + '，事实重算 judgeable/backfill=' + f1.judgeable_n + '/' + f1.backfill_n + ' vs 记录 ' + tc1.judgeable_n + '/' + tc1.backfill_n
  + '；判定=' + (tc1.verdict === 'INCONCLUSIVE' ? '字面✓' : '字面✗') + (consistentTc1(tc1) ? '＋自洽✓' : '＋自洽✗') + (tc1FactOk ? '＋事实✓' : '＋事实✗')
  + '，对照表 ' + (tc1Cases.length - tc1Bad.length) + '/' + tc1Cases.length + '，类覆盖 ' + (TC_CLASSES.length - tc1Gaps.length) + '/' + TC_CLASSES.length
  + (tc1FactDiffs.length ? ' 事实失配：' + tc1FactDiffs.join('；') : '')
  + (tc1Bad.length ? ' 失配：' + tc1Bad.join('、') : '') + (tc1Gaps.length ? ' 缺类：' + tc1Gaps.join('、') : '') + '）');
check('B3-TC2', tc2.verdict === 'RED' && consistentTc2(tc2) && tc2FactOk && tc2Bad.length === 0 && tc2Gaps.length === 0,
  'TC-2 判 ' + tc2.verdict + '（total ' + tc2.total + '／mean_red ' + tc2.threshold.mean_red + '／field_missing_red ' + tc2.threshold.field_missing_red
  + '，mean 重算 ' + d2.mean_4 + ' vs 记录 ' + tc2.mean_ratio_4 + '，cond_a/b 重算 ' + d2.cond_a + '/' + d2.cond_b + ' vs 记录 ' + tc2.cond_a + '/' + tc2.cond_b + '，裁决重导 ' + d2.verdict
  + '，事实 total/mean=' + f2.total + '/' + f2.mean_ratio_4 + ' vs 记录 ' + tc2.total + '/' + tc2.mean_ratio_4
  + '；判定=' + (tc2.verdict === 'RED' ? '字面✓' : '字面✗') + (consistentTc2(tc2) ? '＋自洽✓' : '＋自洽✗') + (tc2FactOk ? '＋事实✓' : '＋事实✗')
  + '，对照表 ' + (tc2Cases.length - tc2Bad.length) + '/' + tc2Cases.length + '，类覆盖 ' + (TC_CLASSES.length - tc2Gaps.length) + '/' + TC_CLASSES.length
  + (tc2FactDiffs.length ? ' 事实失配：' + tc2FactDiffs.join('；') : '')
  + (tc2Bad.length ? ' 失配：' + tc2Bad.join('、') : '') + (tc2Gaps.length ? ' 缺类：' + tc2Gaps.join('、') : '') + '）');
check('B3-TC3', tc3.verdict === 'AMBER' && consistentTc3(tc3) && tc3FactOk && tc3Bad.length === 0 && tc3Gaps.length === 0,
  'TC-3 判 ' + tc3.verdict + '（源 ' + tc3.per_source.length + ' 个／红线 ' + tc3.threshold.red + '／绿线 ' + tc3.threshold.green
  + '，最低重算 ' + d3.lowest_ratio_4 + ' vs 记录 ' + tc3.lowest_ratio_4 + ' @' + d3.lowest_paths.join(',') + '，裁决重导 ' + d3.verdict
  + '，事实重算最低 ' + f3.lowest_ratio_4 + ' @' + f3.lowest_path + ' vs 记录 ' + tc3.lowest_ratio_4 + ' @' + tc3.lowest_path
  + '；判定=' + (tc3.verdict === 'AMBER' ? '字面✓' : '字面✗') + (consistentTc3(tc3) ? '＋自洽✓' : '＋自洽✗') + (tc3FactOk ? '＋事实✓' : '＋事实✗')
  + '，对照表 ' + (tc3Cases.length - tc3Bad.length) + '/' + tc3Cases.length + '，类覆盖 ' + (TC_CLASSES.length - tc3Gaps.length) + '/' + TC_CLASSES.length
  + (tc3FactDiffs.length ? ' 事实失配：' + tc3FactDiffs.join('；') : '')
  + (tc3Bad.length ? ' 失配：' + tc3Bad.join('、') : '') + (tc3Gaps.length ? ' 缺类：' + tc3Gaps.join('、') : '') + '）');
check('B3-NC1', gates.B.nc1.pass === true, 'NC-1 负对照 0 命中（facts=' + gates.B.nc1.fact_count + '，five=' + gates.B.nc1.five_piece_present + '）');
check('B4', preRegText.indexOf('0.2462') >= 0 && preRegText.indexOf('0.6000') >= 0 && gates.B.tc1.threshold.lag_days === 90 && gates.B.tc1.threshold.ratio_red === 0.2 && gates.B.tc1.threshold.min_n === 5 && gates.B.tc2.threshold.mean_red === 0.6 && gates.B.tc2.threshold.field_missing_red === 0.5 && gates.B.tc3.threshold.red === 0.5 && gates.B.tc3.threshold.green === 0.7, '阈值跑前写死且与预声明逐项一致（跑后未调）');
const bindingOk = ['TC-1', 'TC-2', 'TC-3'].every(function (id) {
  const b = C.bindingByCriterion(id);
  if (!b) { return false; }
  const ctrl = C.bindingByCriterion(b.same_family_control);
  if (!ctrl) { return false; }
  return b.families.some(function (f) { return ctrl.families.indexOf(f) >= 0; });
});
check('B5', bindingOk, '真判据与正对照共享 detector 族（逐条对照 DETECTOR_BINDING，非凭命名相似）');
check('B6', gates.B.tc2.total > 0 && gates.B.tc3.per_source.length === 2 && gates.B.tc1.judgeable_n >= 0, '信号非空（ADR ' + gates.B.tc2.total + ' 份 / 意图源 ' + gates.B.tc3.per_source.length + ' 个），未触发全空回炉');

// ---------- C 闸：信任裁决（依据预入库 + 三档 + 锚定 + agent 可消费） ----------
const bands = ['supported', 'unsupported', 'insufficient'];
// `supported` 是 `unsupported` 的子串——裸 indexOf 会让第一档永真（有 unsupported 就必过）。认整词，前后非字母才算该档定义在场。
const cBandsMissing = bands.filter(function (b) { return !new RegExp('(^|[^A-Za-z])' + b + '($|[^A-Za-z])').test(cBasisText); });
check('C1', cBandsMissing.length === 0, '裁定依据预入库文件含三档定义（看报告前已存在）' + (cBandsMissing.length ? '，缺 ' + cBandsMissing.join(', ') : ''));
check('C2', bands.indexOf(carHappy.overall_verdict) >= 0, '综合裁定 ' + carHappy.overall_verdict + ' 属三档之一');
const unanchored = carHappy.adjudication.entries.filter(function (e) { return !e.criterion_id || (e.anchored_fact_ids.length === 0 && e.anchored_evidence_ids.length === 0); });
check('C3', unanchored.length === 0, '裁定条目逐条锚定 B 产物（' + carHappy.adjudication.entries.length + ' 条，无锚 ' + unanchored.length + ' 条）');
check('C4', Array.isArray(carHappy.machine_contract.verdict_enum) && carHappy.machine_contract.verdict_enum.join(',') === bands.join(',') && carHappy.adjudication.entries.length >= 6 && typeof carHappy.receipt.chain_hash === 'string', 'agent 可消费性：结构化裁决块 + verdict 枚举三档 + 引文锚可解析（B5/A-027）');
check('C5', carHappy.adjudication.human && carHappy.adjudication.human.status === 'pending', '人裁定槽位保留（status=pending，裁定仍由人做）');
check('C6', carFail.degraded_mode === true && mdFail.indexOf(G.UNVERIFIED_MARK) >= 0 && carHappy.degraded_mode === false, '失败路径产物：明确降级 + ' + G.UNVERIFIED_MARK + ' 印记，happy 未降级');

// ---------- Receipt 加固断言（调研报告 §2.1 / §6.2：单 commit 锚不足） ----------
const rc = carHappy.receipt;
// 注：产物是对「生成时刻」锚定的，故断言「锚可解析为真实对象」而非「等于当前 HEAD」——
// 后者在提交后必然失效，会把正确的不变量写成假 FAIL（本票首次收尾即踩到）。
function gitType(rev) {
  try { return execFileSync('git', ['cat-file', '-t', rev], { cwd: REPO, encoding: 'utf8' }).trim(); }
  catch (e) { return ''; }
}
// git-object 前置（D-163②）：receipt 锚 fc00d458/6f405cfc 幽灵对象非分支祖先 clone 不携带——
// 缺席借仓内 bundle 临时仓零写入物化；R2/R4 纯 JSON 断言零需不连坐
const GO23 = groupProbe('23-first-report-check', 'R-anchor', [need('git-object:' + rc.commit_anchor, gitObjectNeedOk(REPO, rc.commit_anchor, join(REPO, 'engine', 'test', 'fixtures', 'frozen', '23-frozen-' + rc.commit_anchor.slice(0, 8) + '.bundle')))]);
if (GO23) check('R1', typeof rc.tree_anchor === 'string' && rc.tree_anchor.length === 40 && gitType(rc.tree_anchor) === 'tree' && gitType(rc.commit_anchor) === 'commit', '双锚可解析：tree ' + rc.tree_anchor.slice(0, 12) + ' 为真实 tree 对象，commit ' + rc.commit_anchor.slice(0, 7) + ' 为真实 commit 对象');
check('R2', rc.content_digest && rc.content_digest.algo === 'sha256' && rc.content_digest.value.length === 64 && rc.content_digest.canonicalization === G.CONTENT_DIGEST_CANONICALIZATION, '内容摘要明确声明算法与规范化规则（' + rc.content_digest.canonicalization + '）');
const gr = rc.gate_ref;
let preregAncestor = false;
try {
  if (GO23) { execFileSync('git', ['merge-base', '--is-ancestor', gr.prereg_commit, rc.commit_anchor], { cwd: REPO, encoding: 'utf8' }); preregAncestor = true; }
} catch (e) { preregAncestor = false; }
if (GO23) check('R3', !!gr && gr.prereg_commit.length > 0 && gr.criterion_ids.join(',') === 'PC-1,PC-2,TC-1,TC-2,TC-3,NC-1' && preregAncestor, 'gate_ref 指向预声明闸门且其 commit 拓扑先于首报锚（闸门先于被裁定对象）');
check('R4', rc.degraded === false && carFail.receipt.degraded === true && carFail.receipt.tree_anchor === rc.tree_anchor, '降级 receipt 保留同一 tree 锚并置 degraded=true（同锚可比）');

// ---------- 汇总 ----------
let failed = 0;
for (const r of results) {
  if (!r[1]) { failed = failed + 1; }
  console.log((r[1] ? 'PASS' : 'FAIL') + ' ' + r[0] + ' — ' + r[2]);
}
console.log('----');
console.log(results.length + ' checks, ' + (results.length - failed) + ' pass, ' + failed + ' fail');
if (failed > 0) { process.exit(1); }
console.log('23-first-report-check: PASS (exit 0)');
process.exit(0);
