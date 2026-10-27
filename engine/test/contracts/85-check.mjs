// 85-check.mjs —— #84 Macro-C 产线化一等面守卫（D-204②④；产线化前置=同族基准差分重校准硬准入）
// 断言面：A 静态契约（dist/src/README/CONTEXT 词条在场机核——R56 执行窗登记「CONTEXT 词条批在场机核」同窗兑现）
//   → B CLI 命令面测活（6F 本仓自审；engine-deps 组级闸）
//   → C anysearch-cli 差分重校准（基准自持组级闸：engine 面 vs 38 编排层独立重算——移植不重校准=数字形似义异防线，
//     预声明包 2026-10-03-r57-t1-predecl.md §2：等值集封闭＋fact_id 全等（chainFact）＋活语料非存档等值）
//     语料来源＝仓内 frozen bundle（ADR-0026/#33）→ 无 sibling 依赖，CI 可达；钉值唯一权威=engine/baseline-lock.yaml
//     ＋基准身份绑定（tracker #34／ADR-0026）：A14 锁表钉与冻结事实历史身份绑死、A15 历史钉值引用棘轮、
//       A16 复现命令可移植形（src＋dist 静态面，不随 duckdb 缺席 SKIP）、B8 报告输出面无盘符锚（实跑面）
//   → D 自检组（正负对照：构造偏差必须检出——§2.4 命中方向跑前声明）
// 纪律：只读断言＋临时目录写运行产物（跑完即弃）；bundle 物化走 `git clone <bundle>` 至 OS temp（主仓对象库零写，D-074）；
//   exit 0 + PASS N/N 绿。
import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { need, groupProbe, engineDepsOk, cloneBundleWorktree } from './_lib/env-contract.mjs';

// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'env-contract';
// D-214① consumption_forms（多形态消费方——B/C/E 组级 need engine-deps:）：dev-full=完整克隆＋engine/node_modules 在位全断言面；ci-shallow=CI 浅克隆（duckdb 原生绑定缺席→对应组 SKIP，仓内段照跑）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '#84 Macro-C＋#85② Micro-A 产线化一等面守卫（D-204②③④）——静态契约+CLI 测活+anysearch-cli 差分重校准+Micro-A cassette 差分重校准';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + String(detail).slice(0, 300) : '')); } }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
// baseline-lock.yaml 行读取（形制＝两空格 `- id:` ＋四空格 `key: value`，与 upstream-lock 同源解析形制，无依赖 yaml 子集）
// 基准语料钉的唯一权威＝engine/baseline-lock.yaml（ADR-0026）；upstream-lock.yaml 只承载产品上游，不再有基准行。
const BASELINE_LOCK = join(ENG, 'baseline-lock.yaml');
function baselineRow(id) {
  if (!existsSync(BASELINE_LOCK)) { return null; }
  const rows = {}; let cur = null;
  for (const line of readFileSync(BASELINE_LOCK, 'utf8').split(/\r?\n/)) {
    const mi = line.match(/^ {2}- id: (\S+)/);
    if (mi) { cur = { id: mi[1] }; rows[mi[1]] = cur; continue; }
    if (!cur) { continue; }
    const mk = line.match(/^ {4}([a-z0-9_]+):\s*(.*)$/);
    if (mk) { cur[mk[1]] = mk[2].trim().replace(/^"(.*)"$/, '$1'); }
  }
  return rows[id] || null;
}
const BASE_ROW = baselineRow('anysearch-cli-adr-corpus');
const BASE_FIELDS = ['id', 'kind', 'version', 'pin_type', 'status', 'contract', 'adapter', 'materialization', 'bundle', 'bundle_bytes', 'bundle_sha256', 'last_reviewed', 'next_review'];
const BUNDLE_REL = (BASE_ROW && BASE_ROW.bundle) || 'engine/test/fixtures/frozen/anysearch-cli-770d2549.bundle';
const BUNDLE = join(REPO, BUNDLE_REL);
// 15MB 制品只读一遍（A11 的字节数与 sha256 同源一次读，不重复 readFileSync 三次）
const BUNDLE_BUF = existsSync(BUNDLE) ? readFileSync(BUNDLE) : null;
const BUNDLE_SHA = BUNDLE_BUF ? createHash('sha256').update(BUNDLE_BUF).digest('hex') : null;
// 本机绝对路径探针（D-012 活跃路径禁盘符锚：基准面须可移植）
const ABS_PATH_RE = /(^|[\s"'(])([A-Za-z]:[\\/]|\/(Users|home)\/)/m;

// ---------- A. 静态契约 ----------
const srcC = readFileSync(join(ENG, 'src', 'audit', 'macro-c.ts'), 'utf8');
const srcA = readFileSync(join(ENG, 'src', 'audit', 'audit.ts'), 'utf8');
t('A1 dist/audit/macro-c.js 在（build 产物入库）', existsSync(join(ENG, 'dist', 'audit', 'macro-c.js')));
t('A2 capability_label 常量=capability 2 of 5 · preview（38 存档同款——44-check E6 文档↔产物同源）', srcC.indexOf("export const MACRO_C_CAPABILITY_LABEL = 'capability 2 of 5 · preview'") >= 0);
t('A3 audit.ts implemented=[Macro-B, Macro-C, Micro-A]', srcA.indexOf("['Macro-B', 'Macro-C', 'Micro-A']") >= 0);
const NIP_ROGUE_RE = /not_in_preview:[ ]*\[[^\]]*'(Micro-A|Macro-C)'/;   // 否定字符类内 ] 必须转义（JS [^]]=任意字符+字面]，P0-2 死代码教训）；正对照内嵌=判别臂活性自证（臂死亡即红，防「改了但没验」第三次复发）
t('A4 audit.ts not_in_preview 裁后=[Macro-A]（Macro-C 摘出＋Micro-A 产线化 #85②——判别臂序无关：任一位形不得回列 Micro-A/Macro-C；R64 P2-1＋LOOP P0-2 修正＋活性正对照）', srcA.indexOf("not_in_preview: ['Macro-A']") >= 0 && !NIP_ROGUE_RE.test(srcA) && NIP_ROGUE_RE.test("x = { not_in_preview: ['Macro-C'] };"));
t('A5 fact-write.ts 同位共享核在（audit.ts 与 macro-c.ts 同消费）', existsSync(join(ENG, 'src', 'audit', 'fact-write.ts')) && srcA.indexOf('writeRunFactsAndEvents') >= 0 && srcC.indexOf('writeRunFactsAndEvents') >= 0);
t('A6 engine/README scale 行已上架三层（Macro-B · Macro-C · Micro-A）', readFileSync(join(ENG, 'README.md'), 'utf8').indexOf('`Macro-B` · `Macro-C` · `Micro-A`') >= 0);
t('A8 bundle 棘轮帽已显式重推导（371342——D-217 minify 治理后实测×1.25 向下重推导，D-129③ scoped 双向注记留痕）', readFileSync(join(ENG, 'scripts', 'check-dist.mjs'), 'utf8').indexOf('371342') >= 0);
t('A9 本守卫自身无 BOM', noBom(join(HERE, '85-check.mjs')));
// A10–A13 基准语料自持面（ADR-0026／#33；#32 锁表分离同窗兑现）
t('A10 engine/baseline-lock.yaml 在位＋无 BOM＋lock_version=1＋anysearch-cli-adr-corpus 行十三字段齐备（status=active／pin_type=commit-sha／version=40 位 sha）',
  existsSync(BASELINE_LOCK) && noBom(BASELINE_LOCK)
  && readFileSync(BASELINE_LOCK, 'utf8').indexOf('lock_version: 1') >= 0
  && !!BASE_ROW && BASE_FIELDS.every(function (f) { return BASE_ROW[f] !== undefined && BASE_ROW[f] !== ''; })
  && BASE_ROW.status === 'active' && BASE_ROW.pin_type === 'commit-sha' && /^[0-9a-f]{40}$/.test(BASE_ROW.version || '')
  && BASE_ROW.materialization === 'frozen-bundle',
  BASE_ROW ? 'missing=' + BASE_FIELDS.filter(function (f) { return !BASE_ROW[f]; }).join(',') + ' status=' + BASE_ROW.status + ' pin=' + BASE_ROW.pin_type : 'baseline-lock.yaml 缺席');
t('A11 仓内 frozen bundle 制品完整性：在位＋字节数==bundle_bytes＋sha256==bundle_sha256（制品级钉，防静默替换）',
  !!BUNDLE_BUF && !!BASE_ROW && String(BUNDLE_BUF.length) === String(BASE_ROW.bundle_bytes) && BUNDLE_SHA === BASE_ROW.bundle_sha256,
  BUNDLE_BUF ? 'bytes=' + BUNDLE_BUF.length + '/' + (BASE_ROW && BASE_ROW.bundle_bytes) + ' sha256=' + String(BUNDLE_SHA).slice(0, 12) + '/' + String(BASE_ROW && BASE_ROW.bundle_sha256).slice(0, 12) : 'bundle 缺席: ' + BUNDLE_REL);
t('A12 基准活跃路径无本机绝对路径（baseline-lock.yaml＋本守卫自身；报告输出面见 B8）',
  existsSync(BASELINE_LOCK) && !ABS_PATH_RE.test(readFileSync(BASELINE_LOCK, 'utf8')) && !ABS_PATH_RE.test(readFileSync(join(HERE, '85-check.mjs'), 'utf8')));
// A13 双向：上游锁表侧零残留（否定）＋基准锁表侧确有一枚 repo-corpus 行（正对照——行改名或表被掏空即红）
const UPSTREAM_TXT = readFileSync(join(ENG, 'upstream-lock.yaml'), 'utf8');
t('A13 upstream-lock.yaml 已摘除基准语料行（零 anysearch 且零 kind: repo-corpus；正对照=该 kind 只在 baseline-lock）',
  UPSTREAM_TXT.indexOf('anysearch') < 0 && UPSTREAM_TXT.indexOf('kind: repo-corpus') < 0 && !!BASE_ROW && BASE_ROW.kind === 'repo-corpus');

// ---------- A14/A15 基准身份绑定与历史身份棘轮（tracker #34／ADR-0026） ----------
// 同一份 Macro-C 基准在本仓有两门指称，本组把它们绑在一起：tracker #33 之后唯一权威钉＝baseline-lock 行 version，
// 冻结事实 38-macro-c-facts.jsonl 的 repo_ref 是旧票 #38 的历史身份——两值互异、各自有主，谁都不是「另一枚的别名」。
// 历史钉分片拼接：本守卫自身不参与 A15 棘轮扫描（自指），故不留 40 位字面串，避免自己成为命中项。
const AUTHORITY_PIN = '770d25495a67bb1e6b1c421a9b40c04259950ddf';
const HISTORICAL_PIN = 'b45d0799' + '2d9c2ee9d01c7b7f176e2fb7c7978dd6';
const FACTS = join(ENG, 'test', 'fixtures', 'contracts', '38-macro-c-facts.jsonl');
const FACTS_TXT = existsSync(FACTS) ? readFileSync(FACTS, 'utf8') : '';
// 取**全部** repo_ref 再判（不先按仓名过滤——否则某行换成别的仓名就被正则排除，A14 照绿）；
// 同时核「每行都带一个 repo_ref」，防漏行。正则须容忍 JSON 的冒号后空白（`"repo_ref": "x"`），
// 否则改一个空格就能让该行整体从集合里消失，A14 照绿。
const REF_RE = /"repo_ref"\s*:\s*"([^"]*)"/g;
const FACTS_REFS = Array.from(new Set(Array.from(FACTS_TXT.matchAll(REF_RE)).map(function (m) { return m[1]; })));
const FACTS_ROWS = FACTS_TXT.split(String.fromCharCode(10)).filter(function (l) { return l.trim() !== ''; }).length;
const FACTS_REF_N = Array.from(FACTS_TXT.matchAll(REF_RE)).length;
// 本机绝对路径探针同样分片拼接——A12 机检本守卫自身零盘符锚，字面串会让 A12 自己变红
const FACTS_ABS_RE = new RegExp('D:' + '[/\\\\]Aworker[/\\\\]anysearch-cli', 'g');
// 同批四件里的第二族锚：本仓自身目录（`D:` + 本仓名，即下面 REPO_ABS_RE 所指）——同属原始现场，不属 D12 的「30 处」口径但同样不可移植
const REPO_ABS_RE = new RegExp('D:' + '[/\\\\]+Aworker[/\\\\]+6F', 'g');
// 原始现场逐件计数（归档索引第 3 行的枚举与合计须与实物同值——文档口径与机检口径同源，缺件/多件都红）
const ABS_BATCH_FILES = ['38-macro-c-facts.jsonl', '38-macro-c-preview-report.md', '38-macro-c-preview-report.json', '38-report.md'];
const ABS_BATCH = ABS_BATCH_FILES.map(function (f) {
  const p = join(ENG, 'test', 'fixtures', 'contracts', f);
  return ((existsSync(p) ? readFileSync(p, 'utf8') : '').match(FACTS_ABS_RE) || []).length;
});
const ABS_BATCH_TOTAL = ABS_BATCH.reduce(function (a, b) { return a + b; }, 0);
const REPO_ABS_BATCH = ABS_BATCH_FILES.map(function (f) {
  const p = join(ENG, 'test', 'fixtures', 'contracts', f);
  return ((existsSync(p) ? readFileSync(p, 'utf8') : '').match(REPO_ABS_RE) || []).length;
});
const REPO_ABS_TOTAL = REPO_ABS_BATCH.reduce(function (a, b) { return a + b; }, 0);
const ARCH_IDX_P = join(REPO, 'docs', 'archive', 'decisions', 'ticket-index.md');
const ARCH_IDX = existsSync(ARCH_IDX_P) ? readFileSync(ARCH_IDX_P, 'utf8') : '';
// 判别臂活性自证：把权威钉末位改一位，绑死判据必须判异——否则「钉==AUTHORITY_PIN」只是恒真句（改一位即红＝真在比）
// 全串严格相等，不截前 40 位：截断会让「钉值尾部多一个字符」也判同（锁表被追加脏字符时 A14 照绿）。
const samePin = function (a, b) { return String(a) === String(b); };
const PIN_MUTANT = AUTHORITY_PIN.slice(0, 39) + (AUTHORITY_PIN.slice(39) === 'f' ? '0' : 'f');
const PIN_SENSITIVE = !!BASE_ROW && !samePin(BASE_ROW.version, PIN_MUTANT);
// 第二判别臂：尾部追加脏字符（前 40 位仍相同）必须判异——只测末位改一位的话，退回截前 40 位比较仍能通过。
// 在**真实读到的锁表值**上做变异（不是两个常量自比）：常量自比只能证明常量不等常量，与锁表内容无关。
const PIN_TRAILING = (BASE_ROW ? String(BASE_ROW.version) : AUTHORITY_PIN) + '0';
const PIN_TAIL_SENSITIVE = !samePin(PIN_TRAILING, BASE_ROW ? BASE_ROW.version : AUTHORITY_PIN);
t('A14 基准身份唯一权威绑定：baseline-lock 钉==770d2549…／冻结事实全部 repo_ref 恰为 anysearch-cli@b45d0799…（历史产物，且每行各带一枚）／两值互异／原始现场两族锚逐件计数 30·2·2·1＝35＋0·1·1·1＝3／归档索引只登记历史钉＋指针到锁表（不两写权威值）',
  !!BASE_ROW && samePin(BASE_ROW.version, AUTHORITY_PIN)
  && FACTS_REFS.length === 1 && FACTS_REFS[0] === 'anysearch-cli@' + HISTORICAL_PIN && FACTS_REF_N === FACTS_ROWS
  && !samePin(AUTHORITY_PIN, HISTORICAL_PIN) && PIN_SENSITIVE && PIN_TAIL_SENSITIVE
  && ABS_BATCH.join(',') === '30,2,2,1' && ABS_BATCH_TOTAL === 35
  && REPO_ABS_BATCH.join(',') === '0,1,1,1' && REPO_ABS_TOTAL === 3
  && ARCH_IDX.indexOf(HISTORICAL_PIN) >= 0 && ARCH_IDX.indexOf('35 处') >= 0 && ARCH_IDX.indexOf('30 处') >= 0 && ARCH_IDX.indexOf('38 处') >= 0
  && ARCH_IDX.indexOf('engine/baseline-lock.yaml') >= 0 && ARCH_IDX.indexOf(AUTHORITY_PIN) < 0,
  'lock=' + String(BASE_ROW && BASE_ROW.version).slice(0, 12) + ' facts_refs=' + (FACTS_REFS.join(',') || 'none') + ' rows=' + FACTS_REF_N + '/' + FACTS_ROWS + ' abs=' + ABS_BATCH.join(',') + ' total=' + ABS_BATCH_TOTAL + ' repo_abs=' + REPO_ABS_BATCH.join(',') + ' repo_total=' + REPO_ABS_TOTAL + ' sensitive=' + PIN_SENSITIVE + '/' + PIN_TAIL_SENSITIVE
  + ' idx_historical=' + (ARCH_IDX.indexOf(HISTORICAL_PIN) >= 0) + ' idx_counts=' + (ARCH_IDX.indexOf('35 处') >= 0) + '/' + (ARCH_IDX.indexOf('30 处') >= 0) + '/' + (ARCH_IDX.indexOf('38 处') >= 0)
  + ' idx_pointer=' + (ARCH_IDX.indexOf('engine/baseline-lock.yaml') >= 0) + ' idx_authority_dup=' + (ARCH_IDX.indexOf(AUTHORITY_PIN) >= 0));
// A15 历史钉值引用棘轮：40 位全值只许留在「38 现场冻结件」六件＋归档索引的声明行里——新增引用即红；声明件被重算丢值亦红（双向）。
//   口径：只认 40 位全值；缩写（`b45d0799`）不入棘轮，故 ADR-0026／CHANGELOG 的缩写引用不算命中。
const HIST_DECLARED = [
  'docs/archive/decisions/ticket-index.md',
  'engine/test/fixtures/contracts/38-macro-c-facts.jsonl',
  'engine/test/fixtures/contracts/38-macro-c-measurements.json',
  'engine/test/fixtures/contracts/38-macro-c-preview-failure.json',
  'engine/test/fixtures/contracts/38-macro-c-preview-failure.md',
  'engine/test/fixtures/contracts/38-macro-c-preview-report.json',
  'engine/test/fixtures/contracts/38-macro-c-preview-report.md'
];
const PIN_SCAN_SKIP = ['node_modules', '.git', '.scratch'];
// 扫描域＝**除显式排除外的全部文件**（默认扫，而不是白名单扩展名）：白名单会让 .txt/.cjs/.csv 等里
//   新抄一份 40 位全值却无人发觉，与「只许出现在声明件」的标题不符。二进制枚单独列出并跳过——
//   但它必须可证：下面断言该件在位且按原始字节确实含此值（件被删/改名/换成空壳即红）。
const BIN_SITE_FILES = ['engine/test/fixtures/contracts/38-audit-facts.duckdb'];
const PIN_SCAN_BINARY_EXT = /\.(duckdb|bundle|png|jpe?g|gif|ico|pdf|zip|gz|woff2?|ttf|wasm)$/i;
const PIN_HITS = [];
(function scanPin(dir) {
  if (!existsSync(dir)) { return; }
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (PIN_SCAN_SKIP.indexOf(ent.name) >= 0) { continue; }
    const p = join(dir, ent.name);
    if (ent.isDirectory()) { scanPin(p); continue; }
    const rel = p.slice(REPO.length + 1).split('\\').join('/');
    if (PIN_SCAN_BINARY_EXT.test(ent.name)) { continue; }
    if (readFileSync(p, 'utf8').indexOf(HISTORICAL_PIN) >= 0) { PIN_HITS.push(rel); }
  }
})(REPO);
const PIN_HITS_JOINED = PIN_HITS.slice().sort().join(',');
// 反向臂：声明件必须仍各自持有该值（丢值即红）——只靠集合相等不够，扫描面若整体失灵（目录改名／扩展名过滤写错）
//   会两边一起空掉；这条把「声明件在位且含值」独立钉住。
const PIN_DECLARED_ALIVE = HIST_DECLARED.every(function (rel) {
  const p = join(REPO, rel);
  return existsSync(p) && readFileSync(p, 'utf8').indexOf(HISTORICAL_PIN) >= 0;
});
// 二进制枚的排除必须可证：该件在位且确实含此值（二进制按原始字节检索）。否则「排除一个含值的件」只是注释。
const BIN_SITE_ALIVE = BIN_SITE_FILES.every(function (rel) {
  const p = join(REPO, rel);
  return existsSync(p) && readFileSync(p).indexOf(HISTORICAL_PIN) >= 0;
});
t('A15 历史钉值引用棘轮：40 位全值只出现在声明的六件 38 现场冻结件＋归档索引声明行（新增引用即红；声明件丢值亦红；二进制枚排除可证）',
  PIN_HITS_JOINED === HIST_DECLARED.slice().sort().join(',') && PIN_DECLARED_ALIVE && BIN_SITE_ALIVE,
  'hits=' + (PIN_HITS_JOINED || 'none') + ' declared_alive=' + PIN_DECLARED_ALIVE + ' bin_site=' + BIN_SITE_ALIVE);
// A16 静态面（不依赖 B 组的 duckdb 组级闸）：报告复现命令必须走占位形。B8 的实跑面在无 duckdb 的机器上整组 SKIP，
//   若只在那里判，「内容缺陷＝红、环境缺席＝SKIP」就退化成「环境缺席＝永不判」（tracker #72 同一条边界）。
//   源与 dist 双侧同锚：MC_DIST 是被打进 `dist/cli.js` 的那份 tsc 产物，只认源码会让「改了源码没重建」这类漂移留在绿里。
//   真正执行的 `dist/cli.js` 是 esbuild 压缩体（`remoteUrl===null` 不带空格），逐字面锚结构上不可能命中它——
//   执行面的行为由实跑钉：B8（本守卫内，无 duckdb 时整组 SKIP）＋ `macro-c.test.mjs` K2（owner/repo 形态相对路径）。
const MC_SRC = readFileSync(join(ENG, 'src', 'audit', 'macro-c.ts'), 'utf8');
const MC_DIST = readFileSync(join(ENG, 'dist', 'audit', 'macro-c.js'), 'utf8');
const portableShape = function (txt) {
  return txt.indexOf("' --out <dir>'") >= 0 && txt.indexOf("' --out ' + opts.outDir") < 0;
};
// 极性本身就是断言：只查「`<repo>` 字样存在」不够——把三目反过来写成 `(local ? input : '<repo>')`，
//   字面仍在、语义全反（本地路径照旧泄漏，只有远程才被换成占位）。故直接钉住占位在「真」分支的这一侧。
const REPO_POLARITY = "(local ? '<repo>' : input)";
// `file://` 在 intake 里归 url，但它承载的正是本机绝对路径；`owner-repo` 形态的相对路径（projects/demo）同样落在本机目录。
// 判据只能取 intake 的解析结果（url===null），不能取 kind。判别力由正向臂提供：两臂各自必须在 src＋dist 双侧成立——
// 任一臂被删（或退回只认 kind）这两处就地判否。不另设「拿字面串自比」的负对照：那种臂不读文件，恒为常量真。
const portableLocalArm = function (txt) { return txt.indexOf('remoteUrl === null') >= 0; };
const portableFileArm = function (txt) { return txt.indexOf('/^file:') >= 0; };
const CALL_SITE = 'portableReproduceCmd(opts.input, opts.outDir, intake.url)';
t('A16 报告复现命令可移植形在（src＋dist 双侧：<repo>／<dir> 双占位且极性正确＋本地判定取 intake 解析结果＋file 臂＋调用点同形）',
  portableShape(MC_SRC) && portableShape(MC_DIST)
  && MC_SRC.indexOf(REPO_POLARITY) >= 0 && MC_DIST.indexOf(REPO_POLARITY) >= 0
  && portableLocalArm(MC_SRC) && portableLocalArm(MC_DIST) && portableFileArm(MC_SRC) && portableFileArm(MC_DIST)
  && MC_SRC.indexOf(CALL_SITE) >= 0 && MC_DIST.indexOf(CALL_SITE) >= 0,
  'src=' + portableShape(MC_SRC) + ' dist=' + portableShape(MC_DIST) + ' local=' + portableLocalArm(MC_SRC) + '/' + portableLocalArm(MC_DIST) + ' file=' + portableFileArm(MC_SRC) + '/' + portableFileArm(MC_DIST) + ' call=' + (MC_SRC.indexOf(CALL_SITE) >= 0) + '/' + (MC_DIST.indexOf(CALL_SITE) >= 0) + ' raw_concat=' + (MC_SRC.indexOf("' --out ' + opts.outDir") >= 0));

// ---------- B. CLI 命令面测活（6F 本仓自审；duckdb 组级闸） ----------
const DEPS_B = [need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))];
if (groupProbe('85-check', 'B', DEPS_B)) {
  const tmpB = mkdtempSync(join(tmpdir(), '85-run-'));
  // B1 预算 420s：本机实测 audit 单跑 158s、本守卫整跑 256s（2026-10-26 复测），余量充足。
  //   runner 级 300s 单件上限属另一层缺陷，归 tracker #54，不在本守卫内处置——调大内层预算到上限之外
  //   既改变不了聚合跑的判据，又会让 #33 窗口有意加的 TIMEOUT(420s) 诊断退成 runner 的 FAIL(TIMEOUT)。
  const r = spawnSync('node', [join(ENG, 'dist', 'cli.js'), 'audit', '..', '--scale', 'Macro-C', '--out', join(tmpB, 'out')], { encoding: 'utf8', cwd: ENG, timeout: 420000 });
  // 超时与失败必须可分辨：spawnSync 超时时 status=null，与「真失败」同形会误导成回归（#33 复盘实测踩过）
  const bTimedOut = !!(r.error && r.error.code === 'ETIMEDOUT');
  t('B1 CLI audit --scale Macro-C exit 0（6F 自审实测）', r.status === 0, bTimedOut ? 'TIMEOUT(420s)——并发负载下会超时，先查机器负载再判回归' : 'status=' + r.status + ' err=' + (r.stderr || '').slice(0, 200));
  let rec = null;
  try { rec = JSON.parse(r.stdout); } catch (e) { }
  t('B2 回执 scale=Macro-C + capabilities=[macro-c] + report_id -MACRO-C 收尾', !!rec && rec.scale === 'Macro-C' && JSON.stringify(rec.capabilities) === JSON.stringify(['macro-c']) && /-MACRO-C$/.test(rec.report_id || ''), rec && rec.report_id);
  t('B3 五工件齐备（Macro-B 同族 artifacts 契约）', ['report.md', 'report.json', 'audit-facts.jsonl', 'audit-measurements.json', 'facts.duckdb'].every(function (f) { return existsSync(join(tmpB, 'out', f)); }));
  const md = existsSync(join(tmpB, 'out', 'report.md')) ? readFileSync(join(tmpB, 'out', 'report.md'), 'utf8') : '';
  t('B4 报告 capability 2 of 5 · preview + 演化考古措辞在', md.indexOf('capability 2 of 5 · preview') >= 0 && md.indexOf('Macro-C') >= 0);
  const side = existsSync(join(tmpB, 'out', 'report.json')) ? JSON.parse(readFileSync(join(tmpB, 'out', 'report.json'), 'utf8')) : null;
  t('B5 侧车 not_in_preview=[Macro-A]（D-204 裁后状态机——Micro-A 产线化 #85②）', !!side && JSON.stringify(side.preview_disclosure.not_in_preview) === JSON.stringify(['Macro-A']), JSON.stringify(side && side.preview_disclosure && side.preview_disclosure.not_in_preview));
  t('B6 侧车六判据齐＋band 三档枚举域', !!side && ['PC-MC-1', 'PC-MC-2', 'TC-MC-1', 'TC-MC-2', 'TC-MC-3', 'NC-MC-1'].every(function (c) { return side.adjudication.entries.some(function (e) { return e.criterion_id === c && ['supported', 'unsupported', 'insufficient'].indexOf(e.band) >= 0; }); }));
  const meas = existsSync(join(tmpB, 'out', 'audit-measurements.json')) ? JSON.parse(readFileSync(join(tmpB, 'out', 'audit-measurements.json'), 'utf8')) : null;
  t('B7 measurements 移植溯源＋fact_count>0＋supersede_chain 在', !!meas && meas.fact_count > 0 && !!meas.supersede_chain && String(meas.pipeline && meas.pipeline.recalibration || '').indexOf('85-check') >= 0, meas && meas.fact_count);
  // B8 报告输出面（tracker #34／ADR-0026）：reproduce_cmd 记 <repo>／<dir> 占位，报告两件不得落本机盘符锚。
  //   正对照＝探针必须能命中一条真实盘符锚——否则「零命中」只说明探针死了，不说明报告干净。
  //   正对照样本分片拼接：A12 机检本守卫自身零盘符锚，字面串会让 A12 自己变红。
  const ABS_PROBE_CTRL = 'macro-audit audit <repo> --scale Macro-C --out ' + ['D:', '/Aworker/6F/out'].join('');
  const sideRaw = existsSync(join(tmpB, 'out', 'report.json')) ? readFileSync(join(tmpB, 'out', 'report.json'), 'utf8') : '';
  t('B8 报告输出面无本机绝对路径且 reproduce_cmd 为占位形（report.md＋report.json；tracker #34／ADR-0026 可移植性）',
    md !== '' && sideRaw !== '' && !ABS_PATH_RE.test(md) && !ABS_PATH_RE.test(sideRaw)
    && md.indexOf('reproduce_cmd: macro-audit audit <repo> --scale Macro-C --out <dir>') >= 0
    && ABS_PATH_RE.test(ABS_PROBE_CTRL),
    'md_hit=' + ABS_PATH_RE.test(md) + ' json_hit=' + ABS_PATH_RE.test(sideRaw) + ' placeholder=' + (md.indexOf('reproduce_cmd: macro-audit audit <repo>') >= 0) + ' probe=' + ABS_PATH_RE.test(ABS_PROBE_CTRL));
  try { rmSync(tmpB, { recursive: true, force: true }); } catch (e) { }
}

// ---------- C. anysearch-cli 差分重校准（基准自持组级闸；产线化硬准入=同族基准对账后方可入 preview） ----------
// 语料来源＝仓内 frozen bundle（ADR-0026/#33）：钉值唯一权威=engine/baseline-lock.yaml anysearch-cli-adr-corpus 行
// version（pin_type=commit-sha），语料随 bundle 入库，**不再依赖同级仓**——无 sibling 的机器（含 CI）同样实跑 C1/C2/C3。
// 换钉＝手动窗口重打 bundle→改 baseline-lock（version/bundle_bytes/bundle_sha256 三值同窗）→重跑 C0~C6。
const AS_PIN_SHA = BASE_ROW ? BASE_ROW.version : null;
// 制品面为什么是断言而不是 need 族（git-object:／asset: 都不用）：need 族表达的是「本机环境缺什么」，
//   缺了按 D-159③ 三态纪律走 SKIP——而 bundle 在仓、由本仓维护，缺失／损坏／换钉不一致全是仓库缺陷，
//   必须红。族义也对不上：git-object: 指「主仓对象库里没有的冻结对象」，asset: 指 gitignored 外部资产。
const BUNDLE_HEADS = (function () { try { return execFileSync('git', ['bundle', 'list-heads', BUNDLE], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean); } catch (e) { return []; } })();
const BUNDLE_HEAD_OK = !!BUNDLE_BUF && BUNDLE_HEADS.length === 1 && BUNDLE_HEADS[0].indexOf(AS_PIN_SHA || '\u0000') === 0;
// 制品自证：必须在**新建空仓**里 verify——prerequisite 在空仓一律不可满足，带前置的增量包当场露馅；
//   在 clone 出来的语料仓里 verify 是假绿（对象已在库中，prerequisite 自然满足）。
const BUNDLE_VERIFY = (function () {
  const empty = mkdtempSync(join(tmpdir(), '85-bundle-gate-'));
  try {
    if (spawnSync('git', ['init', '-q', empty], { encoding: 'utf8' }).status !== 0) { return false; }
    return spawnSync('git', ['-C', empty, 'bundle', 'verify', BUNDLE], { encoding: 'utf8' }).status === 0;
  } catch (e) { return false; } finally { try { rmSync(empty, { recursive: true, force: true }); } catch (e) { } }
})();
// 边界：内容缺陷＝红，环境缺席＝SKIP。bundle 在仓、由本仓维护——缺失／损坏／换钉不一致都是**仓库缺陷**，
//   不是环境缺失，故走断言而非组级闸（组级闸只留 engine-deps：duckdb 原生绑定缺席才是环境面）。
//   这条边界正是 #33 要修的病：跳过不等于红。
t('C-GATE 基准语料 bundle 内容面：list-heads 唯一项＝钉值＋空仓 verify 通过（带 prerequisite 即红；不因 duckdb 缺席降级为 SKIP）',
  BUNDLE_HEAD_OK && BUNDLE_VERIFY, 'head_ok=' + BUNDLE_HEAD_OK + ' verify=' + BUNDLE_VERIFY + ' heads=' + JSON.stringify(BUNDLE_HEADS));
const DEPS_C = [
  need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))
];
if (BUNDLE_HEAD_OK && BUNDLE_VERIFY && groupProbe('85-check', 'C', DEPS_C)) {
  const MC = await import(pathToFileURL(join(ENG, 'dist', 'audit', 'macro-c.js')).href);
  const COL = await import(pathToFileURL(join(ENG, 'dist', 'collect', 'collectors.js')).href);
  const tmpC = mkdtempSync(join(tmpdir(), '85-recal-'));
  // 语料钉快照（R59 LOOP-1 TOCTOU 消除——predecl 2026-10-04-r59-loop-fix-predecl.md §1.1）：
  // 钉值来自 baseline-lock.yaml（pin_type=commit-sha）→ 仓内 frozen bundle `git clone` 至 OS temp 生成冻结面 AS_PIN；
  // engine 实跑与 oracle 重算同读此一份。clone 源是 bundle 文件而非任何活仓——工作树/HEAD 漂移与基准彻底解耦（#30/#33）。
  // 只读边界（D-074）：clone 只写 OS temp，主仓对象库零写；bundle 不 unbundle 进主仓。
  const SRC_HEAD = AS_PIN_SHA;
  const AS_PIN = join(tmpC, 'corpus');
  // 只读物化（env-contract cloneBundleWorktree）：`git clone <bundle>` 只写 OS 临时目录，
  // 主仓对象库零写、零 fetch、零 unbundle 进主仓（D-074）。
  if (!cloneBundleWorktree(BUNDLE, AS_PIN)) {
    t('C0 语料钉快照一致：bundle 物化 HEAD＝＝baseline-lock 钉值（TOCTOU 消除不变式）', false, 'git clone <bundle> 失败（bundle 损坏或 git 不可用）: ' + BUNDLE_REL);
    throw new Error('85-check/C 中止：bundle 物化失败——A11 已过而 clone 失败，属环境面故障（git 不可用/临时目录不可写）');
  }
  function gitO(args) { return execFileSync('git', ['-C', AS_PIN].concat(args), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }); }
  const HEAD_SHA = gitO(['rev-parse', 'HEAD']).trim();
  t('C0 语料钉快照一致：bundle 物化 HEAD＝＝baseline-lock 钉值（TOCTOU 消除不变式）', HEAD_SHA === SRC_HEAD, 'pin=' + HEAD_SHA.slice(0, 12) + ' src=' + String(SRC_HEAD).slice(0, 12));
  // 制品声明面（list-heads／空仓 verify）由上方 C-GATE 承载——此处不再复述同一条真理：
  //   clone 出来的语料仓里 verify 是假绿（对象已在库中，prerequisite 自然满足），故 verify 只认空仓那一处。
  // (a) engine 一等面实跑（冻结面语料）
  const run = await MC.runMacroCAudit({ input: AS_PIN, outDir: join(tmpC, 'out') });
  const meas = run.measurements;
  const side = JSON.parse(run.sidecar_json);
  // (b) 编排层独立重算（38 §1/§2/§4 原逻辑逐行镜像——collectors 层与 38 同源 import dist，独立性边界=编排层；gitO 已在钉快照段定义并锁定 AS_PIN）
  const HEAD_DATE = gitO(['log', '-1', '--format=%cI']).trim();
  const COMMIT_COUNT = Number(gitO(['rev-list', '--count', 'HEAD']).trim());
  const rawLog = gitO(['log', '--pretty=format:__R__%H|%an|%cI', '--name-only']);
  const commits = [];
  let cur = null;
  for (const line of rawLog.split('\n')) {
    const tk = line.trim();
    if (tk.indexOf('__R__') === 0) { const parts = tk.slice(5).split('|'); cur = { sha: parts[0], author: parts[1], date: parts[2], paths: [] }; commits.push(cur); }
    else if (cur && tk.length > 0) { cur.paths.push(tk); }
  }
  t('C-INV 38 §1 PROBE-INVARIANT：解析数==rev-list 数', commits.length === COMMIT_COUNT, commits.length + ' vs ' + COMMIT_COUNT);
  const adrDirO = join(AS_PIN, 'docs', 'adr');
  const adrFilesO = readdirSync(adrDirO).filter(function (f) { return /^\d{3,}.*\.md$/i.test(f); }).sort();
  const firstCommitOfO = function (rel) { let best = null; for (const c of commits) { if (c.paths.indexOf(rel) >= 0 && (best === null || c.date < best)) { best = c.date; } } return best; };
  const adrDocsO = adrFilesO.map(function (f) { const rel = 'docs/adr/' + f; return { path: rel, text: readFileSync(join(adrDirO, f), 'utf8'), first_commit_date: firstCommitOfO(rel) }; });
  const oCtx = { runId: 'recal-oracle', traceId: COL.sha256Hex('recal|' + HEAD_SHA + '|' + HEAD_DATE).slice(0, 32), repoRef: 'anysearch-cli@' + HEAD_SHA, scale: 'Macro-C', observedAt: meas.observed_at };
  const adrFactsO = COL.collectAdrStructureV2({ documents: adrDocsO }, oCtx);
  const adrDateMapO = {};
  for (const f of adrFactsO) { if (f.metric === 'adr.decision_date') { const v = JSON.parse(f.value_json); if (v.date) { adrDateMapO[f.subject_ref] = String(v.date).slice(0, 10); } } }
  const gitFactsO = COL.collectGitlog({ commits: commits, paths: adrDocsO.map(function (d) { return d.path; }), adrDates: adrDateMapO }, oCtx);
  // supersede 链（38 §4 逐行镜像——非 macro-c.ts 导出复用，独立性=编排层）
  const adrsO = [];
  for (const d of adrDocsO) {
    const num = d.path.split('/').pop().match(/^(\d+)/)[1];
    const text = d.text;
    const statusLine = (text.match(/^\s*[-*]?\s*status\s*[:：][^\n]*/im) || [''])[0].trim();
    const wholeTo = (statusLine.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || [])[1] || null;
    const inlineRefs = [];
    text.split('\n').forEach(function (line, i) {
      const sm = line.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || line.match(/supersedes?\s+ADR-?(\d{3,})/i);
      if (sm && !/^\s*[-*]?\s*status\s*[:：]/i.test(line)) { const negated = /(does not|do not|not a|no longer|never)\s+supersede/i.test(line); inlineRefs.push({ line: i + 1, to: sm[1], negated: negated }); }
    });
    const amends = [], refs = [], defers = [];
    text.split('\n').forEach(function (line, i) {
      if (!/^\s*(Amends|References)\s*[:：]/i.test(line)) { return; }
      for (const mm of line.matchAll(/ADR-?(\d{3,})/gi)) { (/^Amends/i.test(line.trim()) ? amends : refs).push({ line: i + 1, to: mm[1] }); }
      for (const mm of line.matchAll(/defer-(\d{3,})/gi)) { defers.push({ line: i + 1, to: 'defer-' + mm[1] }); }
    });
    adrsO.push({ file: d.path, num: num, whole_to: wholeTo, inline: inlineRefs, amends: amends, refs: refs, defers: defers, mentions: Array.from(new Set(Array.from(text.matchAll(/ADR-?(\d{3,})/gi)).map(function (x) { return x[1]; }))) });
  }
  const numSetO = new Set(adrsO.map(function (a) { return a.num; }));
  const deferRegistryO = existsSync(join(AS_PIN, 'docs', 'deferred-registry.json'));
  const edgesO = [];
  for (const a of adrsO) {
    if (a.whole_to) { edgesO.push({ from: a.num, to: a.whole_to, kind: 'whole-adr-status', evidence: a.file + ' status-line' }); }
    for (const r2 of a.inline) { edgesO.push({ from: a.num, to: r2.to, kind: r2.negated ? 'explicit-non-supersede' : 'item-level-inline', evidence: a.file + ':' + r2.line }); }
    for (const r2 of a.amends) { edgesO.push({ from: a.num, to: r2.to, kind: 'amends', evidence: a.file + ':' + r2.line }); }
    for (const r2 of a.refs) { edgesO.push({ from: a.num, to: r2.to, kind: 'references', evidence: a.file + ':' + r2.line }); }
    for (const r2 of a.defers) { edgesO.push({ from: a.num, to: r2.to, kind: 'defer-ref', evidence: a.file + ':' + r2.line }); }
  }
  const SK = new Set(['whole-adr-status', 'item-level-inline']);
  for (const e of edgesO) {
    if (e.from === e.to) { e.kind = 'self-quote-artifact'; }
    if (e.kind === 'defer-ref') { e.resolved = deferRegistryO; } else { e.resolved = numSetO.has(e.to); }
    if (e.kind !== 'defer-ref' && e.resolved) { const target = adrsO.find(function (a) { return a.num === e.to; }); e.back_reference = target ? target.mentions.indexOf(e.from) >= 0 : false; } else { e.back_reference = null; }
  }
  const chainO = { edge_count: edgesO.length, whole_adr_supersessions: edgesO.filter(function (e) { return e.kind === 'whole-adr-status'; }).length, item_level_supersessions: edgesO.filter(function (e) { return e.kind === 'item-level-inline'; }).length, amends_edges: edgesO.filter(function (e) { return e.kind === 'amends'; }).length, references_edges: edgesO.filter(function (e) { return e.kind === 'references'; }).length, defer_ref_edges: edgesO.filter(function (e) { return e.kind === 'defer-ref'; }).length, explicit_non_supersedes: edgesO.filter(function (e) { return e.kind === 'explicit-non-supersede'; }).length, self_quote_artifacts: edgesO.filter(function (e) { return e.kind === 'self-quote-artifact'; }).length, unresolved_refs: edgesO.filter(function (e) { return !e.resolved && e.kind !== 'self-quote-artifact'; }).map(function (e) { return e.from + '->' + e.to; }), missing_backrefs: edgesO.filter(function (e) { return SK.has(e.kind) && e.resolved && e.back_reference === false; }).map(function (e) { return e.from + '->' + e.to; }) };
  // 对账比较器（值级全等——自检组 D 复用）
  function compareMetrics(a, b) {
    const v = [];
    for (const k of Object.keys(a)) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { v.push(k); } }
    return v;
  }
  const oracleMetrics = {
    head_sha: HEAD_SHA, commit_count: COMMIT_COUNT,
    adr_count: adrsO.length,
    adr_date_resolvable: adrFactsO.filter(function (f) { return f.metric === 'adr.decision_date' && JSON.parse(f.value_json).date !== null; }).length,
    lag_judgeable_n: gitFactsO.filter(function (f) { return f.metric === 'git.adr_lag_days'; }).length,
    adr_leg_distribution: (function () { const ld = {}; for (const f of adrFactsO) { if (f.metric === 'adr.header_field_present' || f.metric === 'adr.decision_date') { const v = JSON.parse(f.value_json); const leg = v.leg || 'miss'; ld[leg] = (ld[leg] || 0) + 1; } } return ld; })(),
    chain: chainO
  };
  const runMetrics = {
    head_sha: meas.head_sha, commit_count: meas.commit_count,
    adr_count: meas.adr_count,
    adr_date_resolvable: meas.adr_date_resolvable,
    lag_judgeable_n: meas.lag_judgeable_n,
    adr_leg_distribution: meas.adr_leg_distribution,
    chain: meas.supersede_chain
  };
  const chainDiff = compareMetrics({ c: JSON.stringify(oracleMetrics.chain) }, { c: JSON.stringify(runMetrics.chain) });
  const baseDiff = compareMetrics(
    { head_sha: oracleMetrics.head_sha, commit_count: oracleMetrics.commit_count, adr_count: oracleMetrics.adr_count, adr_date_resolvable: oracleMetrics.adr_date_resolvable, lag_judgeable_n: oracleMetrics.lag_judgeable_n, adr_leg_distribution: JSON.stringify(oracleMetrics.adr_leg_distribution) },
    { head_sha: runMetrics.head_sha, commit_count: runMetrics.commit_count, adr_count: runMetrics.adr_count, adr_date_resolvable: runMetrics.adr_date_resolvable, lag_judgeable_n: runMetrics.lag_judgeable_n, adr_leg_distribution: JSON.stringify(runMetrics.adr_leg_distribution) });
  t('C1 编排层对账：head/commit_count/adr_count/date_resolvable/lag/leg_dist 全等', baseDiff.length === 0, 'diff=' + baseDiff.join(',') + ' oracle=' + JSON.stringify({ a: oracleMetrics.adr_count, l: oracleMetrics.lag_judgeable_n }) + ' run=' + JSON.stringify({ a: runMetrics.adr_count, l: runMetrics.lag_judgeable_n }));
  t('C2 supersede 链十计数全等（38 §4 镜像 vs engine 面）', chainDiff.length === 0, JSON.stringify({ o: { e: oracleMetrics.chain.edge_count, u: oracleMetrics.chain.unresolved_refs.length }, r: { e: runMetrics.chain.edge_count, u: runMetrics.chain.unresolved_refs.length } }));
  // chainFact fact_id 全等（勘误三：deriveFactId 熵源=collector|subject|metric|value|observedAt——纯文本扫描零日期暴露）
  const chainFactO = COL.makeFact(oCtx, COL.ADR_STRUCTURE_V2_DESCRIPTOR, 'docs/adr/*', 'docs/adr/* status+inline scan', 'adr.supersede_chain_summary', oracleMetrics.chain);
  const runChainFact = (function () { const lines = readFileSync(join(tmpC, 'out', 'audit-facts.jsonl'), 'utf8').split('\n').filter(Boolean); for (const l of lines) { const f = JSON.parse(l); if (f.metric === 'adr.supersede_chain_summary') { return f; } } return null; })();
  t('C3 chainFact fact_id 全等（移植值级保真——同语料同 HEAD）', !!runChainFact && runChainFact.fact_id === chainFactO.fact_id, (runChainFact ? runChainFact.fact_id : 'absent') + ' vs ' + chainFactO.fact_id);
  // 判据 band 对账（oracle 判据谓词独立实现——阈值常量同源 MACRO_C_LAG_MIN_N）
  const bands = {};
  for (const e of side.adjudication.entries) { bands[e.criterion_id] = e.band; }
  const oPc1 = meas.codelore.pinned && meas.codelore.facet_rows === meas.codelore.facet_rows_expected && meas.codelore.facet_errors.length === 0 && meas.adr_count > 0;
  const oPc2 = (function () { const fc = gitFactsO.filter(function (f) { return f.metric === 'git.first_commit'; }).length; return fc >= adrsO.length - 2; })();
  const oTc1 = chainO.edge_count >= 1 && chainO.unresolved_refs.length === 0 && chainO.missing_backrefs.length === 0;
  const oTc2 = oracleMetrics.lag_judgeable_n >= MC.MACRO_C_LAG_MIN_N;
  const oTc3 = meas.llm_gate.configured === true && meas.llm_narrative_count >= 1;
  t('C4 band 对账 PC-MC-1/PC-MC-2/TC-MC-1/TC-MC-2/TC-MC-3', bands['PC-MC-1'] === (oPc1 ? 'supported' : 'insufficient') && bands['PC-MC-2'] === (oPc2 ? 'supported' : 'insufficient') && bands['TC-MC-1'] === (oTc1 ? 'supported' : 'insufficient') && bands['TC-MC-2'] === (oTc2 ? 'supported' : 'insufficient') && bands['TC-MC-3'] === (oTc3 ? 'supported' : 'insufficient'), JSON.stringify({ o: { pc1: oPc1, pc2: oPc2, tc1: oTc1, tc2: oTc2, tc3: oTc3 }, r: bands }));
  t('C5 NC-MC-1 候选化选材五件套 0 命中（apps/cli/package.json 列首——38 同位）', bands['NC-MC-1'] === 'supported', bands['NC-MC-1']);
  t('C6 运行产物清盘（临时目录即弃）', (function () { try { rmSync(tmpC, { recursive: true, force: true }); return true; } catch (e) { return false; } })());
}

// ---------- D. 自检组（预声明 §2.4 命中方向：构造偏差必须红） ----------
(function () {
  function compareMetrics(a, b) { const v = []; for (const k of Object.keys(a)) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { v.push(k); } } return v; }
  const base = { adr_count: 97, lag_judgeable_n: 97, chain: { edge_count: 9, unresolved: [] } };
  t('D1 负对照：同对象双算 → 0 违规（绿）', compareMetrics(base, JSON.parse(JSON.stringify(base))).length === 0);
  t('D2 正对照：adr_count 篡改 → 检出（红）', compareMetrics(base, Object.assign({}, base, { adr_count: 96 })).indexOf('adr_count') >= 0);
  t('D3 正对照：chain 篡改 → 检出（红）', compareMetrics(base, Object.assign({}, base, { chain: { edge_count: 8, unresolved: [] } })).indexOf('chain') >= 0);
})();


// ---------- E. Micro-A 差分重校准（#85②；引擎面 cassette 回放 vs 48 生成器 golden 存档——产线化前置=同族基准差分重校准；predecl 2026-10-05-r63-t1-predecl.md §1.3 等值集） ----------
const DEPS_E = [need('engine-deps:@duckdb/node-api', engineDepsOk(ENG, '@duckdb/node-api'))];
if (groupProbe('85-check', 'E', DEPS_E)) {
  const MAM = await import(pathToFileURL(join(ENG, 'dist', 'audit', 'micro-a.js')).href);
  const MOD48 = await import(pathToFileURL(join(HERE, '48-micro-a-preview.mjs')).href);
  const NL_E = String.fromCharCode(10);
  const tmpE = mkdtempSync(join(tmpdir(), '85-recal-microa-'));
  // 引擎面 cassette 回放（48 goldenMain 同构注入——离线零网络）
  const casE = JSON.parse(readFileSync(join(REPO, 'engine', 'test', 'fixtures', 'github-rest', 'authenticated.cassette.json'), 'utf8'));
  const casAugE = { name: casE.name + '+85e', recorded: 'derived', calls: casE.calls.concat([casE.calls[3]]) };
  const capE = [];
  function cassetteFetcherE(cas, cap) { let i = 0; return async function (req) { cap.push(req); if (i >= cas.calls.length) { throw new Error('cassette exhausted at ' + req.url); } const c = cas.calls[i++]; if (req.method !== c.request.method) { throw new Error('method mismatch'); } if (!req.url.endsWith(c.request.path)) { throw new Error('path mismatch'); } const acc = c.request.accept || 'application/vnd.github+json'; if (req.accept !== acc) { throw new Error('accept mismatch'); } return { status: c.response.status, headers: c.response.headers || {}, body: typeof c.response.body === 'string' ? c.response.body : JSON.stringify(c.response.body) }; }; }
  const sharedE = { env: { GITHUB_TOKEN: 'GOLDEN-PLACEHOLDER' }, ghTokenProbe: function () { return { available: false, token: null }; }, fetcher: cassetteFetcherE(casAugE, capE) };
  const runAtE = MAM.deterministicRunAt();
  const t1E = { name: 'env-manager', owner: 'Xxx91n', repo: 'env-manager', root: null, pins: MAM.MICRO_A_GOLDEN_PRS };
  const collectedE = await MAM.collectMicroA(t1E, sharedE, MAM.MICRO_A_GOLDEN_DIFFS, runAtE);
  const measNameE = 'audit-measurements.json';
  const factsNameE = 'audit-facts.jsonl';
  writeFileSync(join(tmpE, measNameE), JSON.stringify({ repos: ['env-manager'], prs_listed: collectedE.res.prs_listed }, null, 2) + NL_E, 'utf8');
  writeFileSync(join(tmpE, factsNameE), collectedE.res.facts.map(function (f) { return JSON.stringify(f); }).join(NL_E) + NL_E, 'utf8');
  const gateE = { merged_prs: collectedE.mergedCount, eligible: true };
  const e64 = await MAM.buildPrReportMicroA(t1E, { n: 64, form: 'machine-generated/release-please' }, collectedE, gateE, sharedE, { golden: true, outDir: tmpE, measName: measNameE, factsName: factsNameE });
  const e51 = await MAM.buildPrReportMicroA(t1E, { n: 51, form: 'human' }, collectedE, gateE, sharedE, { golden: true, outDir: tmpE, measName: measNameE, factsName: factsNameE });
  // oracle=48 生成器 golden 存档（48-check B1 同窗再生实物）
  const g64 = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-golden-env-manager-pr64.json'), 'utf8'));
  const g51 = JSON.parse(readFileSync(join(REPO,'engine','test','fixtures','contracts','48-micro-a-golden-env-manager-pr51.json'), 'utf8'));
  const e64sc = JSON.parse(readFileSync(join(tmpE, e64.outputs.sidecar), 'utf8'));
  const e51sc = JSON.parse(readFileSync(join(tmpE, e51.outputs.sidecar), 'utf8'));
  function bandMap(sc) { const m = {}; for (const e of sc.adjudication.entries) { m[e.criterion_id] = e.band; } return m; }
  function diffKeys(a, b) { const v = []; for (const k of Object.keys(a)) { if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { v.push(k); } } return v; }
  t('E0 切片字段契约双源互等（engine micro-a.ts vs 48 生成器导出——禁手抄漂移）', JSON.stringify(MAM.MICRO_A_SLICE_FIELDS) === JSON.stringify(MOD48.MICRO_A_SLICE_FIELDS));
  const b64E = bandMap(e64sc); const b64G = bandMap(g64);
  t('E1 pr64 六判据 band 全等（引擎面 vs 48 golden 存档）', JSON.stringify(b64E) === JSON.stringify(b64G), JSON.stringify({ e: b64E, g: b64G }));
  t('E2 pr51 六判据 band 全等', JSON.stringify(bandMap(e51sc)) === JSON.stringify(bandMap(g51)), JSON.stringify({ e: bandMap(e51sc), g: bandMap(g51) }));
  function sliceOf(sc) { const q = sc.quadrants.filter(function (x) { return x.quadrant === 'behavior'; })[0]; const pick = {}; for (const k of ['author_form', 'merged', 'diff_channel', 'diff_files_changed', 'diff_additions', 'diff_deletions', 'diff_bytes', 'credential_strategy', 'credential_degraded', 'api_calls', 'rate_limit_remaining']) { pick[k] = q.slice_fields[k]; } return pick; }
  t('E3 pr64 切片数值字段全等', diffKeys(sliceOf(e64sc), sliceOf(g64)).length === 0, JSON.stringify(diffKeys(sliceOf(e64sc), sliceOf(g64))));
  t('E4 pr51 切片数值字段全等', diffKeys(sliceOf(e51sc), sliceOf(g51)).length === 0, JSON.stringify(diffKeys(sliceOf(e51sc), sliceOf(g51))));
  t('E5 fact_id 全等（pr64 三联＋pr51 双件——ctx 构造同字节）', JSON.stringify(e64sc.fact_ids) === JSON.stringify(g64.fact_ids) && JSON.stringify(e51sc.fact_ids) === JSON.stringify(g51.fact_ids), JSON.stringify({ e64: e64sc.fact_ids, g64: g64.fact_ids }));
  t('E6 披露块翻转双侧全等（capability 3 of 5 · preview＋not_in_preview=[Macro-A]）', e64sc.preview_disclosure.capability_label === g64.preview_disclosure.capability_label && JSON.stringify(e64sc.preview_disclosure.not_in_preview) === JSON.stringify(g64.preview_disclosure.not_in_preview) && e64sc.preview_disclosure.capability_label === 'capability 3 of 5 · preview', JSON.stringify(e64sc.preview_disclosure.not_in_preview));
  t('E7 token 进 wire 不入 fact（双通道同纪律）', capE.every(function (q) { return q.token === 'GOLDEN-PLACEHOLDER'; }) && JSON.stringify(collectedE.res.facts).indexOf('GOLDEN-PLACEHOLDER') < 0);
  // 正对照（mutation-kill——比较器构造偏差必须检出）
  const tampered = Object.assign({}, b64G, { 'TC-1': 'insufficient' });
  t('E8 正对照：band 篡改必须检出（红）', diffKeys(b64G, tampered).indexOf('TC-1') >= 0);
  t('E9 overall_verdict＋structural_limitations 双侧全等（pr64＋pr51——predecl §1.3 等值集补位，R64 审计返修 P2-2）', e64sc.overall_verdict === g64.overall_verdict && e51sc.overall_verdict === g51.overall_verdict && JSON.stringify(e64sc.preview_disclosure.structural_limitations) === JSON.stringify(g64.preview_disclosure.structural_limitations) && JSON.stringify(e51sc.preview_disclosure.structural_limitations) === JSON.stringify(g51.preview_disclosure.structural_limitations), JSON.stringify({ e: e64sc.overall_verdict, g: g64.overall_verdict }));
  try { rmSync(tmpE, { recursive: true, force: true }); } catch (e) { }
}
console.log('---');
console.log(fail === 0 ? 'PASS ' + pass + '/' + (pass + fail) : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
