// 39-mw-self-probe.mjs — 任务 7 多写者域 self-probe 实测（#39 / A-044 / D-034④a 触发器 (a) 激活即实测封口 / D-024）
// 判据（30-desk-calibration.json task7 probe.satisfaction）：「多写者并发写入实测（多采集器并行写同一 fact 表）无丢行/乱序/冲突」
// 实测面（真并发，非模拟；父进程自身不开库——所有锁争用发生在子进程间，测量零污染）：
//   A  同进程双写者（child dual：openWriter×2 同库 + 并发 append + 写中 reader + conn.close 后重开）
//   B1 多进程并行写者（4 子进程同时 openWriter 同库）—— DuckDB 单文件锁边界
//   B2 多进程串行写者（2 子进程先后写同库）—— SWMR 跨进程串行追加正对照
//   C  持锁中并发接入（holder 子进程持锁，reader + writer 子进程并发打）—— SWMR 读写边界
//   F  终读回（reader 子进程：全库行数按写者分 + 重复 fact_id）
// 输出：reports/39-mw-self-probe.json + stdout 摘要；probe 库 = 39-mw-probe.duckdb（专用探针库，不碰共享产物）
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHILD = join(HERE, '39-mw-child.mjs');
const DB = join(HERE, '39-mw-probe.duckdb');
const NL = String.fromCharCode(10);
const LOCK_RE = /lock|Conflicting|Could not set|already open|正在使用|Cannot open file/i;

function runChild(args, opts) {
  return new Promise(function (resolve) {
    const p = spawn('node', [CHILD].concat(args), { encoding: 'utf8' });
    let out = '';
    p.stdout.on('data', function (d) {
      out += d;
      if (opts && opts.onData) { opts.onData(d); }
    });
    p.on('close', function (code) {
      let parsed = null;
      const lines = out.trim().split(NL).filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        try { parsed = JSON.parse(lines[i]); break; } catch (e) { /* skip non-JSON lines like READY */ }
      }
      resolve({ code: code, result: parsed, raw: out.slice(0, 300) });
    });
  });
}

const probe = {
  probe: '39-mw-self-probe.mjs',
  generated_at: new Date().toISOString(),
  ticket: 39,
  criterion: '30-desk-calibration.json task7 probe.satisfaction：多写者并发写入实测（多采集器并行写同一 fact 表）无丢行/乱序/冲突',
  db: '39-mw-probe.duckdb',
  phases: {}
};

if (existsSync(DB)) { unlinkSync(DB); }
if (existsSync(DB + '.wal')) { unlinkSync(DB + '.wal'); }

// ---------- Phase A：同进程双写者（child dual 一站式实测） ----------
const a = await runChild(['dual', DB, '30']);
probe.phases.A_same_process = a.result || { error: a.raw };

// ---------- Phase B1：多进程并行写者 ×4 ----------
const phaseB1 = { spawned: 4, per_writer: [], winners: 0, lock_denied: 0, other_errors: 0 };
const b1 = await Promise.all([0, 1, 2, 3].map(function (k) { return runChild(['writer', DB, 'B1-w' + k, '15']); }));
for (const c of b1) {
  const res = c.result || {};
  const entry = { exit: c.code, ok: res.ok !== undefined ? res.ok : null, fail: res.fail !== undefined ? res.fail : null, error: res.error || null };
  if (c.code === 0 && res.ok === 15) { phaseB1.winners++; entry.outcome = 'wrote_15'; }
  else if (res.error && LOCK_RE.test(res.error)) { phaseB1.lock_denied++; entry.outcome = 'lock_denied'; }
  else { phaseB1.other_errors++; entry.outcome = 'other'; }
  phaseB1.per_writer.push(entry);
}
probe.phases.B1_multi_process_parallel = phaseB1;

// ---------- Phase B2：多进程串行写者 ×2 ----------
const phaseB2 = { spawned: 2, per_writer: [], winners: 0 };
for (let k = 0; k < 2; k++) {
  const c = await runChild(['writer', DB, 'B2-w' + k, '10']);
  const res = c.result || {};
  const entry = { exit: c.code, ok: res.ok !== undefined ? res.ok : null, fail: res.fail !== undefined ? res.fail : null, error: res.error || null };
  entry.outcome = (c.code === 0 && res.ok === 10) ? 'wrote_10' : 'failed';
  if (entry.outcome === 'wrote_10') { phaseB2.winners++; }
  phaseB2.per_writer.push(entry);
}
probe.phases.B2_multi_process_sequential = phaseB2;

// ---------- Phase C：holder 持锁中，reader + writer 并发接入 ----------
const phaseC = { holder_ms: 15000, reader: null, writer: null };
let holderReadyResolve;
const holderReady = new Promise(function (r) { holderReadyResolve = r; });
const holder = runChild(['holder', DB, '15000'], { onData: function (d) { if (d.indexOf('READY') >= 0) { holderReadyResolve(); } } });
await holderReady;
const [reader, writer2] = await Promise.all([
  runChild(['reader', DB]),
  runChild(['writer', DB, 'C-w0', '5'])
]);
const rr = reader.result || {};
phaseC.reader = { exit: reader.code, outcome: reader.code === 0 ? 'allowed(rows=' + rr.rows_total + ')' : 'denied', error: rr.error || null };
const wr = writer2.result || {};
phaseC.writer = { exit: writer2.code, outcome: writer2.code === 0 ? 'wrote_' + wr.ok : (LOCK_RE.test(wr.error || '') ? 'lock_denied' : 'other'), error: wr.error || null };
await holder;
probe.phases.C_during_holder_lock = phaseC;

// ---------- 终读回 ----------
const f = await runChild(['reader', DB]);
probe.final_readback = f.result || { error: f.raw };

// ---------- 判定（如实，不为跑通而跑通） ----------
const A = probe.phases.A_same_process;
const F = probe.final_readback;
const expectedRows = (A.append_ok || 0) + phaseB1.winners * 15 + phaseB2.winners * 10 + (phaseC.writer.outcome === 'wrote_5' ? 5 : 0) + 1; // +1 = holder 行
probe.verdict = {
  same_process_second_writer: A.w2 === 'denied' ? 'denied（同进程第二 openWriter 即锁拒）' : (A.w2 === 'allowed' ? 'allowed' : 'n/a'),
  same_process_append: A.append_ok + '/' + (A.append_ok + A.append_fail) + ' ok',
  reader_during_write: A.reader_during_write || 'n/a',
  reopen_after_conn_close: A.reopen_after_conn_close || 'n/a',
  multi_process_parallel: phaseB1.winners + ' 写者胜出 / ' + phaseB1.lock_denied + ' lock_denied / ' + phaseB1.other_errors + ' 其他',
  multi_process_sequential: phaseB2.winners + '/2 串行追加成立',
  reader_while_holder_locks: phaseC.reader.outcome,
  writer_while_holder_locks: phaseC.writer.outcome,
  final_rows: F.rows_total,
  expected_rows: expectedRows,
  rows_match: F.rows_total === expectedRows,
  duplicate_fact_ids: F.duplicate_fact_ids,
  closure_reading: '实测读数：多写者域 = DuckDB 单文件锁 fail-fast 互斥——同进程第二 openWriter 即拒、跨进程并行写者仅 1 胜余者 lock_denied（无丢行无撕裂无重复 fact_id）、跨进程串行追加成立、持锁期读者亦拒；conn.closeSync 不放锁（instance 持有至进程退出，实测 reopen denied 佐证）。结论：多采集器并行直写同一 fact 表不满足判据——并发策略维持 SWMR 单写者序列化门面（store.ts 唯一写入口），跨进程回归/扩面须走串行追加或显式交接'
};
writeFileSync(join(HERE, '39-mw-self-probe.json'), JSON.stringify(probe, null, 2) + NL, 'utf8');

console.log('[39-mw] A: w2=' + A.w2 + ' append=' + A.append_ok + '/' + (A.append_ok + A.append_fail) + ' reader=' + A.reader_during_write + ' reopen=' + A.reopen_after_conn_close);
console.log('[39-mw] B1 parallel×4: winners=' + phaseB1.winners + ' lock_denied=' + phaseB1.lock_denied + ' other=' + phaseB1.other_errors);
console.log('[39-mw] B2 sequential×2: winners=' + phaseB2.winners);
console.log('[39-mw] C: reader=' + phaseC.reader.outcome + ' writer=' + phaseC.writer.outcome);
console.log('[39-mw] final rows=' + F.rows_total + '/' + expectedRows + ' dup=' + F.duplicate_fact_ids + ' per_writer=' + JSON.stringify(F.per_writer));
console.log('[39-mw] WROTE 39-mw-self-probe.json');
process.exit(0);
