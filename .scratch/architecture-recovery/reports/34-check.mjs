// #34 常驻守卫 —— plugin.json Agent Plugins 1.0.0 结构断言（零依赖；ajv 一次性校验留证见 34-report.md）
// 断言面：$schema const / required 字段 / additionalProperties 白名单 / name pattern / extensions 反向域名对象图 / gen 产物一致性
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(here, '..', '..', '..', 'engine');
const AP_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const AP_ALLOWED_KEYS = Object.keys(JSON.parse(fs.readFileSync(join(here, '34-plugin.schema.json'), 'utf8')).properties);

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

const pj = JSON.parse(fs.readFileSync(join(ENGINE, 'plugin.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(join(ENGINE, 'manifest.meta.json'), 'utf8'));
const p2 = JSON.parse(fs.readFileSync(join(ENGINE, '.claude-plugin', 'plugin.json'), 'utf8'));

t('G1 $schema===1.0.0 const', pj['$schema'] === AP_SCHEMA);
t('G2 required: $schema+name 在位', !!pj['$schema'] && typeof pj.name === 'string' && pj.name.length > 0);
t('G3 additionalProperties 白名单（无越界属性）', Object.keys(pj).every(k => AP_ALLOWED_KEYS.includes(k)), 'keys=' + Object.keys(pj).join(','));
t('G4 name 符合 pattern（小写域名段、无 -- / ..）', /^(?!.*(--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(pj.name) && pj.name.length <= 64);
t('G5 extensions 为对象图非数组', pj.extensions && typeof pj.extensions === 'object' && !Array.isArray(pj.extensions));
t('G6 extensions 键为反向域名命名空间（含 . 小写）', Object.keys(pj.extensions).every(k => /^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(k)), Object.keys(pj.extensions).join(','));
t('G7 extensions 值为对象', Object.values(pj.extensions).every(v => v && typeof v === 'object' && !Array.isArray(v)));
t('G8 已移除旧越界字段（schemaVersion/skills/mcp 不在标准 manifest）', !('schemaVersion' in pj) && !('skills' in pj) && !('mcp' in pj));
t('G9 claude 侧 manifest 不回归（skills 路径形+mcpServers 指 ./mcp.json）', Array.isArray(p2.skills) && p2.skills.every(s => typeof s === 'string' && s.startsWith('./skills/')) && p2.mcpServers === './mcp.json');
t('G10 版本三方一致', pj.version === p2.version && p2.version === meta.version);

// G11: gen 重跑产物幂等——幂等断言故意实跑生成器，检出漂移即恢复三产物原件（守卫不在被检树留改写）
const WATCH = ['plugin.json', '.claude-plugin/plugin.json', 'mcp.json'];
const snapshots = WATCH.map(f => fs.readFileSync(join(ENGINE, f)));
try {
  execSync('node scripts/gen-manifests.mjs', { cwd: ENGINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const drifted = WATCH.filter((f, i) => !fs.readFileSync(join(ENGINE, f)).equals(snapshots[i]));
  if (drifted.length) WATCH.forEach((f, i) => fs.writeFileSync(join(ENGINE, f), snapshots[i]));
  t('G11 gen 重跑幂等（产物与生成器一致）', drifted.length === 0, drifted.join(',') + (drifted.length ? '（已恢复原样）' : ''));
} catch (e) {
  WATCH.forEach((f, i) => fs.writeFileSync(join(ENGINE, f), snapshots[i]));
  t('G11 gen 重跑幂等', false, String(e).slice(0, 120));
}

console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
