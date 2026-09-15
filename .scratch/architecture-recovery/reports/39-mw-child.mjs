// 39-mw-child.mjs — 多写者 self-probe 子进程执行体（#39 / A-044 / D-034④a / 任务7 多写者域）
// 用法：
//   node 39-mw-child.mjs writer <db> <wid> <count>  → 写者：openWriter + appendFact×count + CHECKPOINT（子进程退出即放锁）
//   node 39-mw-child.mjs reader <db>                → 读者：openReader + 全库行数/按写者分/重复 fact_id
//   node 39-mw-child.mjs dual <db> <count>          → 同进程探针：第二写者接入、连接关闭后再开、读者接入、并发追加
//   node 39-mw-child.mjs holder <db> <ms>           → 持锁者：openWriter 持锁 ms 毫秒（stdout READY 后父进程打并发）
// 输出：单行 JSON——父进程 spawn 收集；exit 0 正常完成（denied 是数据不是失败），exit 3 = 非预期错误。
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', '..', '..', 'engine', 'dist');
const STORE = await import(pathToFileURL(join(DIST, 'fact', 'store.js')).href);
const C = await import(pathToFileURL(join(DIST, 'collect', 'collectors.js')).href);

const [mode, db, a1, a2] = process.argv.slice(2);
const out = { mode: mode };
const sleep = (ms) => new Promise(function (r) { setTimeout(r, ms); });

function mkFact(wid, i) {
  return {
    fact_id: C.uuidFromHex(C.sha256Hex('mw|' + wid + '|' + i)),
    trace_id: C.sha256Hex('t|' + wid).slice(0, 32),
    baggage_id: C.sha256Hex('b|' + wid).slice(0, 32),
    scale: 'Macro-B',
    quadrant: 'strategic',
    dimension: null,
    collector_id: 'mw-self-probe@v1',
    repo_ref: 'mw-probe@' + wid,
    subject_ref: 'mw://' + wid + '/' + i,
    evidence_ref: 'mw://probe',
    metric: 'mw.probe_row',
    value_json: JSON.stringify({ writer: wid, seq: i }),
    observed_at: '2026-09-16T00:00:00+00:00'
  };
}
const errText = (e) => String(e && e.message ? e.message : e).replace(/[\r\n]+/g, ' | ').slice(0, 300);

try {
  if (mode === 'writer') {
    const w = await STORE.openWriter(db);
    let ok = 0, fail = 0;
    const errs = [];
    for (let i = 0; i < Number(a2); i++) {
      try { await STORE.appendFact(w, mkFact(a1, i)); ok++; }
      catch (e) { fail++; if (errs.length < 3) { errs.push(errText(e)); } }
    }
    await w.run('FORCE CHECKPOINT');
    w.closeSync();
    out.wid = a1; out.ok = ok; out.fail = fail; out.errors = errs;
    console.log(JSON.stringify(out));
    process.exit(0);
  }

  if (mode === 'reader') {
    const r = await STORE.openReader(db);
    const rows = await (await STORE.queryFacts(r, 'SELECT repo_ref, COUNT(*) AS n FROM audit_fact GROUP BY repo_ref ORDER BY repo_ref')).getRows();
    const dup = await (await STORE.queryFacts(r, 'SELECT COUNT(*) - COUNT(DISTINCT fact_id) AS d FROM audit_fact')).getRows();
    r.closeSync();
    out.rows_total = 0;
    out.per_writer = {};
    for (const row of rows) { out.per_writer[String(row[0])] = Number(row[1]); out.rows_total += Number(row[1]); }
    out.duplicate_fact_ids = Number(dup[0][0]);
    console.log(JSON.stringify(out));
    process.exit(0);
  }

  if (mode === 'dual') {
    // 同进程实测面：① 第二 openWriter 并发接入 ② conn 级并发 append ③ 写者持有期 reader 接入 ④ conn.closeSync 后重开（instance 保留测试）
    const N = Number(a1);
    out.w1 = 'open';
    const w1 = await STORE.openWriter(db);
    try {
      const w2 = await STORE.openWriter(db);
      out.w2 = 'allowed';
      w2.closeSync();
    } catch (e) {
      out.w2 = 'denied';
      out.w2_error = errText(e);
    }
    // 并发 append（单连接序列——第二连接已被拒，只能测单写者并发任务）
    const tasks = [];
    for (let i = 0; i < N; i++) { tasks.push(STORE.appendFact(w1, mkFact('dual', i))); }
    const settled = await Promise.allSettled(tasks);
    out.append_ok = settled.filter(function (s) { return s.status === 'fulfilled'; }).length;
    out.append_fail = settled.filter(function (s) { return s.status === 'rejected'; }).length;
    out.append_errors = settled.filter(function (s) { return s.status === 'rejected'; }).slice(0, 3).map(function (s) { return errText(s.reason); });
    // 写者持有期 reader
    try {
      const rd = await STORE.openReader(db);
      rd.closeSync();
      out.reader_during_write = 'allowed';
    } catch (e) {
      out.reader_during_write = 'denied';
      out.reader_error = errText(e);
    }
    await w1.run('FORCE CHECKPOINT');
    w1.closeSync();
    // conn.closeSync 后重开——instance 是否仍持锁
    try {
      const w3 = await STORE.openWriter(db);
      out.reopen_after_conn_close = 'allowed';
      w3.closeSync();
    } catch (e) {
      out.reopen_after_conn_close = 'denied';
      out.reopen_error = errText(e);
    }
    console.log(JSON.stringify(out));
    process.exit(0);
  }

  if (mode === 'holder') {
    const w = await STORE.openWriter(db);
    await STORE.appendFact(w, mkFact('holder', 0));
    console.log('READY');
    await sleep(Number(a1));
    await w.run('FORCE CHECKPOINT');
    w.closeSync();
    process.exit(0);
  }

  console.log(JSON.stringify({ mode: mode, error: 'unknown mode' }));
  process.exit(2);
} catch (e) {
  out.error = errText(e);
  console.log(JSON.stringify(out));
  process.exit(3);
}
