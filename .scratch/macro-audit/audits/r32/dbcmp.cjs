const {createRequire}=require('module');
const req=createRequire('D:/Aworker/6F/engine/package.json');
const duckdb=req('@duckdb/node-api');
(async()=>{
 for(const db of ['e2e-audit/facts.duckdb','fresh-facts.duckdb']){
  const inst=await duckdb.DuckDBInstance.create('D:/Aworker/6F/.scratch/macro-audit/audits/r32/'+db,{access_mode:'READ_ONLY'});
  const conn=await inst.connect();
  const r=await conn.run("SELECT metric, COUNT(*)::int c FROM audit_fact GROUP BY metric ORDER BY metric");
  const rows=await r.getRows();
  console.log('=== '+db+'  total='+rows.reduce((a,x)=>a+Number(x[1]),0));
  for(const row of rows)console.log('  '+row[0]+' = '+row[1]);
 }
})().catch(e=>{console.log('ERR '+e.message);process.exit(1);});