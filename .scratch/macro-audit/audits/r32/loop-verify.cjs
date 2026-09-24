// LOOP 审核专项：F3 事务回滚 / F6 available_head_shas 两枝 / F5 缺库形态（直调 dist 模块）
const { mkdtempSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const ENG = 'D:/Aworker/6F/engine';

async function main() {
  const u = (p) => pathToFileURL(p).href;
  const AF = await import(u(ENG + '/dist/audit/file-card.js'));
  const PJ = await import(u(ENG + '/dist/fact/projection.js'));
  const ST = await import(u(ENG + '/dist/fact/store.js'));

  // --- 建玩具仓 ---
  const dir = mkdtempSync(join(tmpdir(), 'loop-repo-'));
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'a.ts'), 'export const x = 1\n');
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 't'], { cwd: dir });
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-qm', 'c1'], { cwd: dir });

  // --- F3: 好事实+坏事实同批 → 中途失败 → DB 应零行（回滚） ---
  const db1 = join(mkdtempSync(join(tmpdir(), 'loop-db-')), 'facts.duckdb');
  const inject = {
    codelore: (ctx) => [
      {
        fact_id: 'good-1', trace_id: ctx.traceId, baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic',
        dimension: null, collector_id: 'codelore@v1', repo_ref: ctx.repoRef, subject_ref: 'src/a.ts',
        evidence_ref: 'inj', metric: 'codelore.file_facet_row',
        value_json: JSON.stringify({ analysis: 'hotspots', group: 'behavior', role: 'first_class', row: { path: 'src/a.ts', revisions: 9, hotspot_score: 7 }, path: 'src/a.ts' }),
        observed_at: ctx.observedAt
      },
      (() => {
        // 坏事实：value_json 毒 getter——appendFact 读值时抛非 constraint 错 → 触发事务回滚
        const f = {
          fact_id: 'bad-1', trace_id: ctx.traceId, baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic',
          dimension: null, collector_id: 'codelore@v1', repo_ref: ctx.repoRef, subject_ref: 'src/a.ts',
          evidence_ref: 'inj', metric: 'codelore.file_facet_row', observed_at: ctx.observedAt
        };
        Object.defineProperty(f, 'value_json', { get() { throw new Error('IO Error: disk full (simulated mid-write)'); }, enumerable: true });
        return f;
      })()
    ],
    lineage: () => []
  };
  let threw = false, msg = '';
  try {
    await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db1, collectors: inject });
  } catch (e) { threw = true; msg = String(e && e.message || e); }
  console.log('F3 threw=' + threw + ' err=' + msg.slice(0, 120));
  let rows = 'db-not-created';
  if (existsSync(db1)) {
    try {
      const r = await ST.openReader(db1);
      const rd = await r.runAndReadAll('SELECT CAST(count(*) AS INTEGER) AS c FROM audit_fact');
      rows = JSON.stringify(rd.getRows());
      ST.closeDuckdb(r);
    } catch (e) { rows = 'open-fail:' + String(e && e.message || e).slice(0, 80); }
  }
  console.log('F3 post-fail rows=' + rows + ' (期望 [{"c":0}] 或 db-not-created → 无残集)');

  // --- F6: subject 缺席 miss 与 at-pin miss 两枝的 available_head_shas ---
  // 先补采一个正常集
  const db2 = join(mkdtempSync(join(tmpdir(), 'loop-db2-')), 'facts.duckdb');
  const good = {
    codelore: (ctx) => [{
      fact_id: 'g-1', trace_id: ctx.traceId, baggage_id: 'b'.repeat(32), scale: 'Micro-B', quadrant: 'strategic',
      dimension: null, collector_id: 'codelore@v1', repo_ref: ctx.repoRef, subject_ref: 'src/a.ts',
      evidence_ref: 'inj', metric: 'codelore.file_facet_row',
      value_json: JSON.stringify({ analysis: 'hotspots', group: 'behavior', role: 'first_class', row: { path: 'src/a.ts', revisions: 9, hotspot_score: 7 }, path: 'src/a.ts' }),
      observed_at: ctx.observedAt
    }],
    lineage: () => []
  };
  const rr = await AF.runAuditFile({ input: dir, path: 'src/a.ts', db: db2, collectors: good });
  const repoName = String(rr.card && rr.card.repo_ref || '').split('@')[0];
  console.log('repo_name=' + repoName + ' emitted=' + rr.emitted);
  // pin miss（at: 未采集 sha）
  const pinMiss = await PJ.projectFileCard(db2, { repo: repoName, subject: 'src/a.ts', at: 'd'.repeat(40) });
  console.log('F6 pin-miss state=' + (pinMiss.miss && pinMiss.miss.state) + ' heads=' + JSON.stringify(pinMiss.miss && pinMiss.miss.available_head_shas));
  // subject 缺席 miss（subject 不在最新观测集）
  const subMiss = await PJ.projectFileCard(db2, { repo: repoName, subject: 'src/never-collected.ts' });
  console.log('F6 subject-miss state=' + (subMiss.miss && subMiss.miss.state) + ' heads=' + JSON.stringify(subMiss.miss && subMiss.miss.available_head_shas));

  // --- F5: 缺库直调投影 ---
  try {
    await PJ.projectFileCard(join(tmpdir(), 'loop-NOPE.duckdb'), { repo: 'x', subject: 'y' });
    console.log('F5 no-throw (unexpected)');
  } catch (e) { console.log('F5 direct-throw: ' + String(e && e.message || e).slice(0, 110)); }
}
main().catch(e => { console.log('FATAL ' + e.stack); process.exit(1); });
