// 81-check.mjs —— #81 quarantine 方言归一缺陷修验收闸（D-128 / D-100② scoped / ADR-0022 §4b）
// 断言面：A=契约层边界吸收器导出+枚举面 / B=micro-b 探针接线序（吸收在分类器上游）
//   C=披露载体=run 元数据独立面（禁入 Intake Health/golden/⚠） / D=回归测试册在链
//   E=dialect-boundary.test.mjs 实跑 / F=真机探针跨宿主 clean
// 用法：node 81-check.mjs（须先 npm run build——dist 面被断言）
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const NL = String.fromCharCode(10);
const CLEAN_ENV = Object.assign({}, process.env, { NODE_OPTIONS: '' });

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 260) : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }

// ---------- A. 契约层（intake/quarantine.ts）边界吸收面 ----------
const quar = txt(join(ENG, 'src', 'intake', 'quarantine.ts'));
t('A1 方言规则枚举面导出 GIT_ISO_DIALECT_RULES（当前仅 tz-offset 一族）', quar.indexOf('export const GIT_ISO_DIALECT_RULES') >= 0 && quar.indexOf('tz_offset/+00:00→Z') >= 0);
t('A2 边界吸收器导出 absorbGitIsoDialect（纯函数载 absorption 事件）', quar.indexOf('export function absorbGitIsoDialect') >= 0 && quar.indexOf('DialectAbsorption') >= 0);
t('A3 normalized_tz_offset dormant 保留（词表不删＋分类器路径仍在=defense-in-depth）', quar.indexOf("'normalized_tz_offset'") >= 0 && quar.indexOf('dormant') >= 0);
const Q = await import(pathToFileURL(join(ENG, 'dist', 'intake', 'quarantine.js')).href);
const aProbe = Q.absorbGitIsoDialect('2005-04-07T22:13:13+00:00');
t('A4 dist 面吸收器可用且行为正确（+00:00→Z＋事件）', typeof Q.absorbGitIsoDialect === 'function' && aProbe.value === '2005-04-07T22:13:13Z' && aProbe.absorption !== null);

// ---------- B. 探针接线序（audit/macro-b.ts：吸收在分类器上游） ----------
const mb = txt(join(ENG, 'src', 'audit', 'macro-b.ts'));
t('B1 MacroBProbes 载 dialectAbsorptions 独立事件集', mb.indexOf('dialectAbsorptions: DialectAbsorptionEvent[]') >= 0);
t('B2 锚字段接线序：absorb→classify（边界归一在分类器上游）', mb.indexOf('absorbGitIsoDialect(headRaw)') >= 0 && mb.indexOf('absorbGitIsoDialect(headRaw)') < mb.indexOf('classifyGitIsoField(headAbs.value'));
t('B3 逐 commit 接线序：absorb→classify', mb.indexOf('absorbGitIsoDialect(parts[2])') >= 0 && mb.indexOf('classifyGitIsoField(abs.value)') >= 0);
t('B4 gitRunner 注入缝在（回归 fixture 供氧——RenameLogRunner 同款先例）', mb.indexOf('gitRunner?: GitProbeRunner') >= 0);
t('B5 采集环境探针 probeGitVersion 导出（披露轴二）', mb.indexOf('export function probeGitVersion') >= 0);

// ---------- C. 披露载体=run 元数据独立面（D-128④ 三禁） ----------
const au = txt(join(ENG, 'src', 'audit', 'audit.ts'));
t('C1 audit-measurements 载 collection_environment+instrument_dialect 披露块', au.indexOf('collection_environment') >= 0 && au.indexOf('instrument_dialect') >= 0 && au.indexOf('absorbed_total') >= 0);
const gen = txt(join(ENG, 'src', 'report', 'generate.ts'));
const ihSec = gen.slice(gen.indexOf('## Intake Health'), gen.indexOf('export interface Sidecar'));
t('C2 Intake Health 渲染面零方言词（禁入病态统计面）', ihSec.indexOf('dialect') < 0 && ihSec.indexOf('git_version') < 0 && ihSec.indexOf('collection_environment') < 0);
const demo = txt(join(ENG, 'src', 'demo', 'demo.ts'));
t('C3 demo 面零接触（golden 字节比对面不含方言披露）', demo.indexOf('dialectAbsorptions') < 0 && demo.indexOf('collection_environment') < 0);
t('C4 披露块无 ⚠ 印记（D-128④ 禁告警印记）', au.indexOf('instrument_dialect') >= 0 && au.indexOf('instrument_dialect') > 0 && au.slice(au.indexOf('instrument_dialect'), au.indexOf('instrument_dialect') + 700).indexOf('⚠') < 0);

// ---------- D. 回归册在链 ----------
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('D1 dialect-boundary.test.mjs 入 smoke 链', pkg.scripts.smoke.indexOf('dialect-boundary.test.mjs') >= 0);
t('D2 回归册实物在', existsSync(join(ENG, 'test', 'dialect-boundary.test.mjs')));

// ---------- E. 回归册实跑（合成 +00:00 断言跨方言计数一致） ----------
try {
  const out = execFileSync('node', [join(ENG, 'test', 'dialect-boundary.test.mjs')], { encoding: 'utf8', timeout: 120000, env: CLEAN_ENV });
  const mTail = out.trim().split(NL).slice(-1)[0] || '';
  const failLines = out.split(NL).filter(function (l) { return l.indexOf('FAIL ') === 0; });
  t('E1 dialect-boundary 实跑全绿（' + mTail + '）', mTail.indexOf('DIALECT-BOUNDARY') >= 0 && failLines.length === 0, mTail);
} catch (e) { t('E1 dialect-boundary 实跑全绿', false, String(e).slice(0, 200)); }

// ---------- F. 真机探针（本仓 HEAD——stats 归 clean 跨宿主稳定=D-128⑤ golden 前提） ----------
try {
  const head = execFileSync('git', ['-C', REPO, 'rev-parse', '--verify', 'HEAD'], { encoding: 'utf8', env: CLEAN_ENV }).trim();
  const MB = await import(pathToFileURL(join(ENG, 'dist', 'audit', 'macro-b.js')).href);
  const pr = MB.probeMacroBRepo(REPO, head);
  t('F1 真机本仓 fieldStats 全 clean（方言归边界吸收）', pr.fieldStats.every(function (s) { return s.clean === s.total && s.normalized === 0 && s.quarantined === 0; }), JSON.stringify(pr.fieldStats));
  t('F2 方言事件独立载体在且非病态域（fieldEvents 只载真病态）', Array.isArray(pr.dialectAbsorptions) && pr.dialectAbsorptions.every(function (e) { return e.rule_id && e.field_name && e.commit_sha; }));
} catch (e) { t('F1/F2 真机探针', false, String(e).slice(0, 200)); }

console.log('81CHECK ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
