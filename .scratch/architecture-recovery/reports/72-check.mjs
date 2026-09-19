// #72 守卫——github-rest 接线票·批2（D-080③ sibling 次票／ADR-0020 最小契约边界）
// ① opt-in 注册：UPSTREAM_COLLECTOR_REGISTRY 含 github-rest-adapter@v1（registered，opt_in=token+network）
//    ＋skipped 语义字段在——凭据缺席环境显式报告 skipped 不算 PASS（D-080③ 防假绿）
// ② 凭据三级探测保真（env token→gh auth token→unauthenticated 显式降级——ADR-0009 opt-in 纪律）
//    ＋token 不进 facts/logs（cassette 断言面已锁——复述守卫不重复断言语义只查机制在位）
// ③ §② github-rest 表行 ⇔ 常量逐行对账：pr_summary→S4／merge lead time→S4 仅人类 PR／
//    Bot 占比→S5 平台声明措辞锁／review 覆盖→pending(event_bound) 非双挂二选一／
//    pr_diff→Micro-A 不直采／rate_limit 族→永久排除
// ④ event_bound 消费：review-coverage lane=pending-event_bound＋33-check H2 一致性镜像断言
//    （pulls.reviews 在 PLANNED_SURFACES ⇔ pending 态——激活则两断言同翻，D-081③）
// ⑤ golden/cassette 对账：5 cassette 覆盖认证/降级/限流/schema 漂移/平台声明 Bot 五面＋
//    github-rest.test.mjs 实跑绿＋skipped 显式报告路径在（无 token 不产假绿）
// ⑥ descriptor dimension:null 保留＋适配器不产维度事实（防腐层禁业务语义——A14 镜像）
// 用法：node 72-check.mjs → 逐条 PASS/FAIL；exit 0=结构完整，exit 1=有 FAIL
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const ENG = join(ROOT, 'engine');
const DOC = join(ROOT, 'docs', 'upstream-dimension-map.md');
const MAP_DIST = join(ENG, 'dist', 'audit', 'upstream-dimension-map.js');
const GH_SRC = join(ENG, 'src', 'upstream', 'github-rest.ts');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
const txt = (p) => fs.readFileSync(p, 'utf8');

let M = null;
try { M = await import(pathToFileURL(MAP_DIST).href); } catch (e) { M = null; }
const ghSrc = fs.existsSync(GH_SRC) ? txt(GH_SRC) : '';
const doc = fs.existsSync(DOC) ? txt(DOC) : '';

// ---------- A. opt-in 注册面 ----------
const reg = M ? M.UPSTREAM_COLLECTOR_REGISTRY : [];
const ghReg = reg.find(x => x.descriptor && x.descriptor.id === 'github-rest-adapter@v1');
t('A1 github-rest descriptor opt-in 注册（registered=true＋opt_in=token+network）',
  !!ghReg && ghReg.registered === true && ghReg.opt_in === 'token+network', '');
t('A2 skipped 语义字段在且含「显式报告 skipped 不算 PASS」口径（D-080③ 防假绿）',
  !!ghReg && /skipped/.test(ghReg.skipped_semantics) && /不算 PASS|非绿|降级/.test(ghReg.skipped_semantics), ghReg ? ghReg.skipped_semantics.slice(0, 60) : 'reg-missing');
t('A3 凭据三级探测机制在（env token→gh auth token→unauthenticated 显式降级——ADR-0009 opt-in 纪律）',
  ghSrc.indexOf('process.env') >= 0 && ghSrc.indexOf('gh auth token') >= 0 && ghSrc.indexOf('unauthenticated') >= 0, '');

// ---------- B. §② github-rest 表行 ⇔ 常量逐行对账 ----------
const docGh = doc.split('## ② github-rest')[1] || '';
const docGhSection = docGh.split('## ')[0];
t('B1 表行 pr_summary→S4 无准入 ⇔ 常量', docGhSection.indexOf('github_rest.pr_summary') >= 0 && /pr_summary`?[^|]*\|[^|]*\|\s*S4/.test(docGhSection) && !!M && M.resolveGithubRestSlice('pr_summary').dimension === 'S4' && M.resolveGithubRestSlice('pr_summary').admitted === true, '');
t('B2 表行 merge lead time→S4 仅人类 PR ⇔ 常量（Bot 准入拒——CHAOSS 纪律）',
  docGhSection.indexOf('merge lead time') >= 0 && docGhSection.indexOf('仅人类 PR') >= 0 && !!M &&
  M.resolveGithubRestSlice('merge-lead-time', { is_bot_via_platform_identity: false }).dimension === 'S4' &&
  M.resolveGithubRestSlice('merge-lead-time', { is_bot_via_platform_identity: true }).admitted === false, '');
t('B3 表行 Bot 占比→S5 平台声明措辞锁 ⇔ 常量（user.type==Bot ∧ login [bot] 双检——不自建启发式）',
  docGhSection.indexOf('S5') >= 0 && docGhSection.indexOf('平台声明的 Bot 身份') >= 0 && !!M &&
  M.resolveGithubRestSlice('bot-participation-density').dimension === 'S5' &&
  /平台声明的 Bot 身份/.test(M.resolveGithubRestSlice('bot-participation-density').admission), '');
t('B4 表行 review 覆盖→pending(event_bound) 无偏好序 ⇔ 常量（非双挂二选一——D-081④）',
  docGhSection.indexOf('pending(event_bound)') >= 0 && docGhSection.indexOf('无偏好序') >= 0 && !!M &&
  M.resolveGithubRestSlice('review-coverage').lane === 'pending-event_bound' && M.resolveGithubRestSlice('review-coverage').dimension === null, '');
t('B5 表行 pr_diff→Micro-A 消费不直采 Macro-B ⇔ 常量',
  docGhSection.indexOf('Micro-A') >= 0 && !!M && M.resolveGithubRestSlice('pr_diff').lane === 'Micro-A' && M.resolveGithubRestSlice('pr_diff').dimension === null, '');
const EXCLUDED_TYPES = ['resolution', 'rate_limit', 'rate_limited', 'api_error', 'schema_drift', 'run', 'preflight'];
t('B6 表行 rate_limit 族永久排除 ⇔ 常量 excluded 七类齐（遥测防渗入 S 维裁决）',
  docGhSection.indexOf('永久排除') >= 0 && !!M && EXCLUDED_TYPES.every(f => M.isGithubRestExcludedFactType(f) && M.resolveGithubRestSlice(f).lane === 'excluded'), '');

// ---------- C. event_bound 消费一致性（33-check H2 引擎侧镜像） ----------
const plannedM = ghSrc.match(/GITHUB_REST_PLANNED_SURFACES[^=]*=\s*\[([\s\S]*?)\]/);
const reviewsPlanned = !!(plannedM && plannedM[1].indexOf('pulls.reviews') >= 0);
const reg33 = JSON.parse(txt(join(HERE, '33-gate-registry.json')));
const evH = reg33.events['github-rest-reviews-active'];
t('C1 pulls.reviews 在 PLANNED_SURFACES ⇔ review-coverage 仍 pending（激活则两侧断言同翻——D-081③）',
  !!M && (reviewsPlanned === (M.resolveGithubRestSlice('review-coverage').lane === 'pending-event_bound')),
  'planned=' + reviewsPlanned);
t('C2 registry 事件锚在且 occurred=false（面激活前——33-check H 组镜像，激活后由 H2 执哨）',
  !!evH && evH.occurred === false, evH ? 'occurred=' + evH.occurred : 'event-missing');

// ---------- D. golden/cassette 对账＋skipped 显式路径 ----------
const fxDir = join(ENG, 'test', 'fixtures', 'github-rest');
const cassettes = fs.existsSync(fxDir) ? fs.readdirSync(fxDir).filter(f => f.endsWith('.cassette.json')) : [];
const CASSETTE_WANT = ['authenticated', 'platform-bot', 'rate-limit-exhausted', 'schema-drift', 'unauthenticated-degraded'];
t('D1 cassette 五面齐备（认证/降级/限流/schema 漂移/平台声明 Bot——golden 回放面）',
  CASSETTE_WANT.every(w => cassettes.some(c => c.indexOf(w) >= 0)), 'have=' + cassettes.join(','));
const ghTest = txt(join(ENG, 'test', 'github-rest.test.mjs'));
t('D2 github-rest.test.mjs 消费五 cassette（回放非摆设——逐 cassette 引用在）',
  CASSETTE_WANT.every(w => ghTest.indexOf(w) >= 0), '');
const tr = spawnSync('node', [join(ENG, 'test', 'github-rest.test.mjs')], { encoding: 'utf8', timeout: 120000 });
t('D3 cassette 契约测试实跑绿（' + ((tr.stdout || '').match(/GH-REST-TEST-OK \d+\/\d+|TEST-OK \d+\/\d+/) || ['n/a'])[0] + '）',
  tr.status === 0, (tr.stderr || '').slice(0, 120));

// ---------- E. descriptor dimension:null 保留＋防腐层无 S 维字样 ----------
t('E1 github-rest descriptor dimension:null 保留（注册不改写——ADR-0014）',
  !!ghReg && ghReg.descriptor.dimension === null && ghSrc.indexOf('dimension: null') >= 0, '');
t('E2 适配器文件无 S1-S5 字样（映射=业务语义禁入防腐层——44-check A14 镜像）',
  !/\bS[1-5]\b/.test(ghSrc), '');

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
