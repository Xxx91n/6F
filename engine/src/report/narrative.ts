// report/narrative.ts — 叙事双轨 kernel 面（D-053 / A-057 / ADR-0013 band 红线）
// 职责边界（D-058）：叙事生成归宿主 agent（概率面，模型驱动）；kernel 只做确定性盖章——
//   ① sealNarrative：逐 claim 走 checkAllCitations（grounded / 未引证＋失败明细 token↔evidence）；
//   ② band 红线机检：叙事段不得携带裁决 band（S1-S5 band 判定渗入叙事即违规——ADR-0013/D-026）；
//   ③ renderTemplateNarrative：kernel 模板叙事=degraded 兜底位（复用 UNVERIFIED_MARK，永不得冒充正式叙事）；
//   ④ model id 可溯：host-agent 叙事必记 model_id（D-053⑤，CodeLore stamp 同款纪律）。
// 纯逻辑约束同 generate.ts：输入一律注入、无 fs/子进程/网络/LLM。

import { checkAllCitations, UNVERIFIED_MARK } from './generate.js';
import type { CitationCheck, EvidenceItem, Report } from './generate.js';

export const NARRATIVE_SEAL_PROTOCOL = 'ADR-0013-C/v1+narrative-seal/v1';

// 叙事内单条断言：claim_id 自命名（建议 NC-n），evidence_id 必指 C3 证据锚，
// required_tokens = 支撑锚词（与 checkCitationSupport 同一契约面）。
export interface NarrativeClaim {
  claim_id: string;
  evidence_id: string;
  required_tokens: readonly string[];
  text: string;
}

export type NarrativeAuthor = 'host-agent' | 'kernel-template';

export interface NarrativeSection {
  section_id: string;
  author: NarrativeAuthor;
  model_id: string | null;
  text: string;
  claims: readonly NarrativeClaim[];
}

export type SealStamp = 'sealed' | 'sealed-with-gaps' | 'rejected';

export interface NarrativeSeal {
  protocol: string;
  sealed_at: string;
  stamp: SealStamp;
  checks: CitationCheck[];
  band_violations: string[];
  model_id_recorded: boolean;
}

export interface SealedNarrative {
  section_id: string;
  author: NarrativeAuthor;
  model_id: string | null;
  text: string;
  claims: NarrativeClaim[];
  seal: NarrativeSeal;
}

// ---- band 红线机检（D-053 红线：叙事段只带 citation 盖章、不得携带裁决 band）----
// 命中即违规：维度 band 赋值（S1-S5 后接判定符）、裁决字段名（verdict/band/verdict_gate/overall_verdict）、
// band 赋值句式、中文裁定句式。只扫叙事面，不影响裁决块本体。
const BAND_PATTERNS: readonly { name: string; re: RegExp }[] = [
  { name: 'dimension-band-assignment', re: new RegExp('\\bS[1-5]\\s*[:=：＝]') },
  { name: 'verdict-field-en', re: new RegExp('\\b(verdict|verdict_gate|overall_verdict|verdict_band)\\b', 'i') },
  { name: 'band-field-en', re: new RegExp('\\bband\\s*[:=：＝]', 'i') },
  { name: 'verdict-word-assertion', re: new RegExp('\\b(supported|unsupported|insufficient)\\s*[:：]', 'i') },
  { name: 'cjk-verdict-assertion', re: new RegExp('(裁定为|裁定：|判红|判绿|判黄|本段裁定|叙事裁定)') },
  { name: 'quadrant-band-assertion', re: new RegExp('(象限|维度)\\s*(裁定|判定)\\s*[:：=＝]') }
];

export function scanBandViolations(text: string): string[] {
  const out: string[] = [];
  for (const p of BAND_PATTERNS) {
    const m = text.match(p.re);
    if (m) { out.push(p.name + ' :: ' + m[0]); }
  }
  return out;
}

// ---- 盖章链路（D-053③）：宿主 agent 叙事段 → kernel sealNarrative → 入报告 ----
// 返回 SealedNarrative：stamp 三态 + 每 claim 明细（哪个 token↔哪条 evidence，CiteGuard Auditable 原则）。
export function sealNarrative(section: NarrativeSection, evidence: readonly EvidenceItem[], sealedAt: string): SealedNarrative {
  const checks = checkAllCitations(
    section.claims.map(function (c) { return { claim_id: c.claim_id, evidence_id: c.evidence_id, required_tokens: c.required_tokens }; }),
    evidence
  );
  const bandViolations = scanBandViolations(section.text)
    .concat(section.claims.map(function (c) { return scanBandViolations(c.text).map(function (v) { return c.claim_id + '/' + v; }); }).reduce(function (a, b) { return a.concat(b); }, [] as string[]));
  const modelIdOk = section.author === 'host-agent' ? (section.model_id !== null && section.model_id.length > 0) : true;
  let stamp: SealStamp = 'sealed';
  if (bandViolations.length > 0 || !modelIdOk) { stamp = 'rejected'; }
  else if (checks.some(function (c) { return c.support !== 'supports'; })) { stamp = 'sealed-with-gaps'; }
  return {
    section_id: section.section_id,
    author: section.author,
    model_id: section.model_id,
    text: section.text,
    claims: section.claims.slice(),
    seal: {
      protocol: NARRATIVE_SEAL_PROTOCOL,
      sealed_at: sealedAt,
      stamp: stamp,
      checks: checks,
      band_violations: bandViolations,
      model_id_recorded: modelIdOk
    }
  };
}

export function sealNarrativeSections(sections: readonly NarrativeSection[], evidence: readonly EvidenceItem[], sealedAt: string): SealedNarrative[] {
  return sections.map(function (s) { return sealNarrative(s, evidence, sealedAt); });
}

// ---- kernel 模板叙事兜底（D-053① degraded 位）----
// 永居 degraded：只在 degraded 报告位可达；文本不做任何超出裁决块的断言，band 值一律指回 C2 裁决块。
export function renderTemplateNarrative(r: Report, at: string): NarrativeSection {
  const quads = r.quadrants.map(function (q) { return q.quadrant; }).join('·');
  const text = [
    '本段为 kernel 模板叙事（degraded 兜底位 ' + UNVERIFIED_MARK + '）：',
    '四象限覆盖 ' + quads + '，逐维裁定见 C2 结构化裁决块（本段不重复断言任何判定）；',
    '证据与引文支持关系见 C3；降级原因：' + (r.degraded_reason ? r.degraded_reason : '未声明') + '。',
    '正式叙事归宿主 agent 经 MCP facts 只读投影取数后生成——模板叙事不替代之。'
  ].join('');
  return {
    section_id: 'kernel-template-fallback',
    author: 'kernel-template',
    model_id: null,
    text: text,
    claims: []
  };
}
