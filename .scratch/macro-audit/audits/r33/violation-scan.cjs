const { DuckDBInstance, DuckDBConnection } = require('D:/Aworker/6F/engine/node_modules/@duckdb/node-api');
(async()=>{
for(const p of ['D:/Aworker/6F/.scratch/macro-audit/audits/r32/e2e-audit/facts.duckdb','D:/Aworker/6F/.scratch/macro-audit/audits/r32/dirty-facts.duckdb']){
  try{
    const inst=await DuckDBInstance.create(p,{access_mode:'READ_ONLY'});
    const c=await DuckDBConnection.create(inst);
    const q=async s=>{const r=await c.run(s);return (await r.getRows());};
    const total=await q('SELECT COUNT(*) FROM audit_fact');
    const dup=await q('SELECT COUNT(*) FROM (SELECT fact_id FROM audit_fact GROUP BY fact_id HAVING COUNT(*)>1)');
    const dseq=await q('SELECT COUNT(*) FROM (SELECT fact_seq FROM audit_fact GROUP BY fact_seq HAVING COUNT(*)>1)');
    const nn=await q('SELECT COUNT(*) FROM audit_fact WHERE fact_id IS NULL OR fact_seq IS NULL');
    const gaps=await q('SELECT COUNT(*) FROM (SELECT fact_seq, LAG(fact_seq) OVER (ORDER BY fact_seq) prev FROM audit_fact) WHERE prev IS NOT NULL AND fact_seq<>prev+1');
    console.log(p.split('/').slice(-2).join('/')+': total='+total[0][0]+' fact_id_dup='+dup[0][0]+' fact_seq_dup='+dseq[0][0]+' notnull_viol='+nn[0][0]+' seq_gaps='+gaps[0][0]);
    try{c.closeSync();inst.closeSync();}catch(_){}
  }catch(e){console.log(p+': ERR '+e.message);}
}})();