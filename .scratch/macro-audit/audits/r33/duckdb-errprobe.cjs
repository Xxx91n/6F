// R33 审计窗独立复核：D-134④ DuckDB 错误对象实物形态钉（@duckdb/node-api 真物）
const { DuckDBInstance, DuckDBConnection } = require('D:/Aworker/6F/engine/node_modules/@duckdb/node-api');
(async () => {
  const inst = await DuckDBInstance.create(':memory:');
  const c = await DuckDBConnection.create(inst);
  await c.run('CREATE TABLE af (fact_id VARCHAR UNIQUE, n INTEGER NOT NULL, t VARCHAR CHECK (length(t)>1))');
  await c.run("INSERT INTO af VALUES ('f1',1,'ok')");
  const probe = async (label, sql) => {
    try { await c.run(sql); console.log(label + ': NO-ERROR(意外)'); }
    catch (e) { console.log(label + ': ownKeys=' + JSON.stringify(Object.getOwnPropertyNames(e)) + ' msg=' + JSON.stringify(e.message)); }
  };
  await probe('dup-unique', "INSERT INTO af VALUES ('f1',2,'ok')");
  await probe('notnull', "INSERT INTO af VALUES ('f2',NULL,'ok')");
  await probe('check', "INSERT INTO af VALUES ('f3',3,'x')");
  await c.run('CREATE TABLE pk (id INTEGER PRIMARY KEY)');
  await c.run('INSERT INTO pk VALUES (1)');
  await probe('dup-pk', 'INSERT INTO pk VALUES (1)');
  // isFactIdUniqueViolation 判据三路核对（与 store.ts 同形三件套）
  const isFactIdUniqueViolation = e => { const m = String((e && e.message) || e || ''); return m.indexOf('Constraint Error') >= 0 && m.indexOf('unique constraint') >= 0 && m.indexOf('"' + 'fact_id:') >= 0; };
  try { await c.run("INSERT INTO af VALUES ('f1',9,'ok')"); } catch (e) { console.log('判定: dup fact_id → isFactIdUniqueViolation=' + isFactIdUniqueViolation(e)); }
  try { await c.run("INSERT INTO af VALUES ('f9',NULL,'ok')"); } catch (e) { console.log('判定: NOT NULL → isFactIdUniqueViolation=' + isFactIdUniqueViolation(e)); }
  try { await c.run('INSERT INTO pk VALUES (1)'); } catch (e) { console.log('判定: dup PK → isFactIdUniqueViolation=' + isFactIdUniqueViolation(e)); }
  try { c.closeSync(); inst.closeSync(); } catch (_) {}
})().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
