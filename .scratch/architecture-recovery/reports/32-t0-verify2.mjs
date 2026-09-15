// R5 T0 票据包自检 v2 —— 必读清单路径可解析专项（「、」多路径切分 + 「（注记）」剥离）
// 用法：node 32-t0-verify2.mjs → 逐票 PASS/FAIL + TOTAL n/n；exit 0 = ALL-PASS
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const AR = join(here, '..');
const REPO = join(AR, '..', '..');
const NN=[32,33,34,35,36,37,38,39,40,41,42,43];
let pass=0,fail=0;
const t=(n,ok,x='')=>{console.log((ok?'PASS ':'FAIL ')+n+(x?' | '+x:''));ok?pass++:fail++;};
for(const n of NN){
  const slug=fs.readdirSync(AR+'/prompts').find(f=>f.startsWith(String(n)+'-'));
  const t0=fs.readFileSync(AR+'/prompts/'+slug,'utf8');
  const refs=[...t0.matchAll(/^ {2}- (.+)$/gm)].map(m=>m[1])
    .flatMap(s=>s.split('、'))
    .map(s=>s.split('（')[0].trim())
    .filter(s=>/\.(md|mjs|json|yml|ts)$/.test(s)&&!s.includes('*')&&!s.startsWith('reports/'+n));
  const missing=refs.filter(r=>![AR+'/'+r,AR+'/prompts/'+r,REPO+'/'+r].some(c=>fs.existsSync(c)));
  t(slug+' 路径可解析',missing.length===0,missing.join(' | '));
}
console.log('TOTAL '+pass+'/'+(pass+fail)+(fail===0?' ALL-PASS':' HAS-FAIL'));
process.exit(fail===0?0:1);
