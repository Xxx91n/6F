// update-33ext-registry.mjs — #33-ext / A-053 / D-041：registry watch 三态 schema 齐备化一次性迁移（幂等可重跑）
// 补 manual_watch 五要素：标记(watch=manual_watch 已有)＋责任人(owner)＋复审时点(review_at prose 已有＋review_event 机读锚)
//   ＋验证方法(verify_method)＋确认留痕(confirmations[] 归一)
// 登记 micro-a-preview-prep 事件（Micro-A preview 前置审计机读锚——manual_watch 复审时点的事件绑定面）
// meta 落文：watch_schema 三态契约＋confirmation_schema 留痕契约（确认动作留痕规范=判据版本/判定人/理由/时间戳）
// 用法：node update-33ext-registry.mjs → 写回 33-gate-registry.json 并回读断言；exit 0=齐备
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const p = join(here, '33-gate-registry.json');
const reg = JSON.parse(fs.readFileSync(p, 'utf8'));

// --- 1. 事件登记：Micro-A preview 前置审计窗口（manual_watch 复审时点机读锚） ---
if (!reg.events['micro-a-preview-prep']) {
  reg.events['micro-a-preview-prep'] = {
    occurred: false,
    evidence: 'Micro-A preview 前置审计窗口（层序 D-034：扩面→Macro-C→Micro-A→Micro-B→Macro-A——Macro-C 已闭环，Micro-A 为下一层 preview）；manual_watch 复审时点机读锚（A-053 登记，occurred 由 Micro-A preview 票开工审计时翻转）'
  };
}

// --- 2. manual_watch 五要素补齐（缺则补，值从实物推；已有字段不覆写——幂等） ---
const GUARD = 'reports/33-check.mjs';
const PATCH = {
  'desk-task4': {
    owner: '收口窗口指派（登记位：30-desk-calibration.json items[task=4].probe——阶段 3 收口窗口清点承接）',
    review_event: 'stage3-close',
    verify_method: GUARD + ' E 段 manual_watch 扫描（复审逾期/确认缺失）＋30-desk-calibration.json items[task=4].probe.satisfaction 判据清点（工业界小团队分布数据可得性）'
  },
  'desk-task9': {
    owner: '收口窗口指派（登记位：30-desk-calibration.json items[task=9].probe——阶段 3 收口窗口清点承接）',
    review_event: 'stage3-close',
    verify_method: GUARD + ' E 段 manual_watch 扫描（复审逾期/确认缺失）＋30-desk-calibration.json items[task=9].probe.satisfaction 判据清点（调度/增量形态引入信号）'
  },
  'desk-task11': {
    owner: '收口窗口指派（登记位：30-desk-calibration.json items[task=11].probe——阶段 3 收口窗口清点承接）',
    review_event: 'stage3-close',
    verify_method: GUARD + ' E 段 manual_watch 扫描（复审逾期/确认缺失）＋30-desk-calibration.json items[task=11].probe.satisfaction 判据清点（语言栈变更信号——非登记事件，复审机读锚取 stage3-close，prose 复审时点保留「/ 语言栈变更时」提前触发语义）'
  },
  'codelore-deferred-faces': {
    owner: '收口窗口指派（登记位：macro-audit decision-ledger D-035④ 暂缓面集——层 preview 票承接）',
    review_event: 'micro-a-preview-prep',
    verify_method: GUARD + ' E 段 manual_watch 扫描（复审逾期/确认缺失）＋层 preview 开工审计清点（该层契约面清单 vs faces[] 交集——有拉动即 golden 契约补齐转 bound）'
  },
  'codelore-residual-faces': {
    owner: '收口窗口指派（登记位：35-facet-reconciliation.json unregistered_residual——去向裁决落 D-xxx 原文）',
    review_event: ['micro-a-preview-prep', 'stage3-close'],
    verify_method: GUARD + ' E 段 manual_watch 扫描（复审逾期/确认缺失）＋收口窗口清点 faces[] 4 面去向（登记入暂缓面集/划归后续批次/显式弃用）并落 D-xxx 原文'
  },
  'codelore-llm-mcp-face': {
    owner: '收口窗口指派（登记位：36-llm-faces-reconciliation.json——Micro-A preview 票承接）',
    review_event: 'micro-a-preview-prep',
    verify_method: GUARD + ' E 段 manual_watch 扫描（复审逾期/确认缺失）＋Micro-A preview 前置清点（CONTEXT.md Micro-A 数据源含 CodeLore diff --llm——MCP 同族面契约补齐，golden 两形态+env 门控复用 #36 契约）'
  },
  'upstream-probes-scorecard-repomix': {
    review_event: 'micro-a-preview-prep'
  }
};
for (const it of reg.items) {
  const patch = PATCH[it.id];
  if (!patch) continue;
  for (const k of Object.keys(patch)) {
    if (it[k] === undefined) it[k] = patch[k];
  }
  if (!Array.isArray(it.confirmations)) it.confirmations = [];
}

// --- 3. meta 落文：三态契约＋留痕契约 ---
reg.meta.extended = 'A-053（2026-09-16）#33-ext：manual_watch 五要素齐备化（owner/review_event/verify_method 补齐＋confirmations 字段归一）＋micro-a-preview-prep 事件登记＋守卫 fail-closed 事件引用/event_bound 覆盖率/risk_accepted 候选名单扩展——round8-35-audit W6 补洞';
reg.meta.watch_schema = 'watch 三态：event_bound（默认——须 trigger_event 或 deadline_event 至少一锚）/ manual_watch（五要素：标记=watch 字段值本身＋责任人 owner＋复审时点 review_at prose＋review_event 机读锚＋验证方法 verify_method＋确认留痕 confirmations[]）/ risk_accepted（三要素：acceptor＋reason＋expires_at——翻转权属人工裁决，守卫仅输出 RISK-ACCEPTED-CANDIDATE 候选名单不自动改 status）';
reg.meta.confirmation_schema = 'confirmations[] 记录必备四字段：at（时间戳）/by（判定人）/criterion_version（判据版本）/reason（理由）；evidence=证据锚（缺→WARN）；decision=裁定标签';

fs.writeFileSync(p, JSON.stringify(reg, null, 2) + '\n', 'utf8');

// --- 4. 回读断言 ---
const back = JSON.parse(fs.readFileSync(p, 'utf8'));
const mw = back.items.filter(i => (i.watch || 'event_bound') === 'manual_watch');
const missing = mw.filter(i => !(i.owner && i.review_at && i.review_event && i.verify_method && Array.isArray(i.confirmations))).map(i => i.id);
const bom = fs.readFileSync(p);
const hasBom = bom[0] === 0xEF && bom[1] === 0xBB && bom[2] === 0xBF;
console.log('manual_watch items=' + mw.length + ' 五要素缺失=' + (missing.length ? missing.join(',') : '无'));
console.log('events=' + Object.keys(back.events).length + ' micro-a-preview-prep=' + !!back.events['micro-a-preview-prep'] + ' items=' + back.items.length + ' BOM=' + hasBom);
if (missing.length || !back.events['micro-a-preview-prep'] || hasBom) { console.error('MIGRATION-ASSERT-FAIL'); process.exit(1); }
console.log('MIGRATION-OK');
