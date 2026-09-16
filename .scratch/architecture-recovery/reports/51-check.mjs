// 51-check.mjs — #51 Macro-B behavior 象限守卫（R9-02 / A-058 / D-054）
// 断言面：A 面集源契约 → B 实物 schema 留痕 → C 判据产物（criteria/报告/facts/duckdb/测量）
//   → D 判据复跑（committed facts 离线重评估=确定性回放）→ E 能力矩阵收窄+文档 → F registry/账本 → G BOM
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const AR = join(REPO, '.scratch', 'architecture-recovery');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
const j = (p) => JSON.parse(txt(p));

// ---------- A. 面集源契约 ----------
const cs = txt(join(ENG, 'src', 'upstream', 'codelore.ts'));
t('A1 CODELORE_BEHAVIOR_FACETS 存在', cs.includes('CODELORE_BEHAVIOR_FACETS'));
t('A2 三面集=hotspots/coupling/function-hotspots group=behavior', /hotspots'.*behavior/s.test(cs) && /coupling'.*behavior/s.test(cs) && /function-hotspots'.*behavior/s.test(cs));
t('A3 CodeloreFacetGroup 含 behavior', cs.includes("'behavior'"));
t('A4 function-coupling 暂缓注记在源（--target 面形态）', cs.includes('function-coupling') && cs.includes('--target'));
t('A5 quadrant 归位规则注记在源（切片决策 D-054③）', cs.includes('切片决策') || cs.includes('归位'));
const NAR = await import(pathToFileURL(join(ENG, 'dist', 'upstream', 'codelore.js')).href);
t('A6 dist 导出 CODELORE_BEHAVIOR_FACETS 长 3', NAR.CODELORE_BEHAVIOR_FACETS && NAR.CODELORE_BEHAVIOR_FACETS.length === 3);

// ---------- B. schema 留痕 ----------
const schPath = join(HERE, '51-behavior-schema.json');
t('B1 51-behavior-schema.json 在', existsSync(schPath));
const sch = existsSync(schPath) ? j(schPath) : { faces: {} };
t('B2 三面列集留痕（hotspots/coupling/function-hotspots）', !!(sch.faces && sch.faces.hotspots && sch.faces.coupling && sch.faces['function-hotspots']));
t('B3 hotspots 列含 revisions+hotspot_score', (sch.faces.hotspots || []).includes('revisions') && (sch.faces.hotspots || []).includes('hotspot_score'));
t('B4 coupling 列含 entity_a/entity_b/degree/fisher_p', ['entity_a', 'entity_b', 'degree', 'fisher_p'].every(c => (sch.faces.coupling || []).includes(c)));
t('B5 codelore_version=0.28.0（pin 一致）', sch.codelore_version === '0.28.0');

// ---------- C. 判据产物 ----------
const CRIT = join(HERE, '51-behavior-criteria.md');
t('C1 判据文件在＋跑后禁调声明', existsSync(CRIT) && txt(CRIT).includes('预声明'));
const cr = txt(CRIT);
t('C2 判据 PC-1/TC-1/TC-2/NC-1 全在', ['PC-1', 'TC-1', 'TC-2', 'NC-1'].every(x => cr.includes(x)));
t('C3 判据含归位规则+能力矩阵措辞', cr.includes('切片决策') && cr.includes('strategy: active') && cr.includes('queued'));
['51-macro-b-env-manager-facts.jsonl', '51-macro-b-env-manager.json', '51-macro-b-env-manager.md', '51-behavior-measurements.json', '51-audit-facts.duckdb'].forEach(function (f, i) {
  t('C4-' + (i + 1) + ' 产物在：' + f, existsSync(join(HERE, f)));
});

// ---------- D. 判据离线复跑（committed facts 确定性回放） ----------
const factLines = txt(join(HERE, '51-macro-b-env-manager-facts.jsonl')).trim().split('\n').map(JSON.parse);
const facetRows = factLines.filter(f => f.metric === 'codelore.facet_rows').map(f => JSON.parse(f.value_json));
const hf = facetRows.find(v => v.analysis === 'hotspots');
const cf = facetRows.find(v => v.analysis === 'coupling');
const ff = facetRows.find(v => v.analysis === 'function-hotspots');
t('D1 三面 facet_rows 事实齐备', facetRows.length === 3 && !!hf && !!cf && !!ff);
t('D2 PC-1 复跑：三面 row_count>0', facetRows.every(v => v.row_count > 0));
t('D3 TC-1 复跑：hotspots min(revisions)>=5', hf && hf.rows.every(r => r.revisions >= 5));
t('D4 TC-2 复跑：coupling shared>=2&degree>0 占比>=0.5', cf && cf.rows.length > 0 && (cf.rows.filter(r => r.shared >= 2 && r.degree > 0).length / cf.rows.length) >= 0.5);
t('D5 fact.quadrant=strategic（provenance 不改写，归位在切片层）', factLines.every(f => f.quadrant === 'strategic'));
const rep = j(join(HERE, '51-macro-b-env-manager.json'));
const bq = rep.quadrants.find(q => q.quadrant === 'behavior');
t('D6 报告 behavior=native 切片且 slice_fields 八键齐备', bq && bq.applicability === 'native' && ['faces', 'face_row_counts', 'hotspot_top', 'coupling_pairs', 'min_revs', 'sample_met', 'deferred_faces', 'quadrant_assignment'].every(k => k in bq.slice_fields));
t('D7 behavior verdict=supported（判据全过）', bq && bq.verdict === 'supported');
t('D8 deferred_faces 含 function-coupling（NC-1 兑现）', bq && bq.slice_fields.deferred_faces.some(d => d.includes('function-coupling')));
t('D9 其余三象限 not_applicable+queued 理由', rep.quadrants.filter(q => q.quadrant !== 'behavior').every(q => q.applicability === 'not_applicable' && /queued|本票/.test(q.verdict_gate.override_reason || '')));
t('D10 citation_checks 全 supports（证据锚逐字命中）', rep.citation_checks.length === 3 && rep.citation_checks.every(c => c.support === 'supports'));
t('D11 min_revs=5 预声明阈值写入切片字段', bq && bq.slice_fields.min_revs === 5 && bq.slice_fields.sample_met === true);

// ---------- E. 能力矩阵收窄 ----------
const rd = txt(join(REPO, 'README.md'));
t('E1 README 象限矩阵：strategy:active·behavior:preview·structure:queued·supply-chain:queued', /strategy:?\s*active/.test(rd) && /behavior:?\s*preview/.test(rd) && /structure:?\s*queued/.test(rd) && /supply-chain:?\s*queued/.test(rd));
const skm = txt(join(ENG, 'skills', 'macro-audit', 'SKILL.md'));
t('E2 SKILL.md 能力矩阵措辞同步收窄', /behavior=preview|behavior:?\s*preview/.test(skm) && /queued/.test(skm));
const led = txt(join(AR, 'decision-ledger.md'));
t('E3 A-058 行在且标 implemented', /\| A-058 \|[^\n]*implemented/.test(led));
const ml = txt(join(REPO, '.scratch', 'macro-audit', 'decision-ledger.md'));
t('E4 D-035 勘误注记在（faces 消费侧扩展 Macro-B behavior）', /勘误注记[^\n]*D-054⑤/.test(ml) && ml.slice(ml.indexOf('勘误注记')).includes('hotspots'));
t('E5 BACKLOG #51 ✅', /\| #51[^\n]*✅/.test(txt(join(AR, 'BACKLOG.md'))));
t('E6 票档三件套', ['issues/51-macro-b-behavior.md', 'prompts/51-macro-b-behavior.md', 'handoffs/51-macro-b-behavior.md'].every(f => existsSync(join(AR, f))));
t('E7 51-report.md 在且含判据复盘面', existsSync(join(HERE, '51-report.md')) && txt(join(HERE, '51-report.md')).includes('supported'));

// ---------- F. registry + 实跑一致性 ----------
const reg = j(join(HERE, '33-gate-registry.json'));
const dep = reg.items.find(i => i.id === 'codelore-deferred-faces');
t('F1 deferred-faces 留 #51 确认（partial-activation-noted）', (dep.confirmations || []).some(c => /partial-activation-noted/.test(c.decision)));
const meas = j(join(HERE, '51-behavior-measurements.json'));
t('F2 测量工件 verdict=supported＋判据四键全 true', meas.verdict === 'supported' && meas.criteria.PC1 === true && meas.criteria.TC1 === true && meas.criteria.TC2 === true && meas.criteria.NC1 === true);
t('F3 测量 min_revs_threshold=5', meas.min_revs_threshold === 5);
const md = txt(join(HERE, '51-macro-b-env-manager.md'));
t('F4 md 报告含 behavior 章＋披露块', md.includes('behavior') && md.includes('capability 1 of 5'));

// ---------- G. BOM ----------
const allF = [join(ENG, 'src', 'upstream', 'codelore.ts'), CRIT, join(HERE, '51-macro-b-behavior.mjs'), join(HERE, '51-check.mjs'), join(HERE, '51-report.md'), schPath, join(HERE, '51-macro-b-env-manager-facts.jsonl'), join(HERE, '51-macro-b-env-manager.json'), join(HERE, '51-macro-b-env-manager.md'), join(HERE, '51-behavior-measurements.json')];
t('G1 全部新增/改动文件无 BOM', allF.every(noBom), allF.filter(f => !noBom(f)).join(','));

console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
