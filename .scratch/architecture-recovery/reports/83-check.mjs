// 83-check.mjs — #83 R32 审计建议修批守卫（D-134 吞错收窄 / D-135 修批票面 / D-136 失败态收口 / F5/F6/F7a~j）
// 断言面：A 必修收窄（精确指认+预查+skipped 披露+毒事实回归）→ B 契约符合性（F5 缺库卡/F6 可用集/D-136 收口/F7a 歧义验重）
//   → C 卫生组（F7c~f/h/j 逐件）→ D 纪律（BOM 钉面/BACKLOG/smoke 链）→ G 实跑绿
// 用法：node 83-check.mjs → 逐条 PASS/FAIL；exit 0=全 PASS
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

// ---------- A. D-134 必修收窄 ----------
const stSrc = txt(join(ENG, 'src', 'fact', 'store.ts'));
const stDist = exists(join(ENG, 'dist', 'fact', 'store.js')) ? txt(join(ENG, 'dist', 'fact', 'store.js')) : '';
t('A1 store 精确指认+预查双出口 src+dist 双锚（isFactIdUniqueViolation/existingFactIds）',
  stSrc.indexOf('export function isFactIdUniqueViolation') >= 0 && stSrc.indexOf('export async function existingFactIds') >= 0 && stDist.indexOf('isFactIdUniqueViolation') >= 0);
const afSrc = txt(join(ENG, 'src', 'audit', 'file-card.ts'));
t('A2 写循环预查已存 fact_id＋收窄 catch（撞键消除在判定层非吞错层）',
  afSrc.indexOf('await existingFactIds(') >= 0 && afSrc.indexOf('isFactIdUniqueViolation(e)') >= 0);
t('A3 泛 constraint 吞错旧形清除（classifyWriteError 不再决定跳过）',
  afSrc.indexOf("classifyWriteError(e) !== 'constraint'") < 0 && afSrc.indexOf('classifyWriteError') < 0);
t('A4 emitted/skipped 分列披露（AuditFileResult.skipped＋cli 输出带 skipped）', (() => {
  const cli = txt(join(ENG, 'src', 'cli.ts'));
  return afSrc.indexOf('skipped: number') >= 0 && afSrc.indexOf('skipped: skipped') >= 0 && cli.indexOf('skipped: r.skipped') >= 0;
})());
const fcTest = txt(join(ENG, 'test', 'file-card.test.mjs'));
t('A5 毒事实回归断言在（非指名错上抛+回滚零行+真 DuckDB 消息形态钉）',
  fcTest.indexOf('isFactIdUniqueViolation') >= 0 && fcTest.indexOf('Constraint Error') >= 0 && fcTest.indexOf('回滚零行') >= 0);

// ---------- B. 契约符合性（F5/F6/D-136/F7a） ----------
const mcpSrc = txt(join(ENG, 'src', 'mcp-server.ts'));
t('B1 F5 MCP 缺库→结构化 never_collected 卡（existsSync 分支+buildFileCard 非 isError）',
  mcpSrc.indexOf('existsSync(db)') >= 0 && mcpSrc.indexOf('buildFileCard') >= 0);
const fcSrc = txt(join(ENG, 'src', 'fact', 'file-card.ts'));
const fcDist = exists(join(ENG, 'dist', 'fact', 'file-card.js')) ? txt(join(ENG, 'dist', 'fact', 'file-card.js')) : '';
t('B2 F6 集内 not_tracked_at_sha 补 available_head_shas（两枝补齐）',
  fcSrc.indexOf('available_head_shas: input.availableHeadShas.slice()') >= 0);
t('B3 D-136 失败态收口：closed 枚举双集＋suppressed_facets src+dist',
  fcSrc.indexOf('FILE_CARD_HISTORY_DERIVED_FACETS') >= 0 && fcSrc.indexOf('FILE_CARD_STATIC_FACETS') >= 0 && fcSrc.indexOf('suppressed_facets') >= 0 && fcDist.indexOf('FILE_CARD_HISTORY_DERIVED_FACETS') >= 0);
const projSrc = txt(join(ENG, 'src', 'fact', 'projection.ts'));
t('B4 F7a pin ≥7 前缀歧义验重（pinnedAmbiguous 上卡面，>1 命中不猜最新）',
  fcSrc.indexOf('pinnedAmbiguous') >= 0 && projSrc.indexOf('pinAmbiguous') >= 0);

// ---------- C. 卫生组 ----------
t('C1 F7c headShaOf 去重（audit 侧复用 headShaOfRepoRef 单实现）',
  afSrc.indexOf('headShaOfRepoRef') >= 0 && afSrc.indexOf('function headShaOf') < 0);
t('C2 F7d mcp-server 头注三工具名实相符（facts/quarantine/file_card）',
  mcpSrc.indexOf('file_card') >= 0 && mcpSrc.indexOf('唯一暴露 tool=facts') < 0);
t('C3 F7e 死引用清除（audit/file-card.ts 不再点名 microBCtx）',
  afSrc.indexOf('microBCtx') < 0);
t('C4 F7f 测试文件无 existsSync unused import',
  fcTest.indexOf('existsSync') < 0);
t('C5 F7h FILE_CARD_SET_CAP 截断卡面标记（kernel.set_truncated＋COUNT 判定）',
  fcSrc.indexOf('set_truncated') >= 0 && projSrc.indexOf('setTruncated') >= 0 && projSrc.indexOf('SELECT COUNT(*)') >= 0);
const ci = txt(join(ROOT, '.github', 'workflows', 'engine-ci.yml'));
t('C6 F7j upload-artifact 收窄为步级 outcome（不再 job 级 failure()）',
  ci.indexOf('steps.rebuilddiff.outcome') >= 0 && ci.indexOf('id: rebuilddiff') >= 0);

// ---------- D. 纪律 ----------
t('D1 新触源/测试/CI 文件无 BOM（#83 票面触及集）', (() => {
  const files = ['src/fact/store.ts', 'src/fact/file-card.ts', 'src/fact/projection.ts', 'src/audit/file-card.ts', 'src/mcp-server.ts', 'src/cli.ts', 'test/file-card.test.mjs'];
  const all = files.every(f => { const b = fs.readFileSync(join(ENG, f)); return b[0] !== 0xEF; });
  const cib = fs.readFileSync(join(ROOT, '.github', 'workflows', 'engine-ci.yml'));
  const clb = fs.readFileSync(join(ROOT, 'CHANGELOG.md'));
  return all && cib[0] !== 0xEF && clb[0] !== 0xEF;
})());
const backlog = txt(join(ROOT, '.scratch', 'architecture-recovery', 'BACKLOG.md'));
t('D2 BACKLOG #83 行在（票面归属）', backlog.indexOf('| #83 |') >= 0);
const pkgJson = JSON.parse(txt(join(ENG, 'package.json')));
t('D3 file-card.test.mjs 在 smoke 链（test 闭环非只引入）', pkgJson.scripts.smoke.indexOf('file-card.test.mjs') >= 0);

// ---------- G. 实跑绿 ----------
{
  const r = spawnSync('node', [join(ENG, 'test', 'file-card.test.mjs')], { encoding: 'utf8', timeout: 240000, env: { ...process.env, NODE_OPTIONS: '' } });
  t('G1 file-card.test.mjs 实跑绿（FILE-CARD n/n 含 #83 断言组 C4~C7/D2扩展/E3/H2/H3/J1/K1）', r.status === 0 && /FILE-CARD [0-9]+[/][0-9]+/.test(r.stdout), String(r.stdout).trim().split(String.fromCharCode(10)).slice(-1)[0] || String(r.stderr).slice(-160));
}

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
