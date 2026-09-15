// #34 常驻守卫 —— plugin.json Agent Plugins 1.0.0 结构断言（零依赖；ajv 一次性校验留证见 34-report.md）
// 断言面：$schema const / required 字段 / additionalProperties 白名单 / name pattern / extensions 反向域名对象图 / gen 产物一致性
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(here, '..', '..', '..', 'engine');
const AP_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const ALLOWED = ['$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions'];

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

const pj = JSON.parse(fs.readFileSync(join(ENGINE, 'plugin.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(join(ENGINE, 'manifest.meta.json'), 'utf8'));
const p2 = JSON.parse(fs.readFileSync(join(ENGINE, '.claude-plugin', 'plugin.json'), 'utf8'));

t('G1 $schema===1.0.0 const', pj['$schema'] === AP_SCHEMA);
t('G2 required: $schema+name 在位', !!pj['$schema'] && typeof pj.name === 'string' && pj.name.length > 0);
t('G3 additionalProperties 白名单（无越界属性）', Object.keys(pj).every(k => ALLOWED.includes(k)), 'keys=' + Object.keys(pj).join(','));
t('G4 name 符合 pattern（小写域名段、无 -- / ..）', /^(?!.*(--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(pj.name) && pj.name.length <= 64);
t('G5 extensions 为对象图非数组', pj.extensions && typeof pj.extensions === 'object' && !Array.isArray(pj.extensions));
t('G6 extensions 键为反向域名命名空间（含 . 小写）', Object.keys(pj.extensions).every(k => /^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(k)), Object.keys(pj.extensions).join(','));
t('G7 extensions 值为对象', Object.values(pj.extensions).every(v => v && typeof v === 'object' && !Array.isArray(v)));
t('G8 已移除旧越界字段（schemaVersion/skills/mcp 不在标准 manifest）', !('schemaVersion' in pj) && !('skills' in pj) && !('mcp' in pj));
t('G9 claude 侧 manifest 不回归（skills+mcp 仍在 .claude-plugin）', Array.isArray(p2.skills) && p2.mcp === 'mcp.json');
t('G10 版本三方一致', pj.version === p2.version && p2.version === meta.version);

// G11: gen 重跑产物幂等（生成器是元数据源——重跑后 plugin.json 仍合规且不漂移）
const before = fs.readFileSync(join(ENGINE, 'plugin.json'), 'utf8');
try {
  execSync('node scripts/gen-manifests.mjs', { cwd: ENGINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const after = fs.readFileSync(join(ENGINE, 'plugin.json'), 'utf8');
  t('G11 gen 重跑幂等（产物与生成器一致）', before === after);
} catch (e) { t('G11 gen 重跑幂等', false, String(e).slice(0, 120)); }

console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
