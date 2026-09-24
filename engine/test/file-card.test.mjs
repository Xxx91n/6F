// file-card.test.mjs — #80 步② 文件级审计卡投影+查询语义契约测试（D-122/D-123/D-126/ADR-0023）
// 断言面：A kernel 逐字段直投+citation 锚 / B derived 确定性派生（percentile/top_n/priority_band 规则版本）/
//   C 失败三态（new_file/insufficient_history→derived 抑制；not_applicable 不出空卡）/ D miss 四类显式态 /
//   E at:<sha> pin+staleness 双字段 / F narrative 键存在性校验 / G projectFileCard DuckDB 投影层 /
//   H runAuditFile lazy 补采（注入缝=确定性合成事实；幂等复跑 emitted=0）/ I advisory 结构性隔离。
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
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

console.log('FILE-CARD ' + n + '/' + n);
