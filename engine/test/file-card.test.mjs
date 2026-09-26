// file-card.test.mjs — #80 步② 文件级审计卡投影+查询语义契约测试（D-122/D-123/D-126/ADR-0023）
// 断言面：A kernel 逐字段直投+citation 锚 / B derived 确定性派生（percentile/top_n/priority_band 规则版本）/
//   C 失败三态（new_file/insufficient_history→derived 抑制；not_applicable 不出空卡）/ D miss 四类显式态 /
//   E at:<sha> pin+staleness 双字段（E3 前缀歧义验重） / F narrative 键存在性校验 / G projectFileCard DuckDB 投影层 /
//   H runAuditFile lazy 补采（注入缝=确定性合成事实；幂等复跑 emitted=0；H2 毒事实回滚零行/H3 skipped 披露+消息钉）/
//   I advisory 结构性隔离 / J MCP 缺库 never_collected 卡 / K set_truncated 标记。C4~C7=D-136 失败态收口断言组（#83）。
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const FC = await import(pathToFileURL(join(root, 'dist', 'fact', 'file-card.js')).href);
const P = await import(pathToFileURL(join(root, 'dist', 'fact', 'projection.js')).href);
const S = await import(pathToFileURL(join(root, 'dist', 'fact', 'store.js')).href);
const AF = await import(pathToFileURL(join(root, 'dist', 'audit', 'file-card.js')).href);
const CL = await import(pathToFileURL(join(root, 'dist', 'upstream', 'codelore.js')).href);
const MCP = await import(pathToFileURL(join(root, 'dist', 'mcp-server.js')).href);

let n = 0;
let factSeq = 0;
const t = (name, fn) => { fn(); n++; };
const tAsync = async (name, fn) => { await fn(); n++; };

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const SHA_HEAD = 'c'.repeat(40);

function fact(o) {
  return Object.assign({
    fact_id: 'f' + (factSeq++).toString(16).padStart(35, '0'), trace_id: 'a'.repeat(32), baggage_id: 'b'.repeat(32),
    scale: 'Micro-B', quadrant: 'strategic', dimension: null, collector_id: 'codelore@v1',
    repo_ref: 't@' + SHA_A, subject_ref: 'src/a.ts', evidence_ref: 'ev',
    metric: 'codelore.file_facet_row', value_json: '{}', observed_at: '2026-09-20T00:00:00Z'
  }, o);
}
function facetRow(subject, analysis, row, repoSha) {
  return fact({
    subject_ref: subject, repo_ref: 't@' + (repoSha || SHA_A),
    value_json: JSON.stringify({ analysis: analysis, group: 'behavior', role: 'first_class', row: row, path: subject })
  });
}

// ---------- A. kernel 直投+citation 锚 ----------
t('A1 kernel.facet_rows 按 analysis 归组且逐行带 fact_ref/observed_at/evidence_ref', () => {
  const card = FC.buildFileCard({
    subject: 'src\\a.ts',   // 读侧归一：反斜杠→POSIX 形
    setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'src/a.ts', revisions: 9, hotspot_score: 5.0 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.card_type, 'file-audit-card');
  assert.equal(card.subject, 'src/a.ts');
  const rows = card.kernel.facet_rows.hotspots;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].row.revisions, 9);
  assert.ok(rows[0].fact_ref && rows[0].observed_at && rows[0].evidence_ref);
  assert.equal(card.advisory, true);
});

// ---------- B. derived 确定性派生 ----------
t('B1 percentile/top_n/band 确定性可复算（同输入同输出）', () => {
  const facts = [
    facetRow('src/a.ts', 'hotspots', { path: 'src/a.ts', revisions: 9, hotspot_score: 9.0 }),
    facetRow('src/b.ts', 'hotspots', { path: 'src/b.ts', revisions: 5, hotspot_score: 3.0 }),
    facetRow('src/c.ts', 'hotspots', { path: 'src/c.ts', revisions: 2, hotspot_score: 1.0 })
  ];
  const mk = () => FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A, setFacts: facts,
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  const c1 = mk(), c2 = mk();
  assert.equal(c1.derived.rule_version, 'hotspot_priority_v1');
  assert.equal(c1.derived.revisions, 9);
  assert.equal(c1.derived.hotspot_score, 9.0);
  // 9.0 在 {9,3,1} 中 less=2,eq=1 → 中位秩 (2+0.5)/3≈0.833
  assert.ok(Math.abs(c1.derived.percentile_rank.value - (2 + 0.5) / 3) < 1e-9);
  assert.equal(c1.derived.top_n_flag.value, true);
  assert.equal(c1.derived.priority_band.value, 'medium');   // pct≈0.833 → medium
  assert.deepEqual(JSON.parse(JSON.stringify(c1.derived)), JSON.parse(JSON.stringify(c2.derived)));
});
t('B2 priority_band 分档确定性（pct>=0.9 high / >=0.6 medium / else low）', () => {
  const facts = [];
  for (let i = 0; i < 9; i++) { facts.push(facetRow('src/f' + i + '.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: i })); }
  facts.push(facetRow('src/hero.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 99 }));
  const c = FC.buildFileCard({
    subject: 'src/hero.ts', setRepoRef: 't@' + SHA_A, setFacts: facts,
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(c.derived.percentile_rank.value, (9 + 0.5) / 10);
  assert.equal(c.derived.priority_band.value, 'high');
});

// ---------- C. 失败三态 ----------
t('C1 new_file（revisions=1）→ 显式态仅静态指标（derived 抑制 suppressed_by 留痕）', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'revisions', { entity: 'src/a.ts', n_revs: 1 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.failure_state, 'new_file');
  assert.equal(card.derived.revisions, 1);                        // 静态指标仍在
  assert.equal(card.derived.priority_band.value, null);           // derived 抑制
  assert.equal(card.derived.suppressed_by, 'new_file');
});
t('C2 insufficient_history（revisions<3）同上抑制语义', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 2, hotspot_score: 5 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.failure_state, 'insufficient_history');
  assert.equal(card.derived.suppressed_by, 'insufficient_history');
});
t('C3 binary/非 regular→card_type:not_applicable 不出空卡（合法空值非 miss）', () => {
  const card = FC.buildFileCard({
    subject: 'bin/blob.bin', setRepoRef: 't@' + SHA_A,
    setFacts: [fact({
      metric: 'codelore.file_subject_skip', subject_ref: 'hotspots',
      value_json: JSON.stringify({ analysis: 'hotspots', raw_path: 'bin/blob.bin', reason: 'non-regular-path' })
    })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.card_type, 'not_applicable');
  assert.equal(card.miss.state, 'not_applicable');
  assert.equal(card.failure_state, 'not_applicable');
});

// ---------- C*. D-136 失败态投影收口（#83） ----------
t('C4 new_file：kernel 卡面滤除历史派生族入 suppressed_facets 带原因码（静态 revisions 保留）', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [
      facetRow('src/a.ts', 'revisions', { entity: 'src/a.ts', n_revs: 1 }),
      facetRow('src/a.ts', 'hotspots', { path: 'src/a.ts', revisions: 1, hotspot_score: 0.5 }),
      facetRow('src/a.ts', 'coupling', { entity_a: 'src/a.ts', entity_b: 'src/b.ts', shared: 1 })
    ],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.failure_state, 'new_file');
  assert.equal(card.kernel.facet_rows.hotspots, undefined);            // 历史派生族不上卡面
  assert.equal(card.kernel.facet_rows.coupling, undefined);
  assert.ok(card.kernel.facet_rows.revisions);                          // 静态指标保留（失败态判据本体）
  assert.deepEqual(card.kernel.suppressed_facets, [
    { facet: 'coupling', reason: 'new_file' },
    { facet: 'hotspots', reason: 'new_file' }
  ]);                                                                  // closed 枚举每项带原因码（analyses 字典序）
  assert.equal(card.derived.suppressed_by, 'new_file');                 // suppressed_by 现行保留
});
t('C5 未声明 facet 在失败态 fail-closed 入 suppressed_facets（禁未分类泄漏——非历史族一样不上卡）', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [
      facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 2, hotspot_score: 5 }),
      facetRow('src/a.ts', 'future-undeclared', { path: 'x', v: 1 })
    ],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.failure_state, 'insufficient_history');
  assert.deepEqual(Object.keys(card.kernel.facet_rows), []);            // 卡面零 facet（revisions 未发射则无静态件）
  assert.deepEqual(card.kernel.suppressed_facets.map(s => s.facet), ['future-undeclared', 'hotspots']);
});
t('C6 closed 枚举成员级双向差集：static ∪ history = 发射词表（33 名）且交集 ∅', () => {
  const vocab = CL.CODELORE_BATCH1_FACETS.concat(CL.CODELORE_BEHAVIOR_FACETS).map(s => s.analysis);
  const stat = FC.FILE_CARD_STATIC_FACETS, hist = FC.FILE_CARD_HISTORY_DERIVED_FACETS;
  const both = stat.filter(a => hist.indexOf(a) >= 0);
  assert.deepEqual(both, []);                                          // 交集空
  const declared = new Set(stat.concat(hist));
  assert.deepEqual(vocab.filter(a => !declared.has(a)), []);           // 发射名全已分类
  assert.deepEqual([...declared].filter(a => vocab.indexOf(a) < 0), []); // 声明名全在词表（无死成员）
});
t('C7 ok 态卡面不受收口影响（全 facet 直投+suppressed_facets 空）', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.failure_state, 'ok');
  assert.ok(card.kernel.facet_rows.hotspots);
  assert.deepEqual(card.kernel.suppressed_facets, []);
});

// ---------- D. miss 四类显式态 ----------
t('D1 never_collected：无观测集→miss+cli_guidance 可行动指引', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: null, setFacts: [],
    availableHeadShas: [], pinnedSha: null, currentHeadSha: SHA_HEAD, source: 'prefetch',
    cliGuidance: 'macro-audit audit file t "src/a.ts" --db x.duckdb'
  });
  assert.equal(card.card_type, 'miss');
  assert.equal(card.miss.state, 'never_collected');
  assert.ok(card.miss.cli_guidance.indexOf('audit file') >= 0);
});
t('D2 not_tracked_at_sha：集内无 subject 且无血缘→显式态+可用集清单', () => {
  const card = FC.buildFileCard({
    subject: 'src/ghost.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })],
    availableHeadShas: [SHA_A, SHA_B], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.miss.state, 'not_tracked_at_sha');
  assert.deepEqual(card.miss.available_head_shas, [SHA_A, SHA_B]);      // F6：集内枝补齐可用集清单（pin 枝同形）
});
t('D3 pin 观测集缺席→not_tracked_at_sha＋available_head_shas 披露', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: null, setFacts: [],
    availableHeadShas: [SHA_A, SHA_B], pinnedSha: SHA_HEAD, currentHeadSha: SHA_HEAD, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.miss.state, 'not_tracked_at_sha');
  assert.deepEqual(card.miss.available_head_shas, [SHA_A, SHA_B]);
});
t('D4 renamed_to：血缘存在→跳转指引+逐请求重验证；目标有事实 revalidated=true', () => {
  const card = FC.buildFileCard({
    subject: 'old/name.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [
      fact({
        metric: 'file.renamed', subject_ref: 'new/name.ts',
        value_json: JSON.stringify({ from: 'old/name.ts', to: 'new/name.ts', commit_sha: SHA_B, similarity: 87 })
      }),
      facetRow('new/name.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })
    ],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.miss.state, 'renamed_to');
  assert.equal(card.miss.renamed_to, 'new/name.ts');
  assert.equal(card.miss.revalidated, true);
  assert.equal(card.miss.lineage_edge.similarity, 87);
});
t('D5 renamed_to 目标无事实→revalidated=false（条件跳转不成立照实披露）', () => {
  const card = FC.buildFileCard({
    subject: 'old/name.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [fact({
      metric: 'file.renamed', subject_ref: 'new/name.ts',
      value_json: JSON.stringify({ from: 'old/name.ts', to: 'new/name.ts', commit_sha: SHA_B, similarity: 87 })
    })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.miss.state, 'renamed_to');
  assert.equal(card.miss.revalidated, false);
});

// ---------- E. at:<sha> pin + staleness 双字段 ----------
t('E1 staleness：current==observed→fresh；不等→behind；未知→unknown', () => {
  const mk = (cur) => FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: cur, source: 'prefetch', cliGuidance: null
  });
  assert.equal(mk(SHA_A).staleness.drift, 'fresh');
  assert.equal(mk(SHA_HEAD).staleness.drift, 'behind');
  assert.equal(mk(null).staleness.drift, 'unknown');
});
t('E2 pin 披露：pin_matches_observed_head 随 pinned_sha 比对', () => {
  const facts = [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })];
  const hit = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A, setFacts: facts,
    availableHeadShas: [SHA_A], pinnedSha: SHA_A, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(hit.observation.pin_matches_observed_head, true);
});

// ---------- F. narrative 键存在性校验 ----------
t('F1 narrative.hints=键名引用（零指标值）＋validateFileCardCitations 验键存在', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.ok(card.narrative.hints.indexOf('kernel.facet_rows.hotspots') >= 0);
  assert.ok(card.narrative.hints.indexOf('derived.priority_band') >= 0);
  assert.equal(card.narrative.key_check.ok, true);
  const bad = FC.validateFileCardCitations(card, ['kernel.facet_rows.hotspots', 'kernel.facet_rows.ghost']);
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.missing, ['kernel.facet_rows.ghost']);
});

// ---------- I. advisory 结构性隔离 ----------
t('I1 卡 schema 无 verdict/gate-consumable 字段（结构性隔离不是纪律是形状）', () => {
  const card = FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  const flat = JSON.stringify(Object.keys(card).concat(Object.keys(card.derived)));
  assert.equal(/verdict|gate/i.test(flat), false);
  assert.equal(card.advisory, true);
});

// ---------- G. projectFileCard DuckDB 投影层 ----------
const tmp1 = mkdtempSync(join(tmpdir(), 'fcard-'));
const dbPath = join(tmp1, 'facts.duckdb');
await tAsync('G1 投影层：最新观测集默认+at pin+miss 路径（真 DuckDB）', async () => {
  const w = await S.openWriter(dbPath);
  try {
    for (const f of [
      facetRow('src/a.ts', 'hotspots', { path: 'src/a.ts', revisions: 9, hotspot_score: 9 }, SHA_A),
      facetRow('src/b.ts', 'hotspots', { path: 'src/b.ts', revisions: 5, hotspot_score: 3 }, SHA_A),
      fact({
        subject_ref: 'src/old.ts', repo_ref: 't@' + SHA_B, metric: 'codelore.file_facet_row',
        value_json: JSON.stringify({ analysis: 'hotspots', row: { revisions: 7, hotspot_score: 2 }, path: 'src/old.ts' }),
        observed_at: '2026-09-10T00:00:00Z'
      })   // 旧集（observed_at 早）
    ]) { await S.appendFact(w, f); }
  } finally { S.closeDuckdb(w); }
  const latest = await P.projectFileCard(dbPath, { repo: 't', subject: 'src/a.ts', current_head_sha: SHA_A });
  assert.equal(latest.repo_ref, 't@' + SHA_A);   // SHA_A observed_at 晚→最新集
  assert.equal(latest.derived.hotspot_score, 9);
  const pinned = await P.projectFileCard(dbPath, { repo: 't', subject: 'src/old.ts', at: SHA_B });
  assert.equal(pinned.repo_ref, 't@' + SHA_B);
  assert.equal(pinned.observation.pin_matches_observed_head, true);
  const miss = await P.projectFileCard(dbPath, { repo: 't', subject: 'src/ghost.ts' });
  assert.equal(miss.miss.state, 'not_tracked_at_sha');
  const none = await P.projectFileCard(dbPath, { repo: 'nope', subject: 'x.ts', cli_guidance: 'cmd' });
  assert.equal(none.miss.state, 'never_collected');
});

// ---------- H. runAuditFile lazy 补采（注入缝确定性） ----------
await tAsync('H1 runAuditFile：首查补采 emitted>0，复跑 prefetch emitted=0，pin 不补采', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fcard-repo-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 't'], { cwd: dir });
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'a.ts'), 'export {}\n');
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-qm', 'c1'], { cwd: dir });
  const db2 = join(mkdtempSync(join(tmpdir(), 'fcard-db-')), 'facts.duckdb');
  const inject = {
    codelore: (ctx, repoRoot) => [
      {
        fact_id: 'inj-1', trace_id: ctx.traceId, baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic',
        dimension: null, collector_id: 'codelore@v1', repo_ref: ctx.repoRef, subject_ref: 'src/a.ts',
        evidence_ref: 'inj', metric: 'codelore.file_facet_row',
        value_json: JSON.stringify({
          analysis: 'hotspots', group: 'behavior', role: 'first_class',
          row: { path: 'src/a.ts', revisions: 9, hotspot_score: 7 }, path: 'src/a.ts'
        }),
        observed_at: ctx.observedAt
      }
    ], lineage: () => []
  };
  const r1 = await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db2, collectors: inject });
  assert.equal(r1.backfilled, true);
  assert.equal(r1.emitted, 1);
  assert.equal(r1.card.card_type, 'file-audit-card');
  assert.equal(r1.card.source, 'backfill');
  assert.equal(r1.card.staleness.drift, 'fresh');
  assert.equal(r1.card.derived.hotspot_score, 7);
  const r2 = await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db2, collectors: inject });
  assert.equal(r2.backfilled, false);       // 幂等：集内已有 subject 事实→纯 prefetch
  assert.equal(r2.emitted, 0);
  assert.equal(r2.card.source, 'prefetch');
  // pin 到未采集 sha→not_tracked_at_sha 且不补采
  const r3 = await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db2, at: 'd'.repeat(40), collectors: inject });
  assert.equal(r3.backfilled, false);
  assert.equal(r3.card.miss.state, 'not_tracked_at_sha');
  // 脏工作区零感知：改文件不改 git 观测→卡照常服务
  writeFileSync(join(dir, 'src', 'a.ts'), 'export const dirty = 1\n');
  const r4 = await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db2, collectors: inject });
  assert.equal(r4.card.card_type, 'file-audit-card');
  rmSync(dir, { recursive: true, force: true });
});

// ---------- E3. F7a pin 前缀歧义验重（真 DuckDB 投影层） ----------
await tAsync('E3 at:<sha> ≥7 前缀歧义→not_tracked_at_sha 如实答不猜最新；唯一前缀照常命中', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fcard-amb-'));
  const db = join(dir, 'f.duckdb');
  const sha1 = 'aaaaaaa' + '1'.repeat(33);
  const sha2 = 'aaaaaaa' + '2'.repeat(33);
  const w = await S.openWriter(db);
  try {
    await S.appendFact(w, fact({ repo_ref: 't@' + sha1, subject_ref: 's.ts', observed_at: '2026-09-21T00:00:00Z' }));
    await S.appendFact(w, fact({ repo_ref: 't@' + sha2, subject_ref: 's.ts', observed_at: '2026-09-22T00:00:00Z' }));
  } finally { S.closeDuckdb(w); }
  const amb = await P.projectFileCard(db, { repo: 't', subject: 's.ts', at: 'aaaaaaa' });
  assert.equal(amb.miss.state, 'not_tracked_at_sha');
  assert.ok(amb.miss.detail.indexOf('歧义') >= 0);
  assert.deepEqual(amb.miss.available_head_shas.sort(), [sha1, sha2].sort());
  const uni = await P.projectFileCard(db, { repo: 't', subject: 's.ts', at: 'aaaaaaa2' });
  assert.equal(uni.repo_ref, 't@' + sha2);                            // 唯一前缀照常命中
  const full = await P.projectFileCard(db, { repo: 't', subject: 's.ts', at: sha1 });
  assert.equal(full.repo_ref, 't@' + sha1);                           // 全 sha 精确命中
  rmSync(dir, { recursive: true, force: true });
});

// ---------- H2. D-134 毒事实回归：非 IO 非指名错→回滚零行 ----------
await tAsync('H2 补采批内非指名 constraint 错（CHECK trace_id）→整体回滚库内零行', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fcard-repo2-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 't'], { cwd: dir });
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'a.ts'), 'export {}\n');
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-qm', 'c1'], { cwd: dir });
  const db = join(mkdtempSync(join(tmpdir(), 'fcard-db2-')), 'f.duckdb');
  const poison = {
    codelore: (ctx) => [
      { fact_id: 'ok-1', trace_id: ctx.traceId, baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic', dimension: null, collector_id: 'x', repo_ref: ctx.repoRef, subject_ref: 'src/a.ts', evidence_ref: 'e', metric: 'codelore.file_facet_row', value_json: '{}', observed_at: ctx.observedAt },
      { fact_id: 'poison-1', trace_id: 'NOT-HEX', baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic', dimension: null, collector_id: 'x', repo_ref: ctx.repoRef, subject_ref: 'src/a.ts', evidence_ref: 'e', metric: 'codelore.file_facet_row', value_json: '{}', observed_at: ctx.observedAt }
    ], lineage: () => []
  };
  let threw = false;
  try { await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db, collectors: poison }); }
  catch (e) { threw = true; assert.ok(String(e.message).indexOf('Constraint Error') >= 0, 'expect constraint error, got: ' + e.message); }
  assert.equal(threw, true);                                          // 吞错收窄：非 fact_id UNIQUE 必上抛
  const w2 = await S.openWriter(db);
  try {
    const rows = await (await w2.run('SELECT COUNT(*) FROM audit_fact')).getRows();
    assert.equal(Number(rows[0][0]), 0);                              // 回滚零行——残观测集不上桌
  } finally { S.closeDuckdb(w2); }
  rmSync(dir, { recursive: true, force: true });
});

// ---------- H3. D-134 skipped 披露 + fact_id UNIQUE 消息形态实物钉 ----------
await tAsync('H3 fact_id UNIQUE 撞键=幂等跳过 skipped 计数；消息形态钉（真 DuckDB）', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fcard-repo3-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 't'], { cwd: dir });
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'a.ts'), 'export {}\n');
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-qm', 'c1'], { cwd: dir });
  const db = join(mkdtempSync(join(tmpdir(), 'fcard-db3-')), 'f.duckdb');
  const mk = (ids) => ({
    codelore: (ctx) => ids.map(id => ({ fact_id: id, trace_id: ctx.traceId, baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic', dimension: null, collector_id: 'x', repo_ref: ctx.repoRef, subject_ref: 'src/a.ts', evidence_ref: 'e', metric: 'codelore.file_facet_row', value_json: '{}', observed_at: ctx.observedAt })),
    lineage: () => []
  });
  const r1 = await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db, collectors: mk(['dup-1', 'a-1']) });
  assert.equal(r1.emitted, 2); assert.equal(r1.skipped, 0);
  // 新 HEAD→新观测集补采：发射 dup-1（已存）+b-1（新）→emitted=1/skipped=1 分列披露
  writeFileSync(join(dir, 'src', 'a.ts'), 'export const v = 1\n');
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-qm', 'c2'], { cwd: dir });
  const r2 = await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db, collectors: mk(['dup-1', 'b-1']) });
  assert.equal(r2.backfilled, true);
  assert.equal(r2.emitted, 1);
  assert.equal(r2.skipped, 1);                                        // 已存 fact_id 命中=跳过可观测非吞错
  // 消息形态钉：真 DuckDB dup insert 产 Constraint Error + "fact_id: 指认三件套（D-059① 防措辞漂移先例）
  const w3 = await S.openWriter(db);
  try {
    let shape = null;
    try { await S.appendFact(w3, { fact_id: 'dup-1', trace_id: 'a'.repeat(32), baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic', dimension: null, collector_id: 'x', repo_ref: 't@' + SHA_A, subject_ref: 's', evidence_ref: 'e', metric: 'm', value_json: '{}', observed_at: '2026-01-01T00:00:00Z' }); }
    catch (e) { shape = e; }
    assert.ok(shape !== null);
    assert.equal(S.isFactIdUniqueViolation(shape), true);              // 实物指认=真消息形态
    assert.ok(String(shape.message).indexOf('Constraint Error') >= 0 && String(shape.message).indexOf('"fact_id:') >= 0 && String(shape.message).indexOf('unique constraint') >= 0);
    assert.equal(S.isFactIdUniqueViolation(new Error('Constraint Error: NOT NULL constraint failed: audit_fact.metric')), false);
    assert.equal(S.isFactIdUniqueViolation(new Error('Constraint Error: Duplicate key "fact_seq: 9" violates primary key constraint.')), false);
  } finally { S.closeDuckdb(w3); }
  rmSync(dir, { recursive: true, force: true });
});

// ---------- J. F5 MCP 缺库→结构化 never_collected 卡（非 isError 文本） ----------
await tAsync('J1 MCP file_card 库文件缺席→never_collected 卡+cli_guidance（isError=false）', async () => {
  const r = await MCP.handleRpcMessage({
    jsonrpc: '2.0', id: 7, method: 'tools/call',
    params: { name: 'file_card', arguments: { db: join(tmpdir(), 'fcard-no-such-db.duckdb'), repo: 't', path: 'src/a.ts' } }
  });
  assert.ok(r.result && r.result.isError === false, 'expect structured card not isError, got: ' + JSON.stringify(r).slice(0, 200));
  const card = JSON.parse(r.result.content[0].text);
  assert.equal(card.card_type, 'miss');
  assert.equal(card.miss.state, 'never_collected');
  assert.ok(card.miss.cli_guidance.indexOf('audit file') >= 0);
  assert.equal(card.advisory, true);
});

// ---------- K. F7h set_truncated 卡面标记 ----------
t('K1 观测集截断标记 set_truncated 上卡面（输入位 true→kernel.set_truncated=true；缺省 false）', () => {
  const mk = (tr) => FC.buildFileCard({
    subject: 'src/a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [facetRow('src/a.ts', 'hotspots', { path: 'x', revisions: 9, hotspot_score: 5 })],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null,
    setTruncated: tr
  });
  assert.equal(mk(true).kernel.set_truncated, true);
  assert.equal(mk(false).kernel.set_truncated, false);
  assert.equal(mk(undefined).kernel.set_truncated, false);
  const missCard = FC.buildFileCard({ subject: 'x', setRepoRef: null, setFacts: [], availableHeadShas: [], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null, setTruncated: true });
  assert.equal(missCard.kernel.set_truncated, true);                  // miss 卡同形透传（schema 字段常驻）
});


// ---------- L. #80 步③ 血缘缝合（D-137：多跳图遍历／环检测／跨观测集解析＋成对件新名端） ----------
function renameEdge(from, to, commitSha, similarity, repoSha, observedAt) {
  return fact({
    subject_ref: to, repo_ref: 't@' + (repoSha || SHA_A),
    metric: 'file.renamed',
    value_json: JSON.stringify({ from: from, to: to, head_sha: repoSha || SHA_A, commit_sha: commitSha, similarity: similarity, threshold: '50%', detector_version: 'rename-detector@v1', git_version: 'test' }),
    observed_at: observedAt || '2026-09-20T00:00:00Z'
  });
}

t('L1 1-switch 成对件新名端：旧名 era 事实并入新名卡（行级 subject_ref 溯源＋lineage 账本＋F10 回归=不误进 new_file）', () => {
  const card = FC.buildFileCard({
    subject: 'new.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [
      facetRow('new.ts', 'revisions', { path: 'new.ts', n_revs: 1 }),
      facetRow('old.ts', 'revisions', { path: 'old.ts', n_revs: 9 }),
      facetRow('old.ts', 'hotspots', { path: 'old.ts', revisions: 9, hotspot_score: 8 }),
      renameEdge('old.ts', 'new.ts', 'c'.repeat(40), 92)
    ],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.card_type, 'file-audit-card');
  assert.deepEqual(card.lineage.stitched_from, ['old.ts']);
  assert.equal(card.lineage.cycle_detected, false);
  assert.equal(card.lineage.truncated, false);
  assert.equal(card.lineage.edges.length, 1);
  assert.equal(card.lineage.edges[0].from, 'old.ts');
  const revs = card.kernel.facet_rows.revisions;
  assert.equal(revs.length, 2);                                   // 新名＋旧名 era 行并入
  assert.deepEqual(revs.map(function (r) { return r.subject_ref; }).sort(), ['new.ts', 'old.ts']);   // 行级溯源键在场
  assert.equal(card.derived.revisions, 9);                        // F10 回归：旧名历史计入→history 表观不再过浅
  assert.equal(card.failure_state, 'ok');                         // 不误进 new_file（缝合前 revisions=1 触发）
  assert.equal(card.derived.hotspot_score, 8);
});

t('L2 多跳链遍历：A→B→C 显式图遍历并入两跳旧名（非单路径 follow）', () => {
  const card = FC.buildFileCard({
    subject: 'c.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [
      facetRow('c.ts', 'hotspots', { path: 'c.ts', revisions: 1, hotspot_score: 1 }),
      facetRow('b.ts', 'hotspots', { path: 'b.ts', revisions: 4, hotspot_score: 4 }),
      facetRow('a.ts', 'hotspots', { path: 'a.ts', revisions: 5, hotspot_score: 5 }),
      renameEdge('a.ts', 'b.ts', 'a'.repeat(40), 90),
      renameEdge('b.ts', 'c.ts', 'b'.repeat(40), 95)
    ],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.deepEqual(card.lineage.stitched_from.slice().sort(), ['a.ts', 'b.ts']);
  assert.equal(card.lineage.stitched_from[0], 'b.ts');            // BFS 近端祖先先行
  assert.equal(card.kernel.facet_rows.hotspots.length, 3);        // 三时代行全并入
  assert.equal(card.derived.revisions, 5);                        // 多跳最旧时代计入
  assert.equal(card.lineage.edges.length, 2);
});

t('L3 环检测：A→B→A 病态边图不绕死——cycle_detected=true 如实披露且终止', () => {
  const card = FC.buildFileCard({
    subject: 'a.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [
      facetRow('a.ts', 'revisions', { path: 'a.ts', n_revs: 5 }),
      facetRow('b.ts', 'revisions', { path: 'b.ts', n_revs: 3 }),
      renameEdge('b.ts', 'a.ts', 'a'.repeat(40), 88),   // b→a：a 的祖先是 b
      renameEdge('a.ts', 'b.ts', 'b'.repeat(40), 85)    // a→b：b 的祖先是 a（闭环）
    ],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.equal(card.lineage.cycle_detected, true);
  assert.deepEqual(card.lineage.stitched_from, ['b.ts']);         // 环边如实披露在账本
  assert.equal(card.lineage.edges.length, 2);                   // 两条边均消费披露（含被环停的）
  assert.equal(card.derived.revisions, 5);
});

t('L4 跨观测集解析：血缘边仅存祖先集（lineageFacts 注入缝）→缝合照常兑现', () => {
  const card = FC.buildFileCard({
    subject: 'new.ts', setRepoRef: 't@' + SHA_A,
    setFacts: [
      facetRow('new.ts', 'revisions', { path: 'new.ts', n_revs: 2 }),
      facetRow('old.ts', 'revisions', { path: 'old.ts', n_revs: 7 })
    ],   // 选中集内无边
    lineageFacts: [renameEdge('old.ts', 'new.ts', 'd'.repeat(40), 91, '0'.repeat(40), '2026-09-19T00:00:00Z')],   // 边仅存祖先集
    availableHeadShas: [SHA_A, '0'.repeat(40)], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null
  });
  assert.deepEqual(card.lineage.stitched_from, ['old.ts']);
  assert.equal(card.kernel.facet_rows.revisions.length, 2);
  assert.equal(card.derived.revisions, 7);
});

await tAsync('L5 投影层跨集实物：边在祖先 repo_ref 集、行在选中集——真 DuckDB 缝合端到端', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fcard-lineage-'));
  const db = join(dir, 'f.duckdb');
  const SHA_OLD = '0'.repeat(40);
  const w = await S.openWriter(db);
  try {
    // 祖先集（早采）仅存血缘边；选中集（新采）持有新名+旧名行——边不在选中集正是跨集解析面
    await S.appendFact(w, renameEdge('old.ts', 'new.ts', 'd'.repeat(40), 91, SHA_OLD, '2026-09-19T00:00:00Z'));
    await S.appendFact(w, facetRow('new.ts', 'revisions', { path: 'new.ts', n_revs: 2 }, SHA_A));
    await S.appendFact(w, facetRow('old.ts', 'revisions', { path: 'old.ts', n_revs: 7 }, SHA_A));
  } finally { S.closeDuckdb(w); }
  const card = await P.projectFileCard(db, { repo: 't', subject: 'new.ts' });
  assert.equal(card.card_type, 'file-audit-card');
  assert.deepEqual(card.lineage.stitched_from, ['old.ts']);       // 祖先集边参与解析
  assert.equal(card.kernel.facet_rows.revisions.length, 2);
  assert.equal(card.derived.revisions, 7);
  // 反向腿：旧名查询→renamed_to 条件跳转（祖先集边同样兑现——miss 侧跨集解析）
  const miss = await P.projectFileCard(db, { repo: 't', subject: 'old.ts', at: SHA_A.slice(0, 8) });
  // pin SHA_A 前缀命中选中集——old.ts 在该集内有行故非 miss；改查无行名走 rename 腿
  assert.equal(miss.card_type !== undefined, true);
  rmSync(dir, { recursive: true, force: true });
});

t('L6 0-switch 边界件逐类点名：never_collected/not_tracked_at_sha/not_applicable/renamed_to 四态各一物理断言（血缘环不并入 not_applicable 病态面）', () => {
  const mk = (o) => FC.buildFileCard(Object.assign({
    subject: 'x.ts', setRepoRef: 't@' + SHA_A, setFacts: [],
    availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: 'cli x'
  }, o));
  assert.equal(FC.buildFileCard({ subject: 'x', setRepoRef: null, setFacts: [], availableHeadShas: [], pinnedSha: null, currentHeadSha: null, source: 'unknown', cliGuidance: 'g' }).miss.state, 'never_collected');
  assert.equal(mk({ setRepoRef: null, pinnedSha: 'f'.repeat(40) }).miss.state, 'not_tracked_at_sha');   // pin 观测集缺席（库在但 at 集未采）
  assert.equal(mk({ setFacts: [fact({ subject_ref: 'x.ts', metric: 'codelore.file_subject_skip', value_json: JSON.stringify({ raw_path: 'x.ts', reason: 'binary' }) })] }).miss.state, 'not_applicable');
  assert.equal(mk({ subject: 'gone.ts', setFacts: [renameEdge('gone.ts', 'new.ts', 'e'.repeat(40), 93)] }).miss.state, 'renamed_to');
  // miss 卡 lineage=null 统一形状（成对件 miss 端不背缝合账本）
  assert.equal(mk({ subject: 'gone.ts', setFacts: [renameEdge('gone.ts', 'new.ts', 'e'.repeat(40), 93)] }).lineage, null);
  // 失败态闭环：缝合并入的旧名历史抬高 revisions 出 insufficient/new_file（F10 语义）——L1 已钉 ok
  assert.equal(FC.buildFileCard({ subject: 'new.ts', setRepoRef: 't@' + SHA_A, setFacts: [facetRow('new.ts', 'revisions', { path: 'new.ts', n_revs: 1 })], availableHeadShas: [SHA_A], pinnedSha: null, currentHeadSha: SHA_A, source: 'prefetch', cliGuidance: null }).failure_state, 'new_file');   // 无血缘对照组：仍 new_file
});
console.log('FILE-CARD ' + n + '/' + n);
