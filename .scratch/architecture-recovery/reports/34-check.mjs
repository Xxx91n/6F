// #34 常驻守卫 —— plugin.json Agent Plugins 1.0.0 结构断言（零依赖；ajv 一次性校验留证见 34-report.md）
// 断言面：$schema const / required 字段 / additionalProperties 白名单 / name pattern / extensions 反向域名对象图 / gen 产物一致性
import fs from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(here, '..', '..', '..', 'engine');
const AP_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const AP_ALLOWED_KEYS = Object.keys(JSON.parse(fs.readFileSync(join(here, '34-plugin.schema.json'), 'utf8')).properties);

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };

// #58/D-066 advisory probe（前置执行：连续 SKIP 升格顶显＋末尾 ADV 块复用结果；advisory 不红非 FAIL 面）
const _cv = spawnSync('claude --version', { shell: true, encoding: 'utf8', timeout: 30000 });
const _claudeVer = !_cv.error && _cv.status === 0 ? (_cv.stdout || '').trim().split(' ')[0] : null;
const _vr = spawnSync(process.execPath, [join('scripts', 'validate-plugin.mjs')], { cwd: ENGINE, encoding: 'utf8', timeout: 150000 });
const _vlines = ((_vr.stdout || '') + (_vr.stderr || '')).split('\n').filter(l => l.trim().length > 0);
const _vstreakAlert = _vlines.some(l => l.indexOf('SKIP-STREAK-ALERT') >= 0);
if (_vstreakAlert) console.log('⚠ SKIP-STREAK-ALERT: claude-validate 连续 cli-absent——advisory 面能见度归零（D-066③ 升格顶显）');

const pj = JSON.parse(fs.readFileSync(join(ENGINE, 'plugin.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(join(ENGINE, 'manifest.meta.json'), 'utf8'));
const p2 = JSON.parse(fs.readFileSync(join(ENGINE, '.claude-plugin', 'plugin.json'), 'utf8'));
const m2 = JSON.parse(fs.readFileSync(join(ENGINE, '.mcp.json'), 'utf8'));

t('G1 $schema===1.0.0 const', pj['$schema'] === AP_SCHEMA);
t('G2 required: $schema+name 在位', !!pj['$schema'] && typeof pj.name === 'string' && pj.name.length > 0);
t('G3 additionalProperties 白名单（无越界属性）', Object.keys(pj).every(k => AP_ALLOWED_KEYS.includes(k)), 'keys=' + Object.keys(pj).join(','));
t('G4 name 符合 pattern（小写域名段、无 -- / ..）', /^(?!.*(--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(pj.name) && pj.name.length <= 64);
t('G5 extensions 为对象图非数组', pj.extensions && typeof pj.extensions === 'object' && !Array.isArray(pj.extensions));
t('G6 extensions 键为反向域名命名空间（含 . 小写）', Object.keys(pj.extensions).every(k => /^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(k)), Object.keys(pj.extensions).join(','));
t('G7 extensions 值为对象', Object.values(pj.extensions).every(v => v && typeof v === 'object' && !Array.isArray(v)));
t('G8 已移除旧越界字段（schemaVersion/skills/mcp 不在标准 manifest）', !('schemaVersion' in pj) && !('skills' in pj) && !('mcp' in pj));
const srv = m2.mcpServers && m2.mcpServers['macro-audit-kernel'];
t('G9 claude 侧 manifest 不回归（skills 路径形+.mcp.json 自动发现位=node+${CLAUDE_PLUGIN_ROOT} 自包含）', Array.isArray(p2.skills) && p2.skills.every(s => typeof s === 'string' && s.startsWith('./skills/')) && srv && srv.command === 'node' && Array.isArray(srv.args) && srv.args[0] === '${CLAUDE_PLUGIN_ROOT}/dist/cli.js' && srv.args[1] === 'mcp');
t('G10 版本三方一致', pj.version === p2.version && p2.version === meta.version);

// G11: gen 重跑产物幂等——幂等断言故意实跑生成器，检出漂移即恢复三产物原件（守卫不在被检树留改写）
const WATCH = ['plugin.json', '.claude-plugin/plugin.json', '.mcp.json'];
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

// G12~G14: #59/D-067 kernel 自包含分发面——command 禁裸名 PATH 反模式钉死＋dist 可运行体随源进仓
t('G12 .mcp.json command 禁裸名（node 或含 ${CLAUDE_PLUGIN_ROOT}——官方排错表反模式钉死）', srv && (srv.command === 'node' || (typeof srv.command === 'string' && srv.command.indexOf('${CLAUDE_PLUGIN_ROOT}') >= 0)));
const distCliPath = join(ENGINE, 'dist', 'cli.js');
const distSrc = fs.existsSync(distCliPath) ? fs.readFileSync(distCliPath, 'utf8') : '';
t('G13 dist/cli.js 在且自包含 bundle（无相对模块 import——git-clone 可运行体随源进仓）', distSrc.length > 0 && !/from\s+['"]\.{1,2}\/|require\(\s*['"]\.{1,2}\//.test(distSrc) && distSrc.startsWith('#!'));
t('G14 engine/.gitignore 放开 dist/（dist 入库前置）', !/^dist\/?\s*$/m.test(fs.readFileSync(join(ENGINE, '.gitignore'), 'utf8')));


// ---------- #58 / D-066 manifest 契约链扩 ----------
// shape 钉 enforce：skills ^\./ 裸名 fail／mcp 裸字段 fail／单一 .mcp.json＋无兄弟 mcp.json 同位遮蔽（cursor#252）；
// unknown-field=WARN（SchemaStore 滞后容忍勿照搬 fatal）；advisory=`claude plugin validate --strict`（WARN 不红＋SKIP 硬化）
let warn58 = 0;
const w58 = (name, ok, extra) => { console.log((ok ? 'PASS ' : 'WARN ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : warn58++; };

const SCHEMA58 = JSON.parse(fs.readFileSync(join(here, '58-claude-code-plugin-manifest.schema.json'), 'utf8'));
const WL58 = Object.keys(SCHEMA58.properties || {}).concat(['$schema']);
const ccKeys = Object.keys(p2);
const ccUnknown = ccKeys.filter(k => WL58.indexOf(k) < 0);
const skillPath = s => typeof s === 'string' && s.indexOf('./') === 0;

t('G15 两份 plugin.json skills 值 ^\./ 路径形（裸名 fail——事故①钉死）',
  (!('skills' in pj) || (Array.isArray(pj.skills) && pj.skills.every(skillPath)))
  && Array.isArray(p2.skills) && p2.skills.every(skillPath),
  'cc.skills=' + JSON.stringify(p2.skills));

t('G16a SchemaStore 快照本体合法（title＋properties 非空——进仓快照，禁运行时拉取）',
  !!SCHEMA58.title && Object.keys(SCHEMA58.properties || {}).length > 0, 'title=' + SCHEMA58.title);
t('G16b claude manifest 无 mcp 裸字段（事故②钉死——FAIL）', ccKeys.indexOf('mcp') < 0, 'keys=' + ccKeys.join(','));
w58('G16c claude manifest 顶层字段白名单＝SchemaStore props∪$schema（unknown-field=WARN 勿照搬 fatal）',
  ccUnknown.length === 0, 'unknown=' + ccUnknown.join(','));

t('G17 单一 .mcp.json 自动发现位＋无兄弟 mcp.json 同位遮蔽（cursor#252 教训/事故③根因——兄弟文件已退役）',
  fs.existsSync(join(ENGINE, '.mcp.json')) && !fs.existsSync(join(ENGINE, 'mcp.json')));

const LOCK58 = fs.readFileSync(join(ENGINE, 'upstream-lock.yaml'), 'utf8');
const snapSha58 = crypto.createHash('sha256').update(fs.readFileSync(join(here, '58-claude-code-plugin-manifest.schema.json'))).digest('hex');
t('G18 schemastore 快照入锁（digest==文件 sha256＋禁运行时拉取注记）',
  LOCK58.indexOf('schemastore-claude-plugin-manifest') >= 0 && LOCK58.indexOf('sha256:' + snapSha58) >= 0 && LOCK58.indexOf('禁运行时拉取') >= 0);

const CLAUDE_CLI_PINNED = '2.1.251';
const cliRow58 = (LOCK58.split('- id: claude-cli')[1] || '').split('\n  - id:')[0];
const cliVerM58 = cliRow58.match(/version:\s*"([^"]+)"/);
t('G19a claude-cli 入锁表（status=active＋pin_type=exact-version＋源内 pin 锚）',
  cliRow58.indexOf('status: active') >= 0 && cliRow58.indexOf('pin_type: exact-version') >= 0 && !!cliVerM58 && cliVerM58[1] === CLAUDE_CLI_PINNED,
  'lock=' + (cliVerM58 && cliVerM58[1]) + ' pin=' + CLAUDE_CLI_PINNED);
if (_claudeVer) {
  t('G19b 三方同值：claude --version ' + _claudeVer + ' ↔ 锁表 ' + (cliVerM58 && cliVerM58[1]) + ' ↔ 源内 pin ' + CLAUDE_CLI_PINNED,
    _claudeVer === (cliVerM58 && cliVerM58[1]) && _claudeVer === CLAUDE_CLI_PINNED);
} else {
  w58('G19b claude --version（cli-absent——advisory 环境位，三方同值挂起非失败）', false, 'claude binary unresolved');
}

const vp58 = fs.readFileSync(join(ENGINE, 'scripts', 'validate-plugin.mjs'), 'utf8');
t('G19c validate-plugin 环境分层面在（MACRO_AUDIT_CI 门控＋INFO 第三态＋receipts append-only＋mode=local-observation-only；D-077①②④）',
  vp58.includes('MACRO_AUDIT_CI') && vp58.includes('INFO(claude-validate): cli-absent-expected') && vp58.includes('claude-validate-receipts.jsonl') && vp58.includes('local-observation-only'));

// advisory 真校验器输出回显（probe 已于文件头执行——SKIP/WARN 计入 warn58；连续 SKIP 见顶部 ⚠ 升格提示）
if (_vlines.some(l => l.indexOf('SKIP(claude-validate)') === 0 || l.indexOf('WARN ') === 0)) warn58++;
_vlines.forEach(l => console.log('  ADV | ' + l));

if (warn58 > 0) console.log('WARN ' + warn58 + '（advisory/unknown-field 面——WARN 计入但不进 PASS/FAIL 分母）');

console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
