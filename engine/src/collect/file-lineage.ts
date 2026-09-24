// collect/file-lineage.ts — file_renamed 血缘一等事实发射（#80 步① / D-125 / ADR-0023）
// 纯逻辑约束：git 字节输入经参数注入；不读 fs、不起子进程。
// 检测=git log --name-status -z --find-renames=<threshold>（git diffcore -M 先例；
//   -z 原字节路径不 C-quote——非 ASCII/NFC 判定不交 git quotepath 而交 subject 归一器）。
// 事实载荷 file_renamed{from,to,head_sha,commit_sha,similarity,threshold,detector_version,git_version}
//   ——检测参数全入载荷可复算（D-125②）；detector_version=本仓检测规格版本（固定），
//   git_version=二进制观测值随行（跨版本可复算验证项的举证字段，不入骨架锁）。
// 缝合职责=投影层（事实层身份恒为规范化 path，跨 rename 连续性由读模型沿血缘链达成，D-125③）；
// 漏判=历史诚实分裂可见不编造（git「rename 是猜的」官方心智）。

import { normalizeSubjectPath } from '../fact/subject.js';
import { makeFact, sha256Hex } from './collectors.js';
import type { CollectContext, CollectedFact, CollectorDescriptor } from './collectors.js';

export const FILE_LINEAGE_ID = 'file-lineage@v1';
export const FILE_LINEAGE_FAMILY = 'file-lineage';
export const FILE_LINEAGE_DESCRIPTOR: CollectorDescriptor = {
  id: FILE_LINEAGE_ID,
  family: FILE_LINEAGE_FAMILY,
  dimension: null,
  quadrant: 'strategic'
};

// 检测规格版本（本仓管线规格固定——跨 git 版本可复算性=票面验证项，举证字段=载荷内 git_version）
export const RENAME_DETECTOR_VERSION = 'rename-detector@v1';
export const RENAME_DEFAULT_THRESHOLD = '50%';   // -M 50% 先例（D-125⑤）

export interface RenameEdge {
  commit_sha: string;
  similarity: number;   // git R<score> 百分整数
  from: string;
  to: string;
}

// 同一 argv 构建器供运行与 evidence 共用（codeloreAnalysisArgs 同模式——防两处表达漂移）。
export function gitRenameLogArgs(threshold: string): string[] {
  return ['log', '--format=__R__%H', '--name-status', '-z', '--find-renames=' + threshold, 'HEAD'];
}

// git log --format=__R__%H --name-status -z 字节布局（实测钉死）：
//   __R__<sha>\0\n<status>\0[<path>\0]...   —— 提交行 NUL 终止后跟一个 LF 分隔；
//   R<score>\0<from>\0<to>\0（rename/copy 类双路径）；A/M/D/T 等单路径 \0<path>\0。
export function parseRenameLogZ(raw: string): RenameEdge[] {
  const edges: RenameEdge[] = [];
  const tokens = raw.split(String.fromCharCode(0));
  let curSha = '';
  for (let i = 0; i < tokens.length; i++) {
    let tok = tokens[i];
    if (tok.indexOf('__R__') === 0) { curSha = tok.slice(5).trim(); continue; }
    tok = tok.replace(/^[\s\n]+/, '');
    if (tok.length === 0) { continue; }
    const status = tok.charAt(0);
    if (status === 'R' || status === 'C') {
      const score = Number(tok.slice(1));
      const from = i + 1 < tokens.length ? tokens[i + 1] : '';
      const to = i + 2 < tokens.length ? tokens[i + 2] : '';
      // fail-fast 协议纪律：R/C 双路径记录 from/to token 缺席（缓冲截断）或空串（结构不全）→抛错不静默丢边；
      //   良构 C=copy 记录照常消费（i+=2）不发射——rename 血缘只认 R 边。
      if (from.length === 0 || to.length === 0) { throw new Error('RENAME-LOG-TRUNCATED status=' + status + ' tokenIndex=' + i + ' sha=' + curSha); }
      i += 2;
      if (status === 'R') {
        edges.push({ commit_sha: curSha, similarity: Number.isFinite(score) ? score : 100, from: from, to: to });
      }
    } else {
      i += 1;   // 单路径条目（A/M/D/T/X）跳过一个路径 token
    }
  }
  return edges;
}

export interface FileLineageInput {
  edges: readonly RenameEdge[];
  headSha: string;
  threshold: string;
  detectorVersion: string;
  gitVersion: string;
}

export function collectFileLineage(input: FileLineageInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  for (const e of input.edges) {
    const toN = normalizeSubjectPath(e.to);
    const fromN = normalizeSubjectPath(e.from);
    if (!toN.ok) {
      skipped += 1;
      out.push(makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, 'file-lineage', gitRenameLogArgs(input.threshold).join(' '), 'file.lineage_skip', {
        raw_to: e.to,
        raw_from: e.from,
        commit_sha: e.commit_sha,
        reason: toN.reason
      }));
      continue;
    }
    const value: Record<string, unknown> = {
      from: fromN.ok ? (fromN.subject as string) : e.from,
      to: toN.subject,
      head_sha: input.headSha,
      commit_sha: e.commit_sha,
      similarity: e.similarity,
      threshold: input.threshold,
      detector_version: input.detectorVersion,
      git_version: input.gitVersion
    };
    const key = sha256Hex(JSON.stringify([value.from, value.to, value.commit_sha, value.threshold, input.detectorVersion]));
    if (seen.has(key)) { continue; }
    seen.add(key);
    out.push(makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, toN.subject as string, e.commit_sha, 'file.renamed', value));
  }
  const commits = new Set<string>();
  for (const e of input.edges) { commits.add(e.commit_sha); }
  out.push(makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, ctx.repoRef, gitRenameLogArgs(input.threshold).join(' '), 'file.lineage_scan', {
    head_sha: input.headSha,
    edges: seen.size,
    skipped: skipped,
    commits_with_renames: commits.size,
    threshold: input.threshold,
    detector_version: input.detectorVersion,
    git_version: input.gitVersion
  }));
  return out;
}
