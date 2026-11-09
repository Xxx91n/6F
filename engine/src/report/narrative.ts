// report/narrative.ts — 叙事双轨的内核逻辑面（叙事不能带判定结果）
// 职责边界：叙事由宿主 agent 来写（模型生成）；内核只做确定性的盖章——
//   ① sealNarrative：逐条检查引文（是否落地、有没有证据以及对应的词句）；
//   ② 判定结果红线机检：叙事段落里绝对不能带判定档位（比如 S1-S5 判定渗入叙事就违规）；
//   ③ renderTemplateNarrative：内核模板叙事作为降级兜底（带上未验证标记，不能冒充正式叙事）；
//   ④ 记录模型标识：宿主 agent 写的叙事必须记录 model_id。
// 纯逻辑约束同 generate.ts：输入一律注入，不读文件系统、不起子进程、不发网络请求、不接大模型。

import { checkAllCitations, UNVERIFIED_MARK } from './citation.js';
import type { CitationCheck, EvidenceItem } from './citation.js';
import type { Report } from './generate.js';

export const NARRATIVE_SEAL_PROTOCOL = 'ADR-0013-C/v1+narrative-seal/v1';

// 叙事内单条断言：claim_id 自命名（建议 NC-n），evidence_id 必须指向 C3 证据锚点，
// required_tokens = 支撑锚词（和 checkCitationSupport 保持一致）。
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

// ---- 判定结果红线机检：叙事段只带引文盖章，不能带判定档位 ----
// 命中即违规：维度判定赋值（S1-S5 后接判定符）、判定字段名（verdict/band/verdict_gate/overall_verdict）、
// 判定赋值句式、中文裁定句式。只扫描叙事内容，不影响裁决块本身。
// 这里的意图：verdict-field-en 裸词 \bverdict\b 命中即拦是刻意从严——
// 叙事段里提到判定字段名本身就是越界信号（叙事事前探口风或事后复述判定都是违规），不予放行。
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

// ---- 盖章流程：宿主 agent 叙事段 → 内核 sealNarrative → 写入报告 ----
// 返回 SealedNarrative：三种盖章状态 + 每条 claim 的检查明细（哪个 token 对应哪条证据）。
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

// ---- 内核模板叙事兜底 ----
// 专用于降级场景：只在降级报告中生效；内容不做超出裁决块的断言，判定结果一律指回 C2 裁决块。
export function renderTemplateNarrative(r: Pick<Report, 'quadrants' | 'degraded_reason'>): NarrativeSection {
  const quads = r.quadrants.map(function (q) { return q.quadrant; }).join('·');
  const text = [
    '本段为内核模板叙事（降级兜底 ' + UNVERIFIED_MARK + '）：',
    '四象限覆盖 ' + quads + '，各维度判定见 C2 结构化裁决块（本段不重复断言任何判定）；',
    '证据与引文支持关系见 C3；降级原因：' + (r.degraded_reason ? r.degraded_reason : '未声明') + '。',
    '正式叙事由宿主 agent 通过事实表只读投影取数后生成，模板叙事不替代正式叙事。'
  ].join('');
  return {
    section_id: 'kernel-template-fallback',
    author: 'kernel-template',
    model_id: null,
    text: text,
    claims: []
  };
}
