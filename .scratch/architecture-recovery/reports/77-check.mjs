// 77-check.mjs — #77/D-098 门面致谢面建制守卫（生成式锚段 closed 对账 + badge/homepage 落位）
// 断言面：A 枚举对账（lock active 集⇔生成器模板集⇔节内成员行 三向互等；regen→diff empty）
//   → B 位置形态（节在 Honesty notes 前=末位节、锚段 marker 双文件在、zh {#acknowledgments} 钉回）
//   → C 内容纪律（无版本字面/pin/契约字样、链接=https 上游主页、禁 .scratch 路径、脚注指 lock）
//   → D zh 派生镜像互等（成员行数/链接集）　→ E badge 挂载实物钉（双文件 native actions badge+href）
// 用法：node 77-check.mjs → 逐条 PASS/FAIL；exit 0=全 PASS
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const LOCK = join(ROOT, 'engine', 'upstream-lock.yaml');
const GEN = join(ROOT, 'engine', 'scripts', 'gen-acknowledgments.mjs');
const EN = join(ROOT, 'README.md');
const ZH = join(ROOT, 'README.zh-CN.md');

let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' | ' + extra : '')); ok ? pass++ : fail++; };
const txt = p => fs.readFileSync(p, 'utf8');

// ---------- A. closed 对账（枚举面三向互等） ----------
// lock 极简解析（与生成器同源形制：两空格 - id: / 四空格 status:）
const lockTxt = txt(LOCK);
const lockEntries = [];
let cur = null;
for (const line of lockTxt.split(/\r?\n/)) {
  const mId = line.match(/^\s{2}-\s+id:\s*(\S+)/);
  if (mId) { cur = { id: mId[1] }; lockEntries.push(cur); continue; }
  const mSt = line.match(/^\s{4}status:\s*(\S+)/);
  if (mSt && cur) cur.status = mSt[1];
}
const activeIds = lockEntries.filter(e => e.status === 'active').map(e => e.id);
t('A1 锁表解析在位：active 集非空（当前 ' + activeIds.length + '）', activeIds.length >= 1, activeIds.join(','));

// 生成器模板键集（独立 regex 抽取——不 import 生成器内部，防共模漂移）
const genSrc = txt(GEN);
const tplKeys = [...genSrc.matchAll(/^  '([\w-]+)': \{\s*$/gm)].map(m => m[1]);
const missing = activeIds.filter(id => tplKeys.indexOf(id) < 0);
const extra = tplKeys.filter(id => activeIds.indexOf(id) < 0);
t('A2 模板键集⇔active 集双向差集为空（缺=' + missing.join(',') + '／多=' + extra.join(',') + '）',
  missing.length === 0 && extra.length === 0, tplKeys.length + ' tpl vs ' + activeIds.length + ' active');

// regen→diff empty（生成器 --check：模板集⇔active＋渲染==盘上 双文件）
const chk = spawnSync(process.execPath, [GEN, '--check'], { encoding: 'utf8' });
t('A3 regen→diff empty（gen-acknowledgments --check exit 0＝生成物与锁表同步）', chk.status === 0, (chk.stdout || '').trim().split('\n').slice(-1)[0]);

// ---------- B. 位置形态 ----------
const en = txt(EN), zh = txt(ZH);
const enLines = en.split(/\r?\n/), zhLines = zh.split(/\r?\n/);
const BLOCK = /<!--\s*acknowledgments:start[\s\S]*?<!--\s*acknowledgments:end\s*-->/;
const enBlock = (en.match(BLOCK) || [''])[0];
const zhBlock = (zh.match(BLOCK) || [''])[0];
t('B1 EN 锚段 marker 对在（生成物边界可机替）', BLOCK.test(en));
t('B2 zh 锚段 marker 对在', BLOCK.test(zh));
const enAckIdx = enLines.findIndex(l => /^##\s+Acknowledgments\s*$/.test(l));
const enHonIdx = enLines.findIndex(l => /^##\s+Honesty notes\s*$/.test(l));
const enBetween = enAckIdx >= 0 && enHonIdx > enAckIdx ? enLines.slice(enAckIdx + 1, enHonIdx).filter(l => /^##\s/.test(l)) : ['x'];
t('B3 EN 节位=Honesty notes 之前且其间无他节（门面尾部纪律）', enAckIdx > 0 && enHonIdx > enAckIdx && enBetween.length === 0, 'ack@' + enAckIdx + ' honesty@' + enHonIdx);
const zhAckIdx = zhLines.findIndex(l => /^##\s+.*\{#acknowledgments\}\s*$/.test(l));
const zhHonIdx = zhLines.findIndex(l => /^##\s+.*\{#honesty-notes\}\s*$/.test(l));
t('B4 zh 节位=诚实注记之前＋{#acknowledgments} 钉回 EN slug（D-088）', zhAckIdx > 0 && zhHonIdx > zhAckIdx, 'ack@' + zhAckIdx + ' honesty@' + zhHonIdx);

// ---------- C. 内容纪律（D-098④⑤：禁版本/pin/契约；链接=上游主页；禁 .scratch） ----------
const enMember = enBlock.split('\n').filter(l => /^- \*\*\[/.test(l));
t('C1 EN 成员行数 == active 集大小（一人一行）', enMember.length === activeIds.length, enMember.length + '/' + activeIds.length);
t('C2 节内无版本字面/pin/契约字样（工程证据面归 lock——禁第二漂移副本）', !/\d+\.\d+|pin_type|contract:|version:/i.test(enBlock), '');
t('C3 节内链接=https 上游主页且禁 .scratch 快照路径', enMember.every(l => /\]\(https:\/\//.test(l)) && !/\.scratch/.test(enBlock), '');
t('C4 脚注指 lock 全集（planned/evaluating/retired 链接而非复制进面）', enBlock.indexOf('planned') >= 0 && enBlock.indexOf('](engine/upstream-lock.yaml)') >= 0, '');

// ---------- D. zh 派生镜像（D-088） ----------
const zhMember = zhBlock.split('\n').filter(l => /^- \*\*\[/.test(l));
t('D1 zh 成员行数 == EN 成员行数', zhMember.length === enMember.length && zhMember.length > 0, 'zh=' + zhMember.length + ' en=' + enMember.length);
const urls = b => b.split('\n').map(l => (l.match(/\]\((https:[^)]+)\)/) || [])[1]).filter(Boolean).sort();
t('D2 zh 节内上游链接集 == EN 节内链接集', JSON.stringify(urls(zhBlock)) === JSON.stringify(urls(enBlock)), 'n=' + urls(enBlock).length);
t('D3 zh 脚注指 lock 全集', zhBlock.indexOf('](engine/upstream-lock.yaml)') >= 0, '');

// ---------- E. CI badge 挂载实物（D-089⑤ 事件已发生→徽标指 main workflow） ----------
const BADGE_IMG = 'actions/workflows/engine-ci.yml/badge.svg';
const BADGE_HREF = 'github.com/Xxx91n/6F/actions/workflows/engine-ci.yml';
t('E1 EN badge 挂载：img=badge.svg?branch=main 且 href 指 workflow 页', en.indexOf(BADGE_IMG) >= 0 && en.indexOf(BADGE_HREF) >= 0, '');
t('E2 zh badge 镜像同挂', zh.indexOf(BADGE_IMG) >= 0 && zh.indexOf(BADGE_HREF) >= 0, '');

console.log('');
console.log((fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
