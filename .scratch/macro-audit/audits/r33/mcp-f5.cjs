const {spawn}=require('child_process');
const p=spawn('node',['dist/cli.js','mcp'],{cwd:'D:/Aworker/6F/engine'});
let buf='';const replies={};
p.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(!line)continue;try{const j=JSON.parse(line);if(j.id!==undefined)replies[j.id]=j;}catch(e){}}});
p.stderr.on('data',d=>{});
const send=o=>p.stdin.write(JSON.stringify(o)+'\n');
const wait=id=>new Promise(res=>{const t=setInterval(()=>{if(replies[id]){clearInterval(t);res(replies[id]);}},50);setTimeout(()=>{clearInterval(t);res({timeout:true});},30000);});
(async()=>{
  send({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'r33aud',version:'0'}}});
  const init=await wait(1);console.log('INIT ok: '+!!(init&&init.result));
  send({jsonrpc:'2.0',method:'notifications/initialized'});
  send({jsonrpc:'2.0',id:2,method:'tools/list',params:{}});
  const tl=await wait(2);
  const names=(tl.result&&tl.result.tools||[]).map(t=>t.name);
  console.log('TOOLS: '+JSON.stringify(names));
  send({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'file_card',arguments:{repo:'6F',path:'engine/src/cli.ts',db:'D:/Aworker/6F/.scratch/macro-audit/audits/r33/NO-SUCH-DB.duckdb',repo_path:'D:/Aworker/6F'}}});
  const r3=await wait(3);
  console.log('F5 isError='+JSON.stringify(r3.result&&r3.result.isError));
  const txt=r3.result&&r3.result.content&&r3.result.content[0]&&r3.result.content[0].text;
  try{const j=JSON.parse(txt);const k=j.card||j;console.log('F5 card: '+JSON.stringify({card_type:k.card_type,miss:k.miss,cli_guidance:j.cli_guidance||k.cli_guidance}).slice(0,900));}catch(e){console.log('F5 raw: '+String(txt).slice(0,600));}
  p.kill();process.exit(0);
})().catch(e=>{console.log('ERR '+e.message);p.kill();process.exit(1);});
