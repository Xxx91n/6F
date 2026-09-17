// 41b-check.mjs — #41b listing 资产核对留痕守卫（D-051/D-052/D-042 / A-060）
// 断言面：A 三 manifest 字段值 = D-052 拍板值 → B license=Apache-2.0 全链一致
//   → C capability 口径 = README 单一事实源（1-3 of 5 preview）→ D 诚实披露/闸门 → E 文档 → F BOM
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const AR = join(REPO, '.scratch', 'architecture-recovery');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
function json(p) { return JSON.parse(txt(p)); }

const pj = json(join(REPO, 'engine', 'plugin.json'));
const cc = json(join(REPO, 'engine', '.claude-plugin', 'plugin.json'));
const mk = json(join(REPO, '.claude-plugin', 'marketplace.json'));
const mcp = json(join(REPO, 'engine', '.mcp.json'));
const pk = json(join(REPO, 'engine', 'package.json'));

// ---------- A. D-052 字段值 ----------
t('A1 engine/plugin.json name=6f', pj.name === '6f');
t('A2 plugin.json author 三件 = D-052 值', pj.author && pj.author.name === 'Xxx91n' && pj.author.email === 'xxx91n@duck.com' && pj.author.url === 'https://github.com/Xxx91n');
t('A3 plugin.json homepage/repository = Xxx91n/6F', pj.homepage === 'https://github.com/Xxx91n/6F' && pj.repository === 'https://github.com/Xxx91n/6F');
t('A4 .claude-plugin/plugin.json name=6f + skills 路径形＋.mcp.json 自动发现位', cc.name === '6f' && Array.isArray(cc.skills) && cc.skills.includes('./skills/macro-audit') && mcp.mcpServers && mcp.mcpServers['macro-audit-kernel'] && mcp.mcpServers['macro-audit-kernel'].command === 'macro-audit');
t('A5 marketplace.json name=xxx91n + plugins[0].name=6f source=./engine strict', mk.name === 'xxx91n' && mk.plugins && mk.plugins[0] && mk.plugins[0].name === '6f' && mk.plugins[0].source === './engine' && mk.plugins[0].strict === true);
t('A6 marketplace owner = D-052 值', mk.owner && mk.owner.name === 'Xxx91n' && mk.owner.email === 'xxx91n@duck.com');
t('A7 插件名 6f 合法（2 字符小写字母数字首尾）', /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(pj.name) && pj.name.length >= 2);

// ---------- B. license=Apache-2.0 全链 ----------
const lic = txt(join(REPO, 'engine', 'LICENSE'));
t('B1 engine/LICENSE = Apache-2.0 全文（头/APPENDIX/尾）', lic.includes('Apache License') && lic.includes('Version 2.0, January 2004') && lic.includes('END OF TERMS AND CONDITIONS') && lic.includes('APPENDIX: How to apply the Apache License') && lic.trimEnd().endsWith('limitations under the License.'));
t('B2 plugin.json license=Apache-2.0', pj.license === 'Apache-2.0');
t('B3 cc-plugin.json license=Apache-2.0', cc.license === 'Apache-2.0');
t('B4 marketplace plugins[0].license=Apache-2.0', mk.plugins[0].license === 'Apache-2.0');
t('B5 package.json license=Apache-2.0', pk.license === 'Apache-2.0');

// ---------- C. capability 口径 = README 单一事实源 ----------
const rd = txt(join(REPO, 'README.md'));
const desc = txt(join(REPO, 'docs', 'listing', 'description.md'));
const cl = txt(join(REPO, 'docs', 'listing', 'credential-checklist.md'));
const readmeHas3 = rd.includes('capability 3 of 5');
t('C1 README 口径 = capability 1-3 of 5 preview', readmeHas3 && rd.includes('capability 1 of 5') && rd.includes('capability 2 of 5'));
t('C2 marketplace description 口径同步（3 of 5）', mk.plugins[0].description.includes('capability 3 of 5'));
t('C3 description.md 口径同步（1-3 of 5＋Micro-A preview 行）', desc.includes('capability 1-3 of 5') && desc.includes('Micro-A PR diff') && desc.includes('capability 3 of 5'));
t('C4 description.md license 段 = Apache-2.0（UNLICENSED 阻塞语已清）', desc.includes('`Apache-2.0`') && !desc.includes('UNLICENSED'));
t('C5 credential-checklist §E 口径同步', cl.includes('capability 1-3 of 5'));
t('C6 无残留 UNLICENSED/2 of 5 旧口径', !desc.includes('1-2 of 5') && !mk.plugins[0].description.includes('capability 2 of 5') && !cl.includes('1-2 of 5'));

// ---------- D. 诚实披露与闸门 ----------
t('D1 credential-checklist §C 用户专属动作未勾（提交=用户闸门）', /- \[ \] 6F 远端 push 授权确认/.test(cl) && /- \[ \] 若走路径 B：表单提交点击/.test(cl));
t('D2 description.md 含 defaultEnabled:false 建议与 preview 披露', desc.includes('defaultEnabled:false') && /Not yet in preview/.test(desc));
t('D3 字段查证文档在', existsSync(join(REPO, '.scratch', 'macro-audit', 'reports', '41b-marketplace-fields.md')));
t('D4 icon.svg 在', existsSync(join(REPO, 'docs', 'listing', 'icon.svg')));
t('D5 description.md 无截图伪造（截图挂门注记在）', desc.includes('不伪造') || desc.includes('真实 UI'));

// ---------- E. 文档 ----------
const led = txt(join(AR, 'decision-ledger.md'));
t('E1 A-060 行在且标 implemented', /\| A-060 \|[^\n]*implemented/.test(led));
t('E2 BACKLOG #41b 含本轮核对注记', /\| #41b[^\n]*核对留痕|#41b[^\n]*41b-check/.test(txt(join(AR, 'BACKLOG.md'))));
t('E3 票档三件套', ['issues/41b-listing-assets.md', 'prompts/41b-listing-assets.md', 'handoffs/41b-listing-assets.md'].every(function (f) { return existsSync(join(AR, f)); }));
t('E4 日报含 #41b', (existsSync(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-17-report.md')) ? txt(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-17-report.md')) : '').includes('#41b'));
t('E5 41b-report.md 在', existsSync(join(HERE, '41b-report.md')));
t('E6 WORKFLOW lessons 含 #41b', txt(join(AR, 'WORKFLOW.md')).includes('#41b'));

// ---------- F. BOM ----------
const allF = [join(REPO, 'engine', 'plugin.json'), join(REPO, 'engine', '.claude-plugin', 'plugin.json'), join(REPO, '.claude-plugin', 'marketplace.json'), join(REPO, 'docs', 'listing', 'description.md'), join(REPO, 'docs', 'listing', 'credential-checklist.md'), join(HERE, '41b-check.mjs'), join(HERE, '41b-report.md')];
t('F1 全部相关文件无 BOM', allF.every(function (f) { return !existsSync(f) || noBom(f); }));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
