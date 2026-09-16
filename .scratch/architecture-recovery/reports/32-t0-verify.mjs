// R5 T0 票据包自检 v2 —— 票 #32~#43 三件套齐备 + 启动器硬规则（≤60行/黑体块/违禁词/报告路径）+ 必读清单路径可解析
// v2 修复：slug 选取排除 -ext- 子项票（33-ext-* 字母序先于 33-g*，前缀相撞抓错票），33-ext 票独立同口径正向校验
// 用法：node 32-t0-verify.mjs → 逐项 PASS/FAIL + TOTAL n/n；exit 0 = ALL-PASS
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const AR = join(here, '..');
const REPO = join(AR, '..', '..');
const NN = [32,33,34,35,36,37,38,39,40,41,42,43];
const BLOCK = '**❗ 收尾硬要求——以下动作缺任一项 = 本票未闭环（W2/W3 V2 重演防线）**';
const FORBIDDEN = [/worktree/i, /git checkout/i, /git branch/i];
let pass = 0, fail = 0;
const t = (name, ok, extra='') => { console.log((ok?'PASS ':'FAIL ')+name+(extra?' | '+extra:'')); ok?pass++:fail++; };
// slug 口径统一：主票取 n-* 且排除 n-ext-* 子项票；ext=true 专取子项票（三件套 prompts/issues/handoffs 同一口径）
const findSlug = (dir, n, ext) => fs.readdirSync(AR+'/'+dir).find(f =>
  f.startsWith(String(n)+'-') && (ext ? f.startsWith(n+'-ext-') : !f.startsWith(n+'-ext-')));
function checkTicket(n, ext, reportMd) {
  const slug = findSlug('prompts', n, ext);
  const pf = AR+'/prompts/'+slug;
  const t0 = fs.readFileSync(pf,'utf8');
  const lc = t0.split('\n').length;
  t(slug+' ≤60行', lc<=60, lc+' lines');
  t(slug+' 黑体块逐字', t0.includes(BLOCK));
  t(slug+' 无违禁词', !FORBIDDEN.some(r=>r.test(t0)));
  t(slug+' 收尾报告路径', t0.includes(reportMd));
  const issueSlug = findSlug('issues', n, ext);
  const hoSlug = findSlug('handoffs', n, ext);
  t(slug+' 三件套齐备', !!issueSlug && !!hoSlug && issueSlug.slice(0,String(n).length)===String(n));
  const it = fs.readFileSync(AR+'/issues/'+issueSlug,'utf8');
  const ht = fs.readFileSync(AR+'/handoffs/'+hoSlug,'utf8');
  t(slug+' issue三要素', it.includes('A-xxx covered')&&it.includes('Spec ref')&&it.includes('Blocked by'));
  t(slug+' handoff两要素', ht.includes('完成定义')&&(n===32||ht.includes('通用调研要求')));
  // resolvable paths in 必读清单: 行内多路径以「、」分隔、「（…）」为注记——先切分再逐条核对存在性
  const refs = [...t0.matchAll(/^ {2}- (.+)$/gm)].map(m=>m[1])
    .flatMap(s=>s.split('、'))
    .map(s=>s.split('（')[0].trim())
    .filter(s=>/\.(md|mjs|json|yml|ts)$/.test(s)&&!s.includes('*')&&!s.startsWith('reports/'+n));
  const missing = refs.filter(r=>{ const cands=[AR+'/'+r, AR+'/prompts/'+r, REPO+'/'+r];
    return !cands.some(c=>fs.existsSync(c)); });
  t(slug+' 路径可解析', missing.length===0, missing.join(' | '));
}
for (const n of NN) checkTicket(n, false, 'reports/'+n+'-report.md');
// 33-ext 子项票（A-053）同口径正向校验——slug 带 -ext- 前缀、报告落盘名 reports/33ext-report.md
checkTicket(33, true, 'reports/33ext-report.md');
// ledger + spec coverage
const lg = fs.readFileSync(AR+'/decision-ledger.md','utf8');
t('ledger A-037~A-048 全登记', [37,38,39,40,41,42,43,44,45,46,47,48].every(i=>lg.includes('| A-0'+i+' |')));
const sp = fs.readFileSync(AR+'/spec.md','utf8');
t('spec R5-D1~D12 全覆盖', [1,2,3,4,5,6,7,8,9,10,11,12].every(i=>sp.includes('R5-D'+i+' ')));
const rm = fs.readFileSync(AR+'/README.md','utf8');
t('README 波次表 W12~W15 + 触发器行', rm.includes('W12')&&rm.includes('W15')&&rm.includes('触发器拉动项'));
console.log('TOTAL '+pass+'/'+ (pass+fail) + (fail===0?' ALL-PASS':' HAS-FAIL'));
process.exit(fail===0?0:1);
