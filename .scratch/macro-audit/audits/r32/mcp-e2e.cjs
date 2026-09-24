
const {spawn}=require('child_process');
const DB=process.env.DB;
const p=spawn('node',['dist/cli.js','mcp'],{cwd:'D:/Aworker/6F/engine'});
let buf='';const replies={};
p.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(!line)continue;try{const j=JSON.parse(line);if(j.id!==undefined)replies[j.id]=j;}catch(e){}}});
p.stderr.on('data',d=>{});
const send=o=>p.stdin.write(JSON.stringify(o)+'\n');
const wait=id=>new Promise(res=>{const t=setInterval(()=>{if(replies[id]){clearInterval(t);res(replies[id]);}},50);setTimeout(()=>{clearInterval(t);res({timeout:true});},30000);});
const summarize=(id,r)=>{
  if(r.timeout)return 'TIMEOUT';
  const c=r.result&&r.result.content;
  const txt=c&&c[0]&&c[0].text;
  if(!txt)return JSON.stringify(r).slice(0,500);
  try{const j=JSON.parse(txt);
    if(j.card){const k=j.card;return JSON.stringify({card_type:k.card_type,advisory:k.advisory,failure_state:k.failure_state,miss:k.miss,source:k.source,staleness:k.staleness,observation:k.observation,derived_rules:k.derived&&k.derived.rule_version,cli_guidance:j.cli_guidance||k.cli_guidance},null,0);}
    return JSON.stringify(j).slice(0,900);
  }catch(e){return txt.slice(0,900);}
};
(async()=>{
  send({jsonrpc:'2.0',id:0,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'aud',version:'0'}}});
  const init=await wait(0);console.log('INIT ok: '+!!(init&&init.result));
  send({jsonrpc:'2.0',method:'notifications/initialized'});
  send({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'file_card',arguments:{repo:'6F',path:'engine/src/cli.ts',db:DB,repo_path:'D:/Aworker/6F'}}});
  send({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'file_card',arguments:{repo:'6F',path:'no/such/file.ts',db:DB}}});
  send({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'file_card',arguments:{repo:'6F',path:'engine/src/fact/file-card.ts',db:DB,at:'44cc2a4'}}});
  for(const id of [1,2,3]){const r=await wait(id);console.log('=== id='+id+' ===\n'+summarize(id,r));}
  p.kill();process.exit(0);
})().catch(e=>{console.log('ERR '+e.message);p.kill();process.exit(1);});
