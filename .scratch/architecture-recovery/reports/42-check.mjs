// 42-check.mjs — #42 上游队列值守守卫（R5-11 / A-047 / D-023·D-034·D-035③）
// 断言面：① dump 对照评估落文（42-dump-comparison.md 在＋三轴字段＋呈报结论＋先例≥2＋实物枚举锚）
//         ② probe 证据档案（42-probe.mjs＋measurements＋六件只读档案，dump 面形态逐字段）
//         ③ upstream-lock.yaml sqlite-dump 行=evaluating＋注记指向评估文档（不翻状态不越权）
//         ④ registry Scorecard/repomix 探针条目=层需求拉动（pending＋触发条件字段＋manual_watch 五要素）
//         ⑤ 供应链象限「⚠ 数据未接」披露在位（39×3＋38×2 报告实物断言）
//         ⑥ 文档账本（issue/handoff/prompt/ledger/lessons/next-round/BACKLOG/日报窗口节）
//         ⑦ BOM 检查
// 纪律：只读断言（唯一外部调用=零；全部文件断言）；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const AR = join(REPO, '.scratch', 'architecture-recovery');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
function parseLock(p) {
  const out = { meta: {}, upstreams: [] };
  let cur = null;
  for (const raw of txt(p).split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) { continue; }
    if (!line.startsWith(' ')) {
      const top = line.match(/^([a-z_]+):\s*(.*)$/);
      if (top && top[1] !== 'upstreams') { out.meta[top[1]] = top[2].trim(); }
      cur = null;
      continue;
    }
    const item = line.match(/^\s+-\s+([a-z_]+):\s*(.*)$/);
    if (item) { cur = {}; cur[item[1]] = item[2].trim().replace(/^"|"$/g, ''); out.upstreams.push(cur); continue; }
    const kv = line.match(/^\s+([a-z_]+):\s*(.*)$/);
    if (kv && cur) { cur[kv[1]] = kv[2].trim().replace(/^"|"$/g, ''); }
  }
  return out;
}

// ---------- A. dump 对照评估落文 ----------
const cmpP = join(HERE, '42-dump-comparison.md');
const cmp = existsSync(cmpP) ? txt(cmpP) : '';
t('A1 42-dump-comparison.md 在位', existsSync(cmpP) && cmp.length > 2000);
t('A2 三轴标题齐（字段覆盖度/语义翻译面厚度/golden 可测性）', ['字段覆盖度', '语义翻译面厚度', 'golden 可测性'].every(k => cmp.indexOf(k) >= 0));
t('A3 dump 面形态实物枚举在（sqlite: full fact-store dump / parquet 3 面 / provenance 表 / schema_v8）', cmp.indexOf('full fact-store dump') >= 0 && cmp.indexOf('schema_v8') >= 0 && cmp.indexOf('provenance') >= 0);
t('A4 轴①层级错位结论在（dump=ingest 原料层 vs 契约=分析产出层，契约字段覆盖 0/30）', cmp.indexOf('0/30') >= 0 && cmp.indexOf('层级错位') >= 0);
t('A5 轴②上游语义须复刻清单在（mailmap/canonical-lineage/Fisher/fdr-correction/time-bucket/knowledge-model 等）', ['mailmap', 'canonical', 'Fisher', 'fdr-correction', 'time-bucket', 'knowledge-model'].every(k => cmp.indexOf(k) >= 0));
t('A6 轴②结构性冲突点名（ADR-0014 适配层禁放业务规则/raw 语义不出适配层）', cmp.indexOf('ADR-0014') >= 0 && cmp.indexOf('业务规则') >= 0);
t('A7 轴③golden 钉非契约面结论在（schema_v8 内部非公开契约面/golden 降级）', cmp.indexOf('非契约面') >= 0 && cmp.indexOf('golden') >= 0);
t('A8 工业先例 ≥2 个（K8s etcd/Terraform/GitLab/GH Archive/CodeQL-SARIF）', ['etcd', 'Terraform', 'GitLab', 'GH Archive', 'SARIF'].filter(k => cmp.indexOf(k) >= 0).length >= 2);
t('A9 呈报结论在（维持逐面契约＋不采纳为事实输入面＋采纳须另立 ADR）', cmp.indexOf('维持逐面契约') >= 0 && cmp.indexOf('不采纳') >= 0 && cmp.indexOf('另立 ADR') >= 0);
t('A10 dump 合法域登记（诊断/调研原料用途，不进 verdict 输入面）', cmp.indexOf('verdict 输入面') >= 0 && (cmp.indexOf('诊断') >= 0 || cmp.indexOf('调研') >= 0));

// ---------- B. probe 证据档案 ----------
const probeP = join(HERE, '42-probe.mjs');
const measP = join(HERE, '42-probe-measurements.json');
t('B1 42-probe.mjs 在位且声明只读纪律（禁 analyze --output/写副作用注记）', existsSync(probeP) && txt(probeP).indexOf('只读') >= 0);
const meas = existsSync(measP) ? JSON.parse(txt(measP)) : {};
t('B2 42-probe-measurements.json 在位＋version=0.28.0（==锁表 pin）', meas.version === 'codelore 0.28.0');
t('B3 format 行实物锚（sqlite: full fact-store dump＋parquet: hotspots, revisions, summary）', (meas.analyze_format_line || '').indexOf('sqlite: full fact-store dump') >= 0 && (meas.analyze_format_line || '').indexOf('parquet: hotspots, revisions, summary') >= 0);
t('B4 内部 schema 实物锚（schema_v8 / DuckDB pin / 57 分析面＋57 行类型）', (meas.profile_schema || '').indexOf('schema_v8') >= 0 && (meas.profile_duckdb || '').indexOf('DuckDB') >= 0 && meas.analysis_enum_count === 57 && meas.schema_row_types === 57);
t('B5 docs provenance 注记实物（.provenance.json sidecar／sqlite 内嵌 provenance 表）', (meas.docs_provenance_note || '').indexOf('provenance') >= 0);
t('B6 与 #35 format 行跨票对账 drift=none', meas.format_line_drift_vs_35 === 'none');
const arch = ['42-version.txt', '42-top-help.txt', '42-analyze-help.txt', '42-docs.md', '42-schema.txt', '42-profile.txt'];
t('B7 六件只读档案齐（version/top-help/analyze-help/docs/schema/profile）', arch.every(f => existsSync(join(HERE, f))), arch.filter(f => !existsSync(join(HERE, f))).join(','));

// ---------- C. upstream-lock.yaml sqlite-dump 行注记 ----------
const lock = parseLock(join(ENG, 'upstream-lock.yaml'));
const byId = {};
for (const r of lock.upstreams) { byId[r.id] = r; }
const dumpRow = byId['codelore-sqlite-dump'] || {};
t('C1 codelore-sqlite-dump status=evaluating 维持（评估呈报不代拍翻状态）', dumpRow.status === 'evaluating');
t('C2 dump 行 contract 注记指向 42-dump-comparison.md＋结论（维持逐面契约）', (dumpRow.contract || '').indexOf('42-dump-comparison.md') >= 0 && (dumpRow.contract || '').indexOf('维持逐面契约') >= 0);
t('C3 dump 行 contract 保留 pin 前置＋另立 ADR 注记', (dumpRow.contract || '').indexOf('pin') >= 0 && (dumpRow.contract || '').indexOf('ADR') >= 0);
t('C4 dump 行 risk_note 含首轮评估结论（三轴裁定摘要）', (dumpRow.risk_note || '').indexOf('首轮评估') >= 0 && (dumpRow.risk_note || '').indexOf('ADR-0014') >= 0);
t('C5 dump 行 adapter=null（未接入事实链）', dumpRow.adapter === 'null');
t('C6 scorecard 行仍 planned＋adapter=null；repomix-gitingest=retired（D-056 退役销项）', byId['openssf-scorecard'] && byId['openssf-scorecard'].status === 'planned' && byId['openssf-scorecard'].adapter === 'null' && byId['repomix-gitingest'] && byId['repomix-gitingest'].status === 'retired');

// ---------- D. registry Scorecard/repomix 层需求拉动条目 ----------
const reg = JSON.parse(txt(join(HERE, '33-gate-registry.json')));
const probe = (reg.items || []).find(i => i.id === 'upstream-probes-scorecard-repomix') || {};
t('D1 registry 条目 upstream-probes-scorecard-repomix 在位', !!probe.id);
t('D2 状态=pending＋watch=manual_watch（队列登记不插队）', probe.status === 'pending' && probe.watch === 'manual_watch');
t('D3 触发条件字段齐（deadline/trigger/review_at 非空＋含「层需求拉动/满足判据」语义）', !!probe.deadline && !!probe.trigger && !!probe.review_at && probe.trigger.indexOf('层需求拉动') >= 0 && probe.deadline.indexOf('满足判据') >= 0);
t('D4 判据含接入三前置（pin_type+version＋golden 契约＋planned 行锚）', probe.deadline.indexOf('pin') >= 0 && probe.deadline.indexOf('golden') >= 0 && probe.deadline.indexOf('upstream-lock.yaml') >= 0);
t('D5 manual_watch 五要素齐（标记/责任人/复审时点/验证方法/确认记录字段）', !!probe.title && !!probe.owner && !!probe.review_at && !!probe.verify_method && Array.isArray(probe.confirmations));
t('D6 不插队纪律注记（trigger 含 ⚠ 数据未接披露制＋D-034③）', probe.trigger.indexOf('数据未接') >= 0 && probe.trigger.indexOf('D-034') >= 0);

// ---------- E. 供应链象限「⚠ 数据未接」披露在位（实物断言） ----------
const mbFiles = ['39-macro-b-env-manager.md', '39-macro-b-anysearch-cli.md', '39-macro-b-jiahao.md'];
const mcFiles = ['38-macro-c-preview-report.md', '38-macro-c-preview-failure.md'];
const allPrev = mbFiles.concat(mcFiles);
t('E1 五份 preview 报告均在位', allPrev.every(f => existsSync(join(HERE, f))), allPrev.filter(f => !existsSync(join(HERE, f))).join(','));
t('E2 Macro-B 三件披露块含「供应链象限 ⚠ 数据未接」（structural_limitations 行）', mbFiles.every(f => txt(join(HERE, f)).indexOf('供应链象限 ⚠ 数据未接') >= 0));
t('E3 Macro-B 三件 supply_chain 象限=not_applicable＋conflict_markers=data-not-connected', mbFiles.every(f => { const s = txt(join(HERE, f)); return s.indexOf('supply_chain（applicability=not_applicable）') >= 0 && s.indexOf('data-not-connected') >= 0; }));
t('E4 Macro-C 两件披露块含「供应链象限 ⚠ 数据未接」＋Scorecard/repomix 未接不插队（D-034③）', mcFiles.every(f => { const s = txt(join(HERE, f)); return s.indexOf('⚠ 数据未接') >= 0 && s.indexOf('不插队') >= 0; }));
t('E5 UNVERIFIED_MARK=「⚠ unverified」单一语义源（citation.ts 定义＋generate.ts re-export，审计 C1 破环后载体迁移）＋PreviewDisclosure 契约面在', txt(join(ENG, 'src', 'report', 'citation.ts')).indexOf("UNVERIFIED_MARK = '⚠ unverified'") >= 0 && txt(join(ENG, 'src', 'report', 'generate.ts')).indexOf('export { UNVERIFIED_MARK') >= 0 && txt(join(ENG, 'src', 'report', 'generate.ts')).indexOf('PreviewDisclosure') >= 0);

// ---------- F. 文档账本收口 ----------
const issueP = join(AR, 'issues', '42-upstream-queue.md');
const issue = existsSync(issueP) ? txt(issueP) : '';
t('F1 issue#42 在且引 A-047＋R5-D11', issue.indexOf('A-047') >= 0 && issue.indexOf('R5-D11') >= 0);
t('F2 issue#42 Status=done 且 checklist 全勾', /\*\*Status:\*\* done/.test(issue) && issue.indexOf('- [ ]') < 0);
const aLedge = txt(join(AR, 'decision-ledger.md'));
t('F3 A-047 账本行 done → implemented（2026-09-16）', /A-047[^\n]*done → implemented（2026-09-16）/.test(aLedge));
const wf = txt(join(AR, 'WORKFLOW.md'));
t('F4 WORKFLOW §4 lessons 含 #42 条目', /#42/.test(wf) && /dump|上游队列/.test(wf));
const nr = txt(join(REPO, '.scratch', 'macro-audit', 'handoffs', 'next-round.md'));
t('F5 next-round 不含未闭环 #42 行（#42 已闭环——闭环凭证归 F6 BACKLOG 行）', !(nr.split('\n').some(l => /^\| T\d+/.test(l) && l.indexOf('#42') >= 0 && l.indexOf('✅') < 0)));
const bl = txt(join(AR, 'BACKLOG.md'));
t('F6 BACKLOG #42 行回写闭环', /\| #42[^\n]*✅/.test(bl));
const rep = existsSync(join(HERE, '42-report.md')) ? txt(join(HERE, '42-report.md')) : '';
t('F7 42-report.md 在且六段齐备（①~⑥）', existsSync(join(HERE, '42-report.md')) && ['①', '②', '③', '④', '⑤', '⑥'].every(m => rep.indexOf(m) >= 0));
const ma = join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md');
t('F8 macro-audit 日报含 #42 窗口节', existsSync(ma) && txt(ma).indexOf('窗口：#42') >= 0);

// ---------- G. BOM ----------
const newFiles = [
  cmpP, probeP, measP,
  arch.map(f => join(HERE, f)),
  join(HERE, '42-check.mjs'), join(HERE, '42-report.md'),
  join(ENG, 'upstream-lock.yaml'), join(HERE, '33-gate-registry.json'),
  issueP, join(AR, 'decision-ledger.md'), join(AR, 'WORKFLOW.md'),
  nr, bl, ma
].flat();
t('G1 全部新增/改动文件无 BOM', newFiles.every(f => !existsSync(f) || noBom(f)), newFiles.filter(f => existsSync(f) && !noBom(f)).join(','));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
