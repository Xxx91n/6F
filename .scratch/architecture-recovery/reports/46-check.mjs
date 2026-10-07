// 46-check.mjs —— #46 回归 CI 迁回 6F 自有 CI 守卫（R7-05 / D-046 / D-013 / D-033）
// 断言面：A=6F workflow 契约（触发面/opt-in 输入/intake 隔离/链/工件断言/权限/诚实语义）
//   → B=jiahao 单文件撤除（工作树缺席 + 删除提交 name-status 恰 1 文件 D）
//   → C=本地 one-shot 验证工件（46-out 工件集 + 回执 + 裁定三档如实落数）
//   → D=引擎健康回归（33-check exit 0 + dist/cli.js 在 + one-shot 脚本迁移注记同步）
//   → E=文书（BACKLOG #46 行 + 本轮报告含 #46 窗口节）
// 纪律：只读断言（git 只读子命令 + fs 读，零写仓内状态）；exit 0 + PASS N/N 为绿。
// 口径：job 绿=管线跑通+工件齐备，非裁定绿（supported/unsupported/insufficient 三档如实，反复接受非跑通 D-033）。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { siblingPath, need, groupProbe } from './_lib/env-contract.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const NL = '\n';
const REPO = join(HERE, '..', '..', '..');
// guard-meta（D-159②/D-160③ 自声明——未声明=红）
const TIER = 'env-contract';
// D-214① consumption_forms（多形态消费方——B/C4 组级 need sibling:jiahao）：dev-full=完整克隆＋sibling jiahao 工作树在位全断言面；ci-shallow=CI 浅克隆（sibling 缺席→B/C4 组 SKIP，A/D/E 仓内段照跑）。
const CONSUMPTION_FORMS = ['dev-full', 'ci-shallow'];
const PROTECTED_SURFACE = '46 回归 CI 迁回面（6F workflow 契约＋jiahao 撤除＋46-out 工件）';
const JIAHAO = siblingPath('jiahao');
// 组级前置（D-164-a②；R42 审计 O3 收窄）：B 组与 C4 挂 sibling:jiahao；A/C1~C3/D/E 零需 portable 段不因 sibling 缺席连坐
const WF = join(REPO, '.github', 'workflows', 'macro-b-regression.yml');
const OUT = join(HERE, '46-out');

let pass = 0, fail = 0;
function t(name, ok, detail) { if (ok) { pass++; console.log('PASS ' + name); } else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); } }
function txt(p) { return readFileSync(p, 'utf8'); }
function noBom(p) { const b = readFileSync(p); return !(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF); }
function git(root, args) { try { return execFileSync('git', ['-C', root].concat(args), { encoding: 'utf8' }).trim(); } catch (e) { return null; } }

// ---------- A. 6F workflow 契约（T1 交付面） ----------
const wf = existsSync(WF) ? txt(WF) : null;
t('A1 6F .github/workflows/macro-b-regression.yml 存在', wf !== null);
if (wf !== null) {
  t('A2 无 BOM + LF', noBom(WF) && wf.indexOf('\r') < 0);
  t('A3 触发面=schedule cron(周一 03:17 UTC 沿用 #39 节拍)+workflow_dispatch', wf.indexOf("cron: '17 3 * * 1'") >= 0 && wf.indexOf('workflow_dispatch') >= 0);
  t('A4 无 push/pull_request 触发（回归≠门禁）', !/^\s+(push|pull_request):/m.test(wf));
  t('A5 URL opt-in 输入面：repo_url + repo_name inputs 声明', /repo_url:/.test(wf) && /repo_name:/.test(wf) && /inputs:/.test(wf));
  t('A6 https-only 准入闸门在（ssh/git/file/ext:: 拒入）', wf.indexOf('https://*') >= 0 && wf.indexOf('仅允许 https://') >= 0);
  t('A7 intake 隔离纪律三件：core.hooksPath noop + protocol.ext.allow=never + 浅拒断言', wf.indexOf('core.hooksPath') >= 0 && wf.indexOf('protocol.ext.allow=never') >= 0 && wf.indexOf('--is-shallow-repository') >= 0);
  t('A8 链完整：engine build + 39-macro-b-one-shot.mjs --repo/--root/--out', wf.indexOf('npm run build') >= 0 && wf.indexOf('39-macro-b-one-shot.mjs') >= 0 && wf.indexOf('--repo') >= 0 && wf.indexOf('--root') >= 0 && wf.indexOf('--out') >= 0);
  t('A9 工件断言面：receipt_id RCP 强断言 + scale Macro-B + md + facts + measurements + duckdb', ['"receipt_id"', 'RCP-[0-9a-f]{16}', '"scale": "Macro-B"', '-facts.jsonl', '-measurements.json', '39-audit-facts.duckdb'].every(s => wf.indexOf(s) >= 0));
  t('A10 upload-artifact@v4 + if always()', wf.indexOf('actions/upload-artifact@v4') >= 0 && wf.indexOf('always()') >= 0);
  t('A11 permissions contents: read（最小权限）', /permissions:[\s\S]*?contents:\s*read/.test(wf));
  t('A12 无 MACRO_AUDIT_6F_TOKEN（D-046⑤ 跨私仓面取消）+ 无 repository: Xxx91n/6F 跨仓 checkout', wf.indexOf('MACRO_AUDIT_6F_TOKEN') < 0 && wf.indexOf('repository: Xxx91n/6F') < 0);
  t('A13 resolve job 产 matrix（fromJSON）+ 默认集含 jiahao URL', wf.indexOf('fromJSON(needs.resolve.outputs.matrix)') >= 0 && wf.indexOf('https://github.com/Xxx91n/jiahao.git') >= 0);
  t('A14 诚实语义注释在：已上架层限定 + job 绿=管线 + 三档如实 + mw-trigger-a', ['已上架层', '管线', 'supported/unsupported/insufficient', 'mw-trigger-a'].every(s => wf.indexOf(s) >= 0));
  t('A15 engine 构建用 npm ci --ignore-scripts（仓内 CI 惯例，golden-ci.yml:46 同口径），无裸 npm install', wf.indexOf('npm ci --ignore-scripts') >= 0 && wf.indexOf('npm install') < 0);
  t('A16 matrix.repo.* 进 run 一律 env 间接引用（无 clone "${{ matrix.repo.url }}" 直插）', wf.indexOf('REPO_URL: ${{ matrix.repo.url }}') >= 0 && wf.indexOf('REPO_NAME: ${{ matrix.repo.name }}') >= 0 && wf.indexOf('clone "$REPO_URL"') >= 0 && wf.indexOf('clone "${{ matrix.repo.url }}"') < 0 && wf.indexOf('--repo "${{ matrix.repo.name }}"') < 0);
  t('A17 verify 步强断言：test -s 非零字节 + receipt_id RCP-[0-9a-f]{16} 格式断言', wf.indexOf('test -s') >= 0 && wf.indexOf('RCP-[0-9a-f]{16}') >= 0 && wf.indexOf('"receipt_id"') >= 0);
}

// A18（D-176②）：.github/workflows/*.yml parse 档病态闸——拦 L144 未引号 plain 标量含 ': '（冒号+空白）死件同型
// 零依赖手写最小结构闸（D-176 scoping：yaml 包/全量 parse 升格=条件项，引入须独立 commit 走 D-139）；命中=文件名:行号+行摘
const WF_DIR = join(REPO, '.github', 'workflows');
const wfSick = [];
const wfFiles = existsSync(WF_DIR) ? readdirSync(WF_DIR).filter(f => /\.ya?ml$/.test(f)) : [];
// plain 标量起始指示符集（' " | > [ ] { } & * ! % @ ` #——charCode 判定：源码零裸引号，防普查剥注释面引号态漂移；#=注释起始符于值位置即整行注释值实为 null 非病态）
const NONPLAIN_START = new Set([39, 34, 124, 62, 91, 93, 123, 125, 38, 42, 33, 37, 64, 96, 35]);
for (const f of wfFiles) {
  let blockIndent = -1;                                  // 块标量（|/>）体区段缩进水线（-1=区外；体内更深缩进行/空行不涉键行判定）
  txt(join(WF_DIR, f)).split(NL).forEach((line, i) => {
    const head = line.match(/^(\s*)(-\s+)?/);
    const indent = head[1].length + (head[2] ? head[2].length : 0);
    if (blockIndent >= 0) { if (line.trim() === '' || indent > blockIndent) return; blockIndent = -1; }
    const m = line.match(/^\s*(?:-\s+)?[A-Za-z_][\w-]*:\s+(\S.*)$/);
    if (!m) return;                                        // 非键行（shell/注释/块内容/空行）不涉
    const v = m[1];
    const c0 = v.charCodeAt(0);
    if (c0 === 124 || c0 === 62) { blockIndent = indent; return; } // |/> 块标量起始行登记区段（值本体=标量指示符非 plain）
    if (NONPLAIN_START.has(c0)) return;                    // 引号/流式/锚点/#注释/指示符=非 plain 标量
    const bare = v.replace(/\s+#.*$/, '');                // 行尾注释剥离后取净值
    if (/:(\s|$)/.test(bare)) wfSick.push(f + ':' + (i + 1) + ' ' + line.trim().slice(0, 80));
  });
}
t('A18 workflows/*.yml 无未引号标量含 ": " 病态模式（parse 档闸——拦 macro-b 死件同型，files=' + wfFiles.length + '）', wfFiles.length > 0 && wfSick.length === 0, wfSick.join(' | '));

// ---------- B. jiahao 单文件撤除（T2 交付面） ----------
const JH46 = [need('sibling:jiahao', existsSync(JIAHAO))];
if (groupProbe('46-check', 'B', JH46)) {
  const jhWf = join(JIAHAO, '.github', 'workflows', 'macro-b-regression.yml');
  // F-7 漂移披露补腿（D-159⑤ 兑现）：sibling 在但状态越出钉定时代（文件重现/删除提交不可达/变更面不符）
  //   →WARN 方言披露不计数（同 37-C1 退化型）；非漂移路径保留原断言 verbatim（sibling 态属环境面非本仓契约）
  if (existsSync(jhWf)) {
    console.log('WARN B1 jiahao 工作树该文件重现——sibling 漂移越出钉定时代，断言退化不计数（方言披露面 D-159⑤）');
  } else {
    t('B1 jiahao 工作树该文件已缺席', !existsSync(jhWf));
  }
  const delSha = (git(JIAHAO, ['log', '--all', '--diff-filter=D', '--format=%H', '--', '.github/workflows/macro-b-regression.yml']) || '').split(NL)[0] || '';
  if (!/^[0-9a-f]{40}$/.test(delSha)) {
    console.log('WARN B2 jiahao 删除提交不可达（delSha=' + (delSha.slice(0, 8) || 'none') + '）——sibling 史漂移，断言退化不计数（方言披露面 D-159⑤ 同 37-C1 型）');
  } else {
    t('B2 存在该文件的删除提交', /^[0-9a-f]{40}$/.test(delSha), 'delSha=' + delSha);
    const ns = git(JIAHAO, ['show', '--pretty=format:', '--name-status', delSha]) || '';
    if (ns === 'D\t.github/workflows/macro-b-regression.yml') {
      t('B3 删除提交变更面恰 1 文件且为 D 该文件', ns === 'D\t.github/workflows/macro-b-regression.yml', JSON.stringify(ns));
    } else {
      console.log('WARN B3 删除提交变更面不符（ns=' + JSON.stringify(ns.slice(0, 60)) + '）——sibling 史改写漂移，退化不计数');
    }
  }
}

// ---------- C. 本地 one-shot 验证工件（T1 验收：回归腿 test 闭环） ----------
const C_FILES = ['39-macro-b-jiahao.md', '39-macro-b-jiahao.json', '39-macro-b-jiahao-facts.jsonl', '39-macro-b-jiahao-measurements.json', '39-macro-b-measurements.json', '39-audit-facts.duckdb'];
t('C1 46-out/ 工件集六件齐备', C_FILES.every(f => existsSync(join(OUT, f))), C_FILES.filter(f => !existsSync(join(OUT, f))).join(','));
const side = existsSync(join(OUT, '39-macro-b-jiahao.json')) ? txt(join(OUT, '39-macro-b-jiahao.json')) : '';
t('C2 sidecar 含 receipt + scale Macro-B（与 CI verify 步同款断言）', side.indexOf('"receipt"') >= 0 && side.indexOf('"scale": "Macro-B"') >= 0);
const meas = existsSync(join(OUT, '39-macro-b-jiahao-measurements.json')) ? JSON.parse(txt(join(OUT, '39-macro-b-jiahao-measurements.json'))) : null;
t('C3 实测数在位：pc1/pc2 过 + TC 三档判定 + NC-1 过', !!meas && meas.pc1 && meas.pc1.pass === true && meas.pc2 && meas.pc2.pass === true && meas.tc1 && meas.tc1.verdict && meas.tc2 && meas.tc2.verdict && meas.tc3 && meas.tc3.verdict && meas.nc1 && meas.nc1.pass === true);
// C4 独挂 sibling 闸（D-164-a②＋R42 审计 O3）：唯它触 jiahao 活仓对象；C1~C3 仓内 46-out 断言脱连坐照跑
if (groupProbe('46-check', 'C4', JH46) && meas) {
  const headOk = /^[0-9a-f]{40}$/.test(meas.head_sha || '');
  const headType = headOk ? git(JIAHAO, ['cat-file', '-t', meas.head_sha]) : null;
  if (headOk && headType !== 'commit') {
    console.log('WARN C4 存档 head ' + meas.head_sha.slice(0, 8) + ' jiahao 活仓不可达（type=' + headType + '）——运行锚断言退化不计数（方言披露面 D-159⑤ 同 37-C1 型）');
  } else {
    t('C4 运行锚 40-hex head_sha 可解析为 git 对象', /^[0-9a-f]{40}$/.test(meas.head_sha || '') && headType === 'commit', 'head=' + (meas.head_sha || 'n/a'));
  }
}

// ---------- D. 引擎健康回归 ----------
let c33 = null;
try { c33 = execFileSync('node', [join(HERE, '33-check.mjs')], { encoding: 'utf8' }); } catch (e) { c33 = (e.stdout || '') + (e.stderr || ''); }
t('D1 33-check 回归 exit 0 + PASS N/N（同值判，值守面基线未破坏）', /PASS (\d+)\/\1/.test(c33 || '') && !/FAIL \d+/.test(c33 || ''), (c33 || '').split(NL).slice(-2).join(' | '));
t('D2 engine dist/cli.js 构建产物在', existsSync(join(REPO, 'engine', 'dist', 'cli.js')));
const shot = txt(join(HERE, '39-macro-b-one-shot.mjs'));
t('D3 one-shot 脚本迁移注记已同步（回归承载方=6F 侧 workflow，不再述 jiahao 仓内嵌）', shot.indexOf('持续回归由 6F 仓 .github/workflows/macro-b-regression.yml 承载') >= 0 && shot.indexOf('持续回归以 .github/workflows/macro-b-regression.yml 承载') < 0);
t('D4 one-shot 头注 CI 回归引用已指 6F 侧（S-2 返修钉：无 jiahao workflow 残留引用）', shot.indexOf('CI 回归用：6F .github/workflows/macro-b-regression.yml') >= 0 && shot.indexOf('CI 回归用：jiahao') < 0);

// ---------- E. 文书 ----------
const backlog = txt(join(REPO, '.scratch', 'architecture-recovery', 'BACKLOG.md'));
t('E1 BACKLOG #46 行在且含 D-046', /\| #46 \|[\s\S]*?D-046/.test(backlog));
const rep = txt(join(REPO, '.scratch', 'macro-audit', 'reports', '2026-09-16-report.md'));
t('E2 本轮执行报告含 #46 窗口节（46-check 证据登记）', rep.indexOf('#46') >= 0 && rep.indexOf('46-check') >= 0);

console.log('---');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
