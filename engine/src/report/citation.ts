// report/citation.ts — 引文核验叶子模块（轮 14 审计返工 C1：破 generate↔narrative 循环 import）
// 纯逻辑约束同 generate.ts：输入一律注入、无 fs/子进程/网络/LLM。
// 此模块为零依赖叶子：generate.ts 与 narrative.ts 均从这里取引文核验与 UNVERIFIED_MARK。

export const UNVERIFIED_MARK = '⚠ unverified';

export type SupportRelation = 'supports' | 'insufficient' | 'contradicts';

export interface EvidenceItem {
  evidence_id: string;
  source: string;
  locator: string;
  claim: string;
  grounded: boolean;
  collected_at: string;
  reproduce_cmd: string;
  reproduce_absent_reason: string | null;
  required_tokens: readonly string[];
  excerpt: string;
}

export interface ClaimAnchor {
  claim_id: string;
  evidence_id: string;
  required_tokens: readonly string[];
}

export interface CitationCheck {
  claim_id: string;
  evidence_id: string;
  support: SupportRelation;
  matched_tokens: string[];
  missing_tokens: string[];
  reason: string;
}

export function checkCitationSupport(claim: ClaimAnchor, evidence: EvidenceItem): CitationCheck {
  const matched: string[] = [];
  const missing: string[] = [];
  if (!evidence.grounded || evidence.excerpt.length === 0) {
    return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: 'insufficient', matched_tokens: [], missing_tokens: claim.required_tokens.slice(), reason: '引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论' };
  }
  const hay = evidence.excerpt.toLowerCase();
  for (const tok of claim.required_tokens) {
    if (hay.indexOf(tok.toLowerCase()) >= 0) { matched.push(tok); } else { missing.push(tok); }
  }
  if (missing.length === 0) {
    return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: 'supports', matched_tokens: matched, missing_tokens: [], reason: '全部支撑锚在引文原文中逐字命中' };
  }
  return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: 'insufficient', matched_tokens: matched, missing_tokens: missing, reason: '支撑锚未命中：' + missing.join(', ') };
}

export function checkAllCitations(claims: readonly ClaimAnchor[], evidence: readonly EvidenceItem[]): CitationCheck[] {
  const index: Record<string, EvidenceItem> = {};
  for (const e of evidence) { index[e.evidence_id] = e; }
  const out: CitationCheck[] = [];
  for (const c of claims) {
    const e = index[c.evidence_id];
    if (!e) {
      out.push({ claim_id: c.claim_id, evidence_id: c.evidence_id, support: 'insufficient', matched_tokens: [], missing_tokens: c.required_tokens.slice(), reason: '引文锚不可解析（evidence_id 不存在）' });
      continue;
    }
    out.push(checkCitationSupport(c, e));
  }
  return out;
}
