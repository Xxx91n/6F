// 80-check.mjs — #80 Micro-B 步①守卫（per-file 一等事实发射 + facet_rows raw 证据位 + file_renamed 血缘 + fixture golden）
// 断言面：A 归一器/血缘/发射源标记在（dist+src 双锚）　→ B facet_rows raw 证据位（role=raw_evidence+append-only 保留）
//   → C 消费面迁移（audit.ts 读源=per-file 重聚合+对账判据调用）　→ D fixture golden（骨架锁 regen→diff empty+测试在 smoke 链）
//   → E 禁项集反面断言（禁大小写折叠/血缘不进身份/stale 不拒答/miss 不单态——步①可达子集）　→ F BOM/ledger 纪律
//     ＋ need 族语义与 gitattributes 语义机检（#33 复盘：两者都是「写错了不会红」的静默失效型）
// 用法：node 80-check.mjs → 逐条 PASS/FAIL；exit 0=全 PASS
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { need, groupProbe, engineDepsOk } from './_lib/env-contract.mjs';
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'env-contract';
// D-214① consumption_forms（多形态消费方——G8 组级 need engine-deps:）：dev-full=完整克隆＋engine/node_modules 在位全断言面；ci-shallow=CI 浅克隆（duckdb 原生绑定缺席→G8 组 SKIP）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '#80 Micro-B 步①守卫（per-file 一等事实发射 + facet_rows raw 证据位 + file_renamed 血缘 ';


const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const ENG = join(ROOT, 'engine');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
const txt = p => fs.readFileSync(p, 'utf8');
const exists = p => fs.existsSync(p);

// ---------- A. 发射面源标记（src+dist 双锚防「引入未编译」） ----------
const subjSrc = exists(join(ENG, 'src', 'fact', 'subject.ts')) ? txt(join(ENG, 'src', 'fact', 'subject.ts')) : '';
const subjDist = exists(join(ENG, 'dist', 'fact', 'subject.js')) ? txt(join(ENG, 'dist', 'fact', 'subject.js')) : '';
t('A1 subject 归一器 src+dist 在（normalizeSubjectPath/detectCaseOnlyConflicts 双出口）',
  /export function normalizeSubjectPath/.test(subjSrc) && /detectCaseOnlyConflicts/.test(subjSrc) && /normalizeSubjectPath/.test(subjDist), '');
const linSrc = exists(join(ENG, 'src', 'collect', 'file-lineage.ts')) ? txt(join(ENG, 'src', 'collect', 'file-lineage.ts')) : '';
const linDist = exists(join(ENG, 'dist', 'collect', 'file-lineage.js')) ? txt(join(ENG, 'dist', 'collect', 'file-lineage.js')) : '';
t('A2 file-lineage src+dist 在（parseRenameLogZ/collectFileLineage/gitRenameLogArgs/detector 版本钉）',
  /parseRenameLogZ/.test(linSrc) && /collectFileLineage/.test(linSrc) && /gitRenameLogArgs/.test(linSrc) && /rename-detector@v1/.test(linSrc) && /parseRenameLogZ/.test(linDist), '');
const clSrc = txt(join(ENG, 'src', 'upstream', 'codelore.ts'));
t('A3 发射边界 per-file 件（emitPerFileFacts/file_facet_row/subjectProbe 注入缝）',
  /emitPerFileFacts/.test(clSrc) && /codelore.file_facet_row/.test(clSrc) && /subjectProbe/.test(clSrc), '');
t('A4 血缘载荷五字段合同（from/to/head_sha/threshold/detector_version 入 value）',
  /from:/.test(linSrc) && /to:/.test(linSrc) && /head_sha:/.test(linSrc) && /threshold:/.test(linSrc) && /detector_version:/.test(linSrc), '');

// ---------- B. raw 证据位 ----------
t('B1 facet_rows 聚合载荷带 role=raw_evidence 标记（append-only 保留不删）',
  /role: 'raw_evidence'/.test(clSrc) && /codelore.facet_rows/.test(clSrc), '');
t('B2 skip/冲突披露 metric 在（file_subject_skip/subject_case_conflict 不静默）',
  /codelore.file_subject_skip/.test(clSrc) && /codelore.subject_case_conflict/.test(clSrc), '');

// ---------- C. 消费面迁移 ----------
const auditSrc = txt(join(ENG, 'src', 'audit', 'audit.ts'));
t('C1 Macro-B behavior 读源=per-file 重聚合（reaggregateFileFacetRows）', /reaggregateFileFacetRows/.test(auditSrc), '');
t('C2 对账判据调用在（reconcilePerFileVsAggregate）+ 披露进 measurements（micro_b/reconciliation）',
  /reconcilePerFileVsAggregate/.test(auditSrc) && /micro_b/.test(auditSrc) && /reconciliation/.test(auditSrc), '');
t('C3 fileLineage=on 接进 audit 采集 spec（lazy/audit 同构发射管线位）', /fileLineage: { mode: 'on' }/.test(auditSrc), '');
const mbSrc = txt(join(ENG, 'src', 'audit', 'macro-b.ts'));
t('C4 macro-b spec 收 fileLineage 旗标 + fileLineageFacts 入 realFacts',
  mbSrc.includes('fileLineage?: { mode') && mbSrc.includes('fileLineageFacts'), '');

// ---------- D. fixture golden ----------
const FX = join(ENG, 'test', 'fixtures', 'micro-b');
t('D1 fixture 三件套在（emission-input/rename-log/manifest）',
  exists(join(FX, 'emission-input.json')) && exists(join(FX, 'rename-log.ztxt')) && exists(join(FX, 'manifest.json')), '');
t('D2 golden 骨架文件在 + regen --check diff empty（字段骨架非内容值锁）', (() => {
  if (!exists(join(FX, 'emission-skeleton.golden.json'))) return false;
  const r = spawnSync(process.execPath, [join(ENG, 'scripts', 'gen-micro-b-emission-golden.mjs'), '--check'], { encoding: 'utf8' });
  return r.status === 0 && /GOLDEN-CHECK-OK/.test(r.stdout || '');
})());
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('D3 micro-b-emit.test.mjs 入 smoke 链（test 闭环非只引入）', /micro-b-emit.test.mjs/.test(pkg.scripts.smoke), '');
t('D4 seam 测试实跑绿（MICRO-B-EMIT-TEST-OK）', (() => {
  const r = spawnSync(process.execPath, [join(ENG, 'test', 'micro-b-emit.test.mjs')], { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
  return r.status === 0 && /MICRO-B-EMIT-TEST-OK (\d+)\/\1/.test(r.stdout || '');
})());

// ---------- E. 禁项集反面断言（步①可达子集） ----------
t('E1 归一器无 toLowerCase 折叠于输出路径（仅冲突检测分桶用）', (() => {
  const body = subjSrc.split('detectCaseOnlyConflicts')[0];   // 归一函数段禁现 toLowerCase
  return !/toLowerCase/.test(body);
})());
t('E2 血缘事实 subject=规范化 to 路径（血缘不进身份——subject_ref=path 非 rename: 伪身份）',
  linSrc.includes('makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, toN.subject'), '');
t('E3 跨版本可复算验证件：e2e 真 git rename 断言在测试内（非注入回放）',
  txt(join(ENG, 'test', 'micro-b-emit.test.mjs')).includes("gitRenameLogArgs('50%')"), '');

// ---------- G. 步② 投影+查询语义（D-123/D-126） ----------
const fcSrc = exists(join(ENG, 'src', 'fact', 'file-card.ts')) ? txt(join(ENG, 'src', 'fact', 'file-card.ts')) : '';
const fcDist = exists(join(ENG, 'dist', 'fact', 'file-card.js')) ? txt(join(ENG, 'dist', 'fact', 'file-card.js')) : '';
t('G1 卡构建器 src+dist 在（buildFileCard+规则版本钉+miss 四类枚举）',
  /export function buildFileCard/.test(fcSrc) && /hotspot_priority_v1/.test(fcSrc) && /never_collected/.test(fcSrc) && /not_tracked_at_sha/.test(fcSrc) && /not_applicable/.test(fcSrc) && /renamed_to/.test(fcSrc) && /buildFileCard/.test(fcDist), '');
const projSrc = txt(join(ENG, 'src', 'fact', 'projection.ts'));
t('G2 投影层 projectFileCard（观测集=repo_ref@sha 分组+最新集默认+at pin 常量纪律+ESCAPE 防注入）',
  /export async function projectFileCard/.test(projSrc) && /repo_ref LIKE/.test(projSrc) && /MAX\(CAST\(observed_at/.test(projSrc) && /ESCAPE/.test(projSrc), '');
const mcpSrc = txt(join(ENG, 'src', 'mcp-server.ts'));
t('G3 MCP file_card 只读工具注册（MCP 面永不写：miss→cli_guidance 指 CLI 补采）',
  /file_card/.test(mcpSrc) && /cli_guidance/.test(mcpSrc) && /projectFileCard/.test(mcpSrc), '');
const afSrc = exists(join(ENG, 'src', 'audit', 'file-card.ts')) ? txt(join(ENG, 'src', 'audit', 'file-card.ts')) : '';
t('G4 CLI lazy 补采=同构发射管线（collectCodeloreFacets+collectFileLineage 复用+appendFact append+SHA 可达资格检）',
  /collectCodeloreFacets/.test(afSrc) && /collectFileLineage/.test(afSrc) && /appendFact/.test(afSrc) && /rev-parse/.test(afSrc) && /AUDIT-FILE-SHA-UNREACHABLE/.test(afSrc), '');
const cliSrc = txt(join(ENG, 'src', 'cli.ts'));
t('G5 audit file 子命令分发（--db 必填+--at pin+在通用参数循环之前拦截）',
  /args\[0\] === 'file'/.test(cliSrc) && /runAuditFile/.test(cliSrc) && /--db <facts\.duckdb>/.test(cliSrc), '');
t('G6 miss 四类+advisory:true+无 verdict/gate 字段+staleness 双字段+renamed_to revalidated',
  /advisory: true/.test(fcSrc) && /observed_head_sha/.test(fcSrc) && /current_head_sha/.test(fcSrc) && /revalidated/.test(fcSrc) && !/^\s*(verdict|gate_score|gate_)\w*\s*[:=]/m.test(fcSrc), '');
const fcTest = txt(join(ENG, 'test', 'file-card.test.mjs'));
const pkgJson = JSON.parse(txt(join(ENG, 'package.json')));
t('G7 file-card 测试在 smoke 链+断言面覆盖（pin/staleness/miss 四类/补采幂等）',
  pkgJson.scripts.smoke.indexOf('file-card.test.mjs') >= 0 && /renamed_to/.test(fcTest) && /pin_matches_observed_head/.test(fcTest) && /staleness/.test(fcTest), '');
// engine-deps 前置（D-163③）：file-card.test 写读真库需 @duckdb 原生绑定——缺席→组级 SKIP 非误红
if (groupProbe('80-check', 'G8', [need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))])) {
  const r = spawnSync('node', [join(ENG, 'test', 'file-card.test.mjs')], { encoding: 'utf8', timeout: 240000, env: { ...process.env, NODE_OPTIONS: '' } });
  t('G8 file-card.test.mjs 实跑绿（FILE-CARD n/n）', r.status === 0 && /FILE-CARD \d+\/\d+/.test(r.stdout), String(r.stdout).trim().split('\n').slice(-1)[0] || String(r.stderr).slice(-160));
}

// ---------- F. 纪律 ----------
t('F1 新增源/测试/fixture 文件无 BOM', (() => {
  // F7i（#83）：钉面更新至步②文件全量（冻结在步①清单=滞后已修——本票面新增件逐件钉）
  const files = ['src/fact/subject.ts', 'src/collect/file-lineage.ts', 'src/fact/file-card.ts', 'src/fact/projection.ts', 'src/fact/store.ts', 'src/audit/file-card.ts', 'src/mcp-server.ts', 'src/cli.ts', 'test/micro-b-emit.test.mjs', 'test/file-card.test.mjs', 'scripts/gen-micro-b-emission-golden.mjs', 'test/fixtures/micro-b/emission-input.json', 'test/fixtures/micro-b/rename-log.ztxt', 'test/fixtures/micro-b/manifest.json', 'test/fixtures/micro-b/emission-skeleton.golden.json'];
  return files.every(f => { const b = fs.readFileSync(join(ENG, f)); return b[0] !== 0xEF; });
})());

// F2/F3（#33 复盘）：need 族语义与 gitattributes 语义的机检——两者都是「写错了不会有东西红」的静默失效型。
//   F2 的由来：C 组曾把**在仓** frozen bundle 挂进 groupProbe，于是「换钉不一致」退化成 SKIP＝套件仍绿；
//   asset: 族的语义就是「gitignored 外部资产」，拿它承载在仓制品即违约，而族义是 SSOT，形状错了族义就废了。
// 只认字面量（末尾紧跟 `+` 的是拼接形态，静态不可判——如 43-check 的 `'git-object:' + FROZEN_SHA`，跳过）；
// 单双引号都收：只认单引号时，双引号写法的 asset 声明会静默漏检，而漏检的表现是「扫不到」＝全绿。
const NEED_LIT_RE = /need\(\s*(['"])(sibling|asset|git-object|engine-deps|git-history):([^'"]*)\1(?!\s*\+)/g;
function needShapeViolations(entries, isTracked) {
  const bad = [];
  for (const e of entries) {
    if (e.family === 'asset') {
      // asset: = 仓库外、不入仓、须另行播种的资产：必须是路径形状，且不得被 git 跟踪
      if (e.spec.indexOf('/') < 0) { bad.push(e.file + ' asset:' + e.spec + '（非路径形状）'); }
      else if (isTracked(e.spec)) { bad.push(e.file + ' asset:' + e.spec + '（在仓——应改红断言，不得作组级闸）'); }
    } else if (e.family === 'git-object') {
      if (!/^[0-9a-f]{40}$/.test(e.spec)) { bad.push(e.file + ' git-object:' + e.spec + '（非 40 位 sha）'); }
    } else if (e.family === 'engine-deps') {
      if (!/^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/i.test(e.spec)) { bad.push(e.file + ' engine-deps:' + e.spec + '（非包名）'); }
    }
  }
  return bad;
}
const f2 = (() => {
  const needEntries = [];
  for (const f of fs.readdirSync(HERE).filter(x => /-check\.mjs$/.test(x))) {
    for (const m of txt(join(HERE, f)).matchAll(NEED_LIT_RE)) { needEntries.push({ file: f, family: m[2], spec: m[3] }); }
  }
  const tracked = spec => spawnSync('git', ['-C', ROOT, 'ls-files', '--', spec], { encoding: 'utf8' }).stdout.trim().length > 0;
  const real = needShapeViolations(needEntries, tracked);
  // 判别臂活性自证一：抽取面——单引号、双引号都要抽到，拼接形态必须跳过（漏抽＝扫不到＝全绿）
  //   探针串用字符码拼装：本文件也在扫描范围内，写成字面量会被自己当成真声明抓出来（自指）
  const q1 = String.fromCharCode(39), q2 = String.fromCharCode(34);
  const probeSrc = ['need(', q1, 'engine-deps:@a/b', q1, ', x); need(', q2, 'asset:engine/baseline-lock.yaml', q2, ', y); need(', q1, 'git-object:', q1, ' + SHA, z);'].join('');
  const probeHits = Array.from(probeSrc.matchAll(NEED_LIT_RE)).map(m => m[2] + ':' + m[3]);
  const extractOk = probeHits.length === 2 && probeHits[0] === 'engine-deps:@a/b' && probeHits[1] === 'asset:engine/baseline-lock.yaml';
  // 判别臂活性自证二：判据面——三条合成违规必须全检出
  const synthetic = needShapeViolations([
    { file: 'x', family: 'asset', spec: 'baseline-bundle' },
    { file: 'x', family: 'asset', spec: 'engine/baseline-lock.yaml' },
    { file: 'x', family: 'git-object', spec: '770d2549' },
  ], spec => spec === 'engine/baseline-lock.yaml');
  return { ok: real.length === 0 && extractOk && synthetic.length === 3, detail: real.length ? real.join('; ') : 'scanned=' + needEntries.length + ' extract=' + JSON.stringify(probeHits) + ' synthetic=' + synthetic.length };
})();
t('F2 need 族名称形状合法（asset: 须仓库外路径且未被 git 跟踪／git-object: 须 40 位 sha／engine-deps: 须包名）', f2.ok, f2.detail);
const f3 = (() => {
  const attrFiles = [join(ROOT, '.gitattributes'), join(ENG, '.gitattributes')].filter(f => exists(f));
  const noBrace = attrFiles.every(f => txt(f).split(/\r?\n/).every(l => !l.trim() || l.trim().startsWith('#') || l.indexOf('{') < 0));
  // 探针覆盖根 .gitattributes 的**全部**二进制后缀（少探一个＝删了那条规则也不会红），外加 engine/ 深层三件
  const probes = [
    'docs/x.png', 'x.ico', 'x.icns', 'x.jpg', 'x.jpeg', 'x.gif', 'x.webp',
    'x.exe', 'x.dll', 'x.node', 'x.pdb', 'x.msi', 'x.so', 'x.dylib',
    'x.bin', 'x.zip', 'x.gz', 'x.tar', 'x.7z',
    'engine/x.png', 'engine/x.bundle', 'engine/x.dll',
  ];
  const set = probes.filter(p => /binary: set/.test(spawnSync('git', ['-C', ROOT, 'check-attr', 'binary', '--', p], { encoding: 'utf8' }).stdout || ''));
  return { ok: noBrace && set.length === probes.length, detail: 'noBrace=' + noBrace + ' binary-set=' + set.length + '/' + probes.length };
})();
t('F3 .gitattributes 无花括号语法（git 不展开 {a,b}）＋ 二进制后缀 check-attr=binary:set（根与 engine/ 双面）', f3.ok, f3.detail);

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
