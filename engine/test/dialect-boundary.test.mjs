// dialect-boundary.test.mjs —— #81 quarantine 方言归一缺陷修回归册（D-128 / ADR-0022 §4b）
// A=边界吸收器纯契约（确定性枚举面）/ B=dormant 防御纵深（分类器直接收 +00:00 仍留痕）
// C=gitRunner 注入缝集成：合成 +00:00/Z 双语料→跨方言计数一致＋吸收事件独立面
// D=真机探针：本仓实跑——跨宿主 stats 归 clean（缺陷实证面）
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const REPO = join(ROOT, '..');
const NL = String.fromCharCode(10);
const Q = await import(pathToFileURL(join(ROOT, 'dist', 'intake', 'quarantine.js')).href);
const MB = await import(pathToFileURL(join(ROOT, 'dist', 'audit', 'macro-b.js')).href);

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 240) : '')); } }

// ---------- A. absorbGitIsoDialect 纯契约（边界=适配层职责，分类器上游） ----------
t('A0 方言规则枚举面导出且仅 tz-offset 一族', Array.isArray(Q.GIT_ISO_DIALECT_RULES) && Q.GIT_ISO_DIALECT_RULES.length === 1 && Q.GIT_ISO_DIALECT_RULES[0].rule_id === 'tz_offset/+00:00→Z');
const a1 = Q.absorbGitIsoDialect('2005-04-07T22:13:13+00:00');
t('A1 +00:00 尾缀→canonical Z＋吸收事件载 raw/canonical/rule_id', a1.value === '2005-04-07T22:13:13Z' && a1.absorption !== null && a1.absorption.rule_id === 'tz_offset/+00:00→Z' && a1.absorption.raw === '2005-04-07T22:13:13+00:00' && a1.absorption.canonical === '2005-04-07T22:13:13Z');
const a2 = Q.absorbGitIsoDialect('2005-04-07T22:13:13Z');
t('A2 Z 形原样放行无事件', a2.value === '2005-04-07T22:13:13Z' && a2.absorption === null);
const a3 = Q.absorbGitIsoDialect('2005-04-07T22:13:13+08:00');
t('A3 非零偏移 +08:00 不动（真时区非方言）', a3.value === '2005-04-07T22:13:13+08:00' && a3.absorption === null);
const a4 = Q.absorbGitIsoDialect('not-a-date');
t('A4 非 ISO 原样放行（形状判定是分类器职责不归边界）', a4.value === 'not-a-date' && a4.absorption === null);
const a5a = Q.absorbGitIsoDialect('2005-04-07T22:13:13+00:00');
const a5b = Q.absorbGitIsoDialect('2005-04-07T22:13:13+00:00');
t('A5 确定性：同输入同输出逐字节一致', JSON.stringify(a5a) === JSON.stringify(a5b));
t('A6 边界不 throw（null/undefined/空串原样放行）', (function () { try { return Q.absorbGitIsoDialect(null).value === '' && Q.absorbGitIsoDialect(undefined).absorption === null; } catch (e) { return false; } })());

// ---------- B. dormant 防御纵深（D-128③ impl 裁定：词表+分类器路径保留） ----------
const b1 = Q.classifyGitIsoField('2005-04-07T22:13:13+00:00');
t('B1 分类器直收 +00:00（旁路）仍 normalized/normalized_tz_offset——dormant 保留 defense-in-depth', b1.status === 'normalized' && b1.value === '2005-04-07T22:13:13Z' && b1.reason_code === 'normalized_tz_offset');
t('B2 normalized_tz_offset 仍在词表（删改破坏纪律——码不删只休眠）', Q.QUARANTINE_REASON_CODES.indexOf('normalized_tz_offset') >= 0);

// ---------- C. gitRunner 注入缝：合成 +00:00/Z 双语料跨方言计数一致（#81 票面 e 款） ----------
const SHAS = ['a'.repeat(40), 'b'.repeat(40), 'c'.repeat(40)];
const TREE = 'd'.repeat(40);
function fakeGit(tz) {
  return function (_root, args) {
    const key = args.join(' ');
    if (key === 'log -1 --format=%cI') { return '2020-01-03T00:00:00' + tz; }
    if (key === 'rev-parse HEAD^{tree}') { return TREE; }
    if (key === 'rev-list --count HEAD') { return '3'; }
    if (key === 'log --pretty=format:__R__%H|%an|%cI --name-only') {
      return SHAS.map(function (s, i) { return '__R__' + s + '|dev|' + '2020-01-0' + (i + 1) + 'T00:00:00' + tz + NL + 'docs/adr/000' + (i + 1) + '-x.md'; }).join(NL);
    }
    if (key === 'log --pretty=format:%s') { return 'c3' + NL + 'c2' + NL + 'c1'; }
    throw new Error('unexpected git args: ' + key);
  };
}
const pZ = MB.probeMacroBRepo('synthetic', 'h'.repeat(40), { gitRunner: fakeGit('Z') });
const pOff = MB.probeMacroBRepo('synthetic', 'h'.repeat(40), { gitRunner: fakeGit('+00:00') });
t('C1 跨方言 fieldStats 逐字节一致（+00:00 与 Z 同计数）', JSON.stringify(pZ.fieldStats) === JSON.stringify(pOff.fieldStats), JSON.stringify(pOff.fieldStats));
t('C2 两方言 stats 全 clean（normalized=0 quarantined=0——桶收窄落地）', pOff.fieldStats.every(function (s) { return s.clean === s.total && s.normalized === 0 && s.quarantined === 0; }));
t('C3 +00:00 料产 4 条吸收事件（head_date×1+committer_date×3）；Z 料 0 条', pOff.dialectAbsorptions.length === 4 && pZ.dialectAbsorptions.length === 0 && pOff.dialectAbsorptions.every(function (e) { return e.rule_id === 'tz_offset/+00:00→Z'; }));
t('C4 commits[].date 跨方言一致且为 canonical Z', JSON.stringify(pZ.commits.map(function (c) { return c.date; })) === JSON.stringify(pOff.commits.map(function (c) { return c.date; })) && pOff.commits.every(function (c) { return /Z$/.test(c.date); }));
t('C5 headDate 跨方言一致（锚值规范形）', pZ.headDate === pOff.headDate && pOff.headDate === '2020-01-03T00:00:00Z');
t('C6 fieldEvents 双语料均空（方言事件不入 quarantine 域——披露面与测量面分离）', pOff.fieldEvents.length === 0 && pZ.fieldEvents.length === 0);
t('C7 吸收事件形={field_name,commit_sha,rule_id,raw,canonical}', pOff.dialectAbsorptions.every(function (e) { return e.field_name && e.commit_sha && e.rule_id && e.raw && e.canonical; }) && pOff.dialectAbsorptions.filter(function (e) { return e.field_name === 'head_date'; }).length === 1);

// ---------- D. 真机探针：本仓实跑（宿主 git 方言无关——stats 归 clean 跨宿主稳定） ----------
let realHead = '';
try { realHead = execFileSync('git', ['-C', REPO, 'rev-parse', '--verify', 'HEAD'], { encoding: 'utf8' }).trim(); } catch (e) {}
if (realHead) {
  const pr = MB.probeMacroBRepo(REPO, realHead);
  t('D1 真机本仓 stats 全 clean（git ' + execFileSync('git', ['--version'], { encoding: 'utf8' }).trim().replace('git version ', '') + ' 方言已被边界吸收）', pr.fieldStats.every(function (s) { return s.clean === s.total && s.normalized === 0 && s.quarantined === 0; }), JSON.stringify(pr.fieldStats));
  t('D2 真机方言事件载体在（数组；本宿主条数随 git 版本如实在 0/N）', Array.isArray(pr.dialectAbsorptions) && pr.dialectAbsorptions.every(function (e) { return e.rule_id && e.field_name; }));
  t('D3 真机 PROBE-INVARIANT：commitCount=commits.length', pr.commitCount === pr.commits.length && pr.commitCount > 0);
} else {
  t('D1 真机本仓 stats 全 clean', false, 'git rev-parse HEAD 不可得');
}

console.log('DIALECT-BOUNDARY ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
