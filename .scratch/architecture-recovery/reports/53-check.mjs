// 53-check.mjs —— #53 `macro-audit audit` 一等命令守卫（D-060 八要素）
// 断言面：A=签名面（cli.ts audit 分发 + usage 行 + README 同票绑定）
//   → B=--scale 诚实拒绝（未实装层 exit 2 + SCALE-NOT-IMPLEMENTED 结构化 JSON，不假装）
//   → C=--out 双通道实跑（五工件落盘 + stdout 回执 JSON 契约字段集）＋省略 --out 报告 md 走 stdout
//   → D=共享管线消费（audit.ts/demo.ts 同 import audit/macro-b.ts 链件）
//   → E=golden parity：audit sidecar 字段路径 ⊆ 39 one-shot 复跑产物（39/40=回归对照物非主入口）
//   → F=报告头 preview 披露（stability=preview + capabilities=[macro-b] 机读面）＋快照时点披露
//   → G=audit 不携叙事职责（kernel 面 facts+骨架；叙事=宿主 MCP 读数）
//   → H=本票新增/改动文件无 BOM（UTF-8 禁字节序标记）
// 纪律：只读断言＋临时目录实跑（合成 git 仓，跑完即弃）；exit 0 + PASS N/N 为绿。
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const ENG = join(REPO, 'engine');
const CLI = join(ENG, 'dist', 'cli.js');
const NL = '\n';

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }

// ---------- A. 签名面 ----------
const cli = txt(join(ENG, 'src', 'cli.ts'));
t('A1 cli.ts audit 命令分发在', /cmd === 'audit'/.test(cli));
t('A2 usage 行载 audit 签名（<path|owner/repo|url> [--scale] [--out] [--json] [--refresh]）', cli.indexOf('audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh]') >= 0);
const audit = txt(join(ENG, 'src', 'audit', 'audit.ts'));
t('A3 audit.ts 缺省 scale=Macro-B 实现位在（normalizeAuditScale raw===undefined→Macro-B）', audit.indexOf("if (raw === undefined) { return 'Macro-B'; }") >= 0);
const readme = txt(join(ENG, 'README.md'));
t('A4 README 同票绑定：audit 签名 + SCALE-NOT-IMPLEMENTED + 双通道语义在', readme.indexOf('macro-audit audit <path|owner/repo|url>') >= 0 && readme.indexOf('SCALE-NOT-IMPLEMENTED') >= 0 && readme.indexOf('stdout 打印回执 JSON') >= 0);

// ---------- B. --scale 诚实拒绝 ----------
let r1 = spawnSync('node', [CLI, 'audit', '.', '--scale', 'Macro-A'], { encoding: 'utf8', cwd: ENG });
let sj = null; try { sj = JSON.parse(r1.stderr); } catch (e) { }
t('B1 --scale Macro-A → exit 2 + error=SCALE-NOT-IMPLEMENTED', r1.status === 2 && !!sj && sj.error === 'SCALE-NOT-IMPLEMENTED', 'status=' + r1.status);
t('B2 拒绝 JSON 载 implemented/requested/layer_order', !!sj && JSON.stringify(sj.implemented) === JSON.stringify(['Macro-B']) && sj.requested === 'Macro-A' && typeof sj.layer_order === 'string');
t('B2b layer_order=ADR-0017③ 原文层序', !!sj && sj.layer_order.indexOf('Macro-C→Micro-A→Micro-B→Macro-A') === 0 && sj.layer_order.indexOf('ADR-0017') >= 0, sj && sj.layer_order);
let r1b = spawnSync('node', [CLI, 'audit', '.', '--scale', 'Macro-B'], { encoding: 'utf8', cwd: ENG });
t('B3 --scale Macro-B 不误拒（进入实跑面）', r1b.status === 0, 'status=' + r1b.status + ' err=' + (r1b.stderr || '').slice(0, 120));

// ---------- 合成被测仓（C/E 实跑面共用） ----------
const tmp = mkdtempSync(join(tmpdir(), '53check-'));
const TGT = join(tmp, 'tgt');
mkdirSync(join(TGT, 'docs', 'adr'), { recursive: true });
const ENV = Object.assign({}, process.env, { GIT_AUTHOR_DATE: '2026-04-10T10:00:00Z', GIT_COMMITTER_DATE: '2026-04-10T10:00:00Z' });
function sh(args) { execFileSync('git', args, { cwd: TGT, encoding: 'utf8', env: ENV }); }
sh(['init']); sh(['config', 'user.email', 'a@b.c']); sh(['config', 'user.name', '53check']); sh(['config', 'commit.gpgsign', 'false']);
writeFileSync(join(TGT, 'CONTEXT.md'), '# tgt\nmacro audit positioning determinism traceability provenance receipt\n', 'utf8');
writeFileSync(join(TGT, 'package.json'), '{"name":"tgt"}\n', 'utf8');
sh(['add', '-A']); sh(['commit', '-m', 'init']);
writeFileSync(join(TGT, 'docs', 'adr', '001-x.md'), ['# ADR-001', '', '- Status: accepted', '- Date: 2026-04-10', '- Deciders: t', '- Ledger: D-1', '', '## Context', 'x.', '', '## Decision', 'y.', '', '## Consequences', 'z; supersedes ADR-000.'].join(NL), 'utf8');
sh(['add', '-A']); sh(['commit', '-m', 'adr']);

// ---------- C. --out 双通道 ----------
const OUTA = join(tmp, 'audit-out');
let r2 = spawnSync('node', [CLI, 'audit', TGT, '--out', OUTA], { encoding: 'utf8', timeout: 120000 });
let rec = null; try { rec = JSON.parse(r2.stdout); } catch (e) { }
t('C1 audit --out exit 0 + stdout=回执 JSON', r2.status === 0 && !!rec && /^RCP-[0-9a-f]{16}$/.test(rec.receipt_id || ''), 'status=' + r2.status + ' err=' + (r2.stderr || '').slice(0, 160));
const ART = ['report.md', 'report.json', 'audit-facts.jsonl', 'audit-measurements.json', 'facts.duckdb'];
t('C2 五工件落盘齐备', ART.every(function (f) { return existsSync(join(OUTA, f)); }), ART.filter(function (f) { return !existsSync(join(OUTA, f)); }).join(','));
let r3 = spawnSync('node', [CLI, 'audit', TGT], { encoding: 'utf8', timeout: 120000 });
t('C3 省略 --out → stdout=报告 markdown（含 RECEIPT 行）', r3.status === 0 && r3.stdout.indexOf('# MA-AUDIT-') >= 0 && r3.stdout.indexOf('RECEIPT RCP-') >= 0, 'status=' + r3.status);

// ---------- D. 共享管线消费 ----------
const demo = txt(join(ENG, 'src', 'demo', 'demo.ts'));
const mb = txt(join(ENG, 'src', 'audit', 'macro-b.ts'));
t('D1 audit.ts + demo.ts 同消费 audit/macro-b.ts 链件（probe/collect/evaluate 三件套）', audit.indexOf("from './macro-b.js'") >= 0 && /probeMacroBRepo.*collectMacroB.*evaluateMacroB/.test(demo) && /probeMacroBRepo.*collectMacroB.*evaluateMacroB/.test(audit));
t('D2 macro-b.ts 导出三链件 + normalizeGitIsoDate 消费（%cI 归一化位）', /export function probeMacroBRepo/.test(mb) && /export function collectMacroB/.test(mb) && /export function evaluateMacroB/.test(mb) && mb.indexOf('normalizeGitIsoDate') >= 0);
t('D3 demo codelore=off 确定性位 + audit codelore=auto 实跑位', demo.indexOf("codelore: 'off'") >= 0 && audit.indexOf("codelore: 'auto'") >= 0);

// ---------- E. golden parity：audit 产物字段 ⊆ 39 one-shot 复跑产物 ----------
const OUTB = join(tmp, 'shot-out');
let r4 = spawnSync('node', [join(HERE, '39-macro-b-one-shot.mjs'), '--repo', 'tgt', '--root', TGT, '--out', OUTB], { encoding: 'utf8', timeout: 180000, cwd: REPO });
t('E0 对照物 39 one-shot 复跑 exit 0（脚本保留为回归对照物非主入口）', r4.status === 0, 'status=' + r4.status + ' err=' + (r4.stderr || '').slice(-300));
const shotJson = join(OUTB, '39-macro-b-tgt.json');
if (r4.status === 0 && existsSync(shotJson) && existsSync(join(OUTA, 'report.json'))) {
  const s39 = JSON.parse(txt(shotJson));
  const sAu = JSON.parse(txt(join(OUTA, 'report.json')));
  const k39 = Object.keys(s39).sort();
  const kAu = Object.keys(sAu).sort();
  const missing = kAu.filter(function (k) { return k39.indexOf(k) < 0; });
  t('E1 audit 侧车顶层字段 ⊆ 39 侧车字段（漂移即报警）', missing.length === 0, 'extra=' + missing.join(','));
  function paths(o, pre, acc) { for (const k of Object.keys(o)) { const v = o[k]; const p = pre ? pre + '.' + k : k; acc.push(p); if (v && typeof v === 'object' && !Array.isArray(v)) { paths(v, p, acc); } } return acc; }
  const p39 = paths(s39, '', []).sort();
  const pAu = paths(sAu, '', []).sort();
  const drift = pAu.filter(function (p) { return p39.indexOf(p) < 0; });
  t('E2 audit 侧车字段路径全集 ⊆ 39 侧车字段路径', drift.length === 0, 'drift=' + drift.slice(0, 6).join(','));
  const q39keys = s39.quadrants.length ? Object.keys(s39.quadrants[0]).sort() : [];
  const qDrift = (sAu.quadrants || []).filter(function (q) { return Object.keys(q).some(function (k) { return q39keys.indexOf(k) < 0; }); });
  t('E3 audit 象限条目字段 ⊆ 39 象限条目字段', qDrift.length === 0);
  const m39 = JSON.parse(txt(join(OUTB, '39-macro-b-tgt-measurements.json')));
  const mAu = JSON.parse(txt(join(OUTA, 'audit-measurements.json')));
  const core = ['repo', 'root', 'observed_at', 'head_sha', 'tree_sha', 'commit_count', 'adr_count', 'intent_docs', 'fact_count', 'tc1', 'tc2', 'tc3', 'nc1', 'pc1', 'pc2'];
  const coreMiss = core.filter(function (k) { return !(k in mAu); });
  t('E4 audit measurements 含 39 全部核心字段（39 集合 ⊆ audit 集合；audit 扩展项=intake/behavior 披露面）', coreMiss.length === 0, 'miss=' + coreMiss.join(','));
} else {
  t('E1 audit 侧车顶层字段 ⊆ 39 侧车字段（漂移即报警）', false, '39 复跑或 audit 产物缺席');
  t('E2 audit 侧车字段路径全集 ⊆ 39 侧车字段路径', false, '跳过');
  t('E3 audit 象限条目字段 ⊆ 39 象限条目字段', false, '跳过');
  t('E4 audit measurements 含 39 全部核心字段', false, '跳过');
}

// ---------- F. 报告头 preview 披露 ----------
const md = existsSync(join(OUTA, 'report.md')) ? txt(join(OUTA, 'report.md')) : '';
t('F1 报告头 stability: preview · capabilities: macro-b', md.indexOf('stability: preview') >= 0 && md.indexOf('capabilities: macro-b') >= 0);
t('F2 披露块 capability 1 of 5 · preview + not_in_preview 四层名', md.indexOf('capability 1 of 5 · preview') >= 0 && md.indexOf('not_in_preview') >= 0);
t('F3 快照时点披露进披露块（snapshot_fetched_at 载于限制条）', md.indexOf('snapshot_fetched_at') >= 0);

// ---------- G. 不携叙事职责 ----------
const sAu2 = existsSync(join(OUTA, 'report.json')) ? JSON.parse(txt(join(OUTA, 'report.json'))) : null;
t('G1 narrative_sections 空或仅 kernel/host 兜底（audit 不携宿主叙事生成职责）', !!sAu2 && (sAu2.narrative_sections.length === 0 || sAu2.narrative_sections.every(function (s) { return s.author === 'kernel-template' || s.author === 'host'; })), 'n=' + (sAu2 ? sAu2.narrative_sections.length : 'n/a'));

// ---------- H. BOM ----------
const nbFiles = ['engine/src/audit/audit.ts', 'engine/src/audit/macro-b.ts', 'engine/test/audit.test.mjs'].map(function (f) { return join(REPO, f); });
t('H1 本票新增/改动文件无 BOM', nbFiles.every(function (f) { return !existsSync(f) || noBom(f); }), nbFiles.filter(function (f) { return existsSync(f) && !noBom(f); }).join(','));

rmSync(tmp, { recursive: true, force: true });
console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
