// collect/file-lineage.ts —— 文件改名留下的血缘事实（#80 步骤① / D-125；单文件档的卡＝预先采的数据×这一份文件×血缘事实）
// 改名是条要紧的事实，判不清就照实把分叉记下来，别自己编一条历史。
// 纯逻辑：git 的原始数据从参数传进来；不碰文件系统、不起子进程。
// 怎么检测：git log --name-status -z --find-renames=<threshold>（照着 git diffcore -M 那套机制来；
// -z 出去的是原始字节路径，省得转义；怪字符和非 ASCII 交给路径规范函数统一处理）。
// 事实长这样：file_renamed{from,to,head_sha,commit_sha,similarity,threshold,detector_version,git_version}
// 检测用的参数全塞进事实里，回头能重算核一遍（D-125②）；detector_version 是仓里这套检测规格的固定版本号，
// git_version 是这次检测实际用的 git 版本（跟着数据一起存，将来好核对）。
// 怎么追血统：生成文件视图时顺着改名链往回追，看这个文件一路怎么走过来的（D-125③）；
// 改名没追全就照实摆出分叉，别凭空给补一条。

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

// 检测规格的版本号（仓里这套流程钉死的；换个 git 版本也能复查，这次检测的 git 版本另存在 git_version 里）
export const RENAME_DETECTOR_VERSION = 'rename-detector@v1';
export const RENAME_DEFAULT_THRESHOLD = '50%'; // 默认阈值 50%，这个数是 D-125⑤ 定下来的

export interface RenameEdge {
  commit_sha: string;
  similarity: number; // git 算出来的相似度，整数百分比
  from: string;
  to: string;
}

// 跑的时候和记证据的时候用同一个参数构造函数，省得两边造出来的参数对不上。
export function gitRenameLogArgs(threshold: string): string[] {
  return ['log', '--format=__R__%H', '--name-status', '-z', '--find-renames=' + threshold, 'HEAD'];
}

// git log --format=__R__%H --name-status -z 吐出来长这样：
// __R__<sha>\0\n<status>\0[<path>\0]...   提交行以 NUL 收尾，后头跟一个换行分开；
// R<score>\0<from>\0<to>\0（改名或复制这类带源和目标两个路径）；A/M/D/T 这些单路径是 \0<path>\0。
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
      // 出问题赶紧喊：源路径或目标路径缺了（输出被截断或结构不全），当场报错，别悄没声地把记录丢了；
      // 复制操作（C=copy）正常读过去，源和目标一起跳过；血缘只记改名的 R 这一类。
      if (from.length === 0 || to.length === 0) { throw new Error('RENAME-LOG-TRUNCATED status=' + status + ' tokenIndex=' + i + ' sha=' + curSha); }
      i += 2;
      if (status === 'R') {
        edges.push({ commit_sha: curSha, similarity: Number.isFinite(score) ? score : 100, from: from, to: to });
      }
    } else {
      i += 1; // 单路径条目（A/M/D/T/X）只要跳一个路径参数
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
