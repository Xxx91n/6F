// #71 守卫——codelore 接线票·批1（D-080③ sibling 首票／D-078 映射表 v1.0 落地）
// ① 裁决面映射常量块 audit/upstream-dimension-map.ts 在且版本 v1.0＋复审两字段＋无权重列（D-084）
// ② 「映射常量↔表逐行对账」：docs/upstream-dimension-map.md §③ codelore 表行 ⇔
//    运行时常量（dist 模块为真值）——演化主干 12→S4／s3 族 6→S3 opposing／s5 族 12→S5／
//    explain 族→S4 env 门控／behavior 族→QuadrantEntry／暂缓面集不映射；行级漂移=FAIL
// ③ COLLECTOR 注册面：UPSTREAM_COLLECTOR_REGISTRY 含 codelore-adapter@v1（registered，opt_in=binary+pin）
//    ＋descriptor dimension:null 保留（ADR-0014 双保留）
// ④ Macro-B 归位：audit.ts 消费 projectUpstreamDimensions→measurements.upstream_dimension_projection
// ⑤ 「engine/skills/ 不引 docs/」断言（D-083⑤ F1 悬空指针防御——docs 不随包分发；注释指针豁免 A15 同构）
// ⑥ 引擎测试闭环：upstream-map.test.mjs 入 smoke 链＋实跑绿（test 闭环非只引入）
// 用法：node 71-check.mjs → 逐条 PASS/FAIL；exit 0=结构完整，exit 1=有 FAIL
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const ENG = join(ROOT, 'engine');
const DOC = join(ROOT, 'docs', 'upstream-dimension-map.md');
const MAP_SRC = join(ENG, 'src', 'audit', 'upstream-dimension-map.ts');
const MAP_DIST = join(ENG, 'dist', 'audit', 'upstream-dimension-map.js');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
const txt = (p) => fs.readFileSync(p, 'utf8');

// ---------- A. 常量块形制 ----------
const mapSrc = fs.existsSync(MAP_SRC) ? txt(MAP_SRC) : '';
t('A1 映射常量块在且版本 v1.0＋复审两字段（last_reviewed/next_review 同步表头）',
  mapSrc.indexOf("UPSTREAM_DIMENSION_MAP_VERSION = 'v1.0'") >= 0 && mapSrc.indexOf("last_reviewed: '2026-09-19'") >= 0 && mapSrc.indexOf("next_review: '2026-10-19'") >= 0, '');
t('A2 常量块无权重字段（D-084——映射行形制禁权重列，权重归 rubric/聚合面另立案）',
  !/\bweight\b|weight_coefficient/i.test(mapSrc), '');
let M = null;
try { M = await import(pathToFileURL(MAP_DIST).href); } catch (e) { M = null; }
t('A3 dist 模块可装载（运行时真值——常量即消费输入，非静态摆设）', !!M && M.UPSTREAM_DIMENSION_MAP_VERSION === 'v1.0', M ? '' : 'dist-missing（先跑 npm run build）');

// ---------- B. 「映射常量↔表逐行对账」（codelore §③ 表行 ⇔ 运行时常量） ----------
const doc = fs.existsSync(DOC) ? txt(DOC) : '';
const docCodelore = doc.split('## ③ codelore')[1] || '';
const docRows = docCodelore.split('\n').filter(l => /^\|[^-]/.test(l) && l.indexOf('analysis 枚举') < 0);
const CL_EVOLUTION = ['revisions', 'abs-churn', 'entity-churn', 'author-churn', 'hotspot-velocity', 'code-age', 'stale-code', 'architecture-trend', 'health-trend', 'lead-time', 'release-cadence', 'messages'];
const CL_S3 = ['god-classes', 'architecture-metrics', 'dependency-cycles', 'modularity-violations', 'instability', 'architecture-roles'];
const CL_S5 = ['ownership', 'entity-ownership', 'bus-factor', 'main-dev', 'main-dev-by-revs', 'main-dev-by-deletions', 'knowledge-islands', 'communication', 'coordination-needs', 'team-composition', 'marginal-owner-risk', 'pair-programming'];
const CL_BEHAVIOR = ['hotspots', 'coupling', 'function-hotspots'];
const docEvo = docRows.find(l => l.indexOf('演化主干') >= 0) || '';
const docS3 = docRows.find(l => l.indexOf('s3 族') >= 0) || '';
const docS5 = docRows.find(l => l.indexOf('s5 族') >= 0) || '';
const docExplain = docRows.find(l => l.indexOf('explain 族') >= 0) || '';
const docBehavior = docRows.find(l => l.indexOf('behavior 族') >= 0) || '';
const docDeferred = docRows.find(l => l.indexOf('暂缓面集') >= 0) || '';
const docEvoList = (docEvo.match(/\| ([^|]+) \| S4/) || [])[1] || '';
const evoInDoc = CL_EVOLUTION.every(a => docEvoList.indexOf(a) >= 0);
t('B1 表行「演化主干 12」枚举 ⇔ 常量 CODELORE_EVOLUTION_FACETS 同源（逐项＋S4）',
  evoInDoc && docEvo.indexOf('| S4 |') >= 0 && !!M && CL_EVOLUTION.every(a => M.resolveCodeloreAnalysis(a).dimension === 'S4' && M.resolveCodeloreAnalysis(a).admitted === true),
  'doc-enum-miss=' + CL_EVOLUTION.filter(a => docEvoList.indexOf(a) < 0).join(','));
t('B2 表行「s3 族 6」枚举 ⇔ 常量 S3＋opposing 准入（#51 双口径——单指标禁孤立入维）',
  docS3.indexOf('| S3 |') >= 0 && docS3.indexOf('opposing') >= 0 && CL_S3.every(a => docS3.indexOf(a) >= 0) &&
  !!M && CL_S3.every(a => { const r = M.resolveCodeloreAnalysis(a); return r.dimension === 'S3' && /opposing/.test(r.admission); }),
  'doc-enum-miss=' + CL_S3.filter(a => docS3.indexOf(a) < 0).join(','));
t('B3 表行「s5 族 12」枚举 ⇔ 常量 S5',
  docS5.indexOf('| S5 |') >= 0 && CL_S5.every(a => docS5.indexOf(a) >= 0) &&
  !!M && CL_S5.every(a => M.resolveCodeloreAnalysis(a).dimension === 'S5'),
  'doc-enum-miss=' + CL_S5.filter(a => docS5.indexOf(a) < 0).join(','));
t('B4 表行「explain 族」⇔ 常量 S4＋env 门控准入（未设=不产面非降级非缺失）',
  docExplain.indexOf('| S4 |') >= 0 && docExplain.indexOf('env 门控') >= 0 &&
  !!M && M.CODELORE_EXPLAIN_SURFACES.every(a => { const r = M.resolveCodeloreAnalysis(a); return r.dimension === 'S4' && /env 门控/.test(r.admission); }), '');
t('B5 表行「behavior 族」⇔ 常量 QuadrantEntry 归位（不直归 S 维——D-054③）',
  docBehavior.indexOf('QuadrantEntry') >= 0 && CL_BEHAVIOR.every(a => docBehavior.indexOf(a) >= 0) &&
  !!M && CL_BEHAVIOR.every(a => { const r = M.resolveCodeloreAnalysis(a); return r.dimension === null && r.lane === 'Macro-B-QuadrantEntry'; }), '');
t('B6 表行「暂缓面集」⇔ 常量 deferred 不映射（未激活不归位——D-035④）',
  docDeferred.indexOf('不映射') >= 0 && !!M && M.resolveCodeloreAnalysis('function-coupling').dimension === null && M.isCodeloreDeferredAnalysis('function-coupling') === true, '');
// 常量→文档反向对账：常量 codelore 分析面全在文档枚举（防幽灵行）
const docAll = docEvoList + docS3 + docS5 + docBehavior;
const phantom = M ? M.CODELORE_DIMENSION_MAP.filter(r => r.surface_kind === 'analysis').filter(r => docAll.indexOf(r.surface) < 0).map(r => r.surface) : [];
t('B7 常量 analysis 行全在文档枚举（无幽灵映射——反向对账）', phantom.length === 0, phantom.join(','));

// ---------- C. COLLECTOR 注册面 ----------
const reg = M ? M.UPSTREAM_COLLECTOR_REGISTRY : [];
const clReg = reg.find(x => x.descriptor && x.descriptor.id === 'codelore-adapter@v1');
t('C1 codelore descriptor 已注册（registered=true＋opt_in=binary+pin＋skipped 语义在）',
  !!clReg && clReg.registered === true && clReg.opt_in === 'binary+pin' && /blocked|缺席/.test(clReg.skipped_semantics), '');
const clSrc = txt(join(ENG, 'src', 'upstream', 'codelore.ts'));
t('C2 注册 descriptor=适配器原物（dimension:null 未改写＋注释指针在——ADR-0014/A15 双保留）',
  clReg && clReg.descriptor.dimension === null && clSrc.indexOf('dimension: null') >= 0 && clSrc.indexOf('upstream-dimension-map.md') >= 0, '');

// ---------- D. Macro-B 归位消费 ----------
const auditSrc = txt(join(ENG, 'src', 'audit', 'audit.ts'));
t('D1 audit.ts 消费 projectUpstreamDimensions→measurements.upstream_dimension_projection（归位=裁决面消费非 descriptor 改写）',
  auditSrc.indexOf("from './upstream-dimension-map.js'") >= 0 && auditSrc.indexOf('projectUpstreamDimensions(col.realFacts)') >= 0 && auditSrc.indexOf('upstream_dimension_projection') >= 0, '');

// ---------- E. 「engine/skills/ 不引 docs/」断言（D-083⑤ F1 悬空指针防御） ----------
// 规则：engine/{src,skills} 文件中不得含指向本仓 docs/ 树的可解析路径引用（docs 不随 tgz 分发）
//   ——注释行豁免（A15 注释指针=出处标记非路径消费）；字面量/代码内的 docs/ 或 upstream-dimension-map 引用=违规
function stripLineComments(line) {
  let q = null;
  for (let i = 0; i < line.length - 1; i++) {
    const ch = line[i];
    if (q) { if (ch === q && line[i - 1] !== '\\') q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '/' && line[i + 1] === '/') return line.slice(0, i);
  }
  return line;
}
const docRefViolations = [];
const walkCode = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'dist') walkCode(p); continue; }
    if (!/\.(ts|js|mjs|md)$/.test(e.name)) continue;
    const lines = txt(p).split('\n');
    lines.forEach((l, i) => {
      const isMd = /\.md$/.test(e.name);
      const stripped = isMd ? l : stripLineComments(l);
      // 违规面=指向本仓 docs/ 树（不随包分发）的可解析引用：
      //   ①docs/upstream-* 路径或 .md 文档名引用 ②../docs/ 相对路径 ③join(自仓基座, 'docs'...)
      // 豁免：主题仓 join(repoRoot/subject,'docs','adr') 采集面＋同名 .ts/.js 模块 import（非文档路径）
      if (/docs\/upstream-dimension-map|upstream-dimension-map\.md|\.\.[\/\\]docs[\/\\]|join\(\s*(ROOT|REPO|HERE|MA|AR|ENG)\s*,\s*'docs'|['"]docs\/(?!adr)/.test(stripped)) {
        docRefViolations.push(p.replace(ROOT + '\\', '') + ':' + (i + 1));
      }
    });
  }
};
walkCode(join(ENG, 'src'));
walkCode(join(ENG, 'skills'));
t('E1 engine/{src,skills} 无指向本仓 docs/ 树的可解析引用（upstream-dimension-map 引用仅限注释指针——D-083⑤）',
  docRefViolations.length === 0, docRefViolations.slice(0, 8).join(' '));

// ---------- F. 引擎测试闭环 ----------
const pkg = JSON.parse(txt(join(ENG, 'package.json')));
t('F1 upstream-map.test.mjs 入 smoke 链（test 闭环非只引入）', (pkg.scripts.smoke || '').indexOf('upstream-map.test.mjs') >= 0, '');
const tr = spawnSync('node', [join(ENG, 'test', 'upstream-map.test.mjs')], { encoding: 'utf8', timeout: 120000 });
t('F2 seam 测试实跑绿（' + ((tr.stdout || '').match(/UPSTREAM-MAP-TEST-OK \d+\/\d+/) || ['n/a'])[0] + '）',
  tr.status === 0 && /UPSTREAM-MAP-TEST-OK/.test(tr.stdout || ''), (tr.stderr || '').slice(0, 120));

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
