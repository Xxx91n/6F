// 80-check.mjs — #80 Micro-B 步①守卫（per-file 一等事实发射 + facet_rows raw 证据位 + file_renamed 血缘 + fixture golden）
// 断言面：A 归一器/血缘/发射源标记在（dist+src 双锚）　→ B facet_rows raw 证据位（role=raw_evidence+append-only 保留）
//   → C 消费面迁移（audit.ts 读源=per-file 重聚合+对账判据调用）　→ D fixture golden（骨架锁 regen→diff empty+测试在 smoke 链）
//   → E 禁项集反面断言（禁大小写折叠/血缘不进身份/stale 不拒答/miss 不单态——步①可达子集）　→ F BOM/ledger 纪律
// 用法：node 80-check.mjs → 逐条 PASS/FAIL；exit 0=全 PASS
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
{
  const r = spawnSync('node', [join(ENG, 'test', 'file-card.test.mjs')], { encoding: 'utf8', timeout: 240000, env: { ...process.env, NODE_OPTIONS: '' } });
  t('G8 file-card.test.mjs 实跑绿（FILE-CARD n/n）', r.status === 0 && /FILE-CARD \d+\/\d+/.test(r.stdout), String(r.stdout).trim().split('\n').slice(-1)[0] || String(r.stderr).slice(-160));
}

// ---------- F. 纪律 ----------
t('F1 新增源/测试/fixture 文件无 BOM', (() => {
  // F7i（#83）：钉面更新至步②文件全量（冻结在步①清单=滞后已修——本票面新增件逐件钉）
  const files = ['src/fact/subject.ts', 'src/collect/file-lineage.ts', 'src/fact/file-card.ts', 'src/fact/projection.ts', 'src/fact/store.ts', 'src/audit/file-card.ts', 'src/mcp-server.ts', 'src/cli.ts', 'test/micro-b-emit.test.mjs', 'test/file-card.test.mjs', 'scripts/gen-micro-b-emission-golden.mjs', 'test/fixtures/micro-b/emission-input.json', 'test/fixtures/micro-b/rename-log.ztxt', 'test/fixtures/micro-b/manifest.json', 'test/fixtures/micro-b/emission-skeleton.golden.json'];
  return files.every(f => { const b = fs.readFileSync(join(ENG, f)); return b[0] !== 0xEF; });
})());
const backlog = txt(join(ROOT, '.scratch', 'architecture-recovery', 'BACKLOG.md'));
t('F2 BACKLOG #80 行在（票面归属）', backlog.includes('| #80 |'), '');   // 修正：原 regex 竖线未转义成交替空分支恒真——R29 同款立训复发，改 includes 判据
const adr = txt(join(ROOT, 'docs', 'adr', '0023-micro-b-file-card-architecture.md'));
t('F3 ADR-0023 在案（D-121~D-127 总成——步①实装对象）', /D-12[1-7]/.test(adr), '');

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
