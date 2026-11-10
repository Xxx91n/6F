// collect/file-lineage.ts — 文件重命名血缘事实记录（#80 步骤① / D-125；Micro-B 文件卡=预采集数据×单文件主体×血缘事实）
// 文件重命名血缘属于关键事实，若无法判断则如实记录分叉历史而不人工编造
// 纯逻辑规则：git 原始数据通过参数传入；不读写文件系统、不启动子进程。
// 检测方式：git log --name-status -z --find-renames=<threshold>（参考 git diffcore -M 标准机制；
//   -z 输出原始字节路径避免转义，特殊字符与非 ASCII 字符交由路径规范函数统一处理）。
// 事实结构：file_renamed{from,to,head_sha,commit_sha,similarity,threshold,detector_version,git_version}
//   ——检测参数完整存入事实以便重复计算验证（D-125②）；detector_version 为本仓库检测规格固定版本，
//   git_version 为实际检测时的 git 命令版本（随数据记录以备核验）。
// 连续性跟踪：在生成文件视图时，沿重命名血缘链追溯文件的演进历史（D-125③）；
// 若历史重命名未被完全识别，如实展现分叉状态，不凭空捏造。
import { normalizeSubjectPath } from '../fact/subject.js';
import { makeFact, sha256Hex } from './collectors.js';
export const FILE_LINEAGE_ID = 'file-lineage@v1';
export const FILE_LINEAGE_FAMILY = 'file-lineage';
export const FILE_LINEAGE_DESCRIPTOR = {
    id: FILE_LINEAGE_ID,
    family: FILE_LINEAGE_FAMILY,
    dimension: null,
    quadrant: 'strategic'
};
// 检测规格版本（本仓库流程规格固定——跨 git 版本可复查验证，实际执行的 git 版本保存在 git_version 中）
export const RENAME_DETECTOR_VERSION = 'rename-detector@v1';
export const RENAME_DEFAULT_THRESHOLD = '50%'; // 默认阈值设为 50%（D-125⑤）
// 统一使用同一个命令行参数构造函数，供实际运行与证据记录共用——防止两边参数不一致。
export function gitRenameLogArgs(threshold) {
    return ['log', '--format=__R__%H', '--name-status', '-z', '--find-renames=' + threshold, 'HEAD'];
}
// git log --format=__R__%H --name-status -z 的输出格式：
//   __R__<sha>\0\n<status>\0[<path>\0]...   —— 提交行以 NUL 结尾，后跟一个换行符分隔；
//   R<score>\0<from>\0<to>\0（重命名或复制类包含源和目标两个路径）；A/M/D/T 等单路径为 \0<path>\0。
export function parseRenameLogZ(raw) {
    const edges = [];
    const tokens = raw.split(String.fromCharCode(0));
    let curSha = '';
    for (let i = 0; i < tokens.length; i++) {
        let tok = tokens[i];
        if (tok.indexOf('__R__') === 0) {
            curSha = tok.slice(5).trim();
            continue;
        }
        tok = tok.replace(/^[\s\n]+/, '');
        if (tok.length === 0) {
            continue;
        }
        const status = tok.charAt(0);
        if (status === 'R' || status === 'C') {
            const score = Number(tok.slice(1));
            const from = i + 1 < tokens.length ? tokens[i + 1] : '';
            const to = i + 2 < tokens.length ? tokens[i + 2] : '';
            // 快速报错机制：若源路径或目标路径缺失（输出被截断或结构不完整），直接报错而不悄悄丢弃记录；
            //   对于复制操作（C=copy）正常读取并跳过对应的源与目标，重命名血缘仅记录 R 类型。
            if (from.length === 0 || to.length === 0) {
                throw new Error('RENAME-LOG-TRUNCATED status=' + status + ' tokenIndex=' + i + ' sha=' + curSha);
            }
            i += 2;
            if (status === 'R') {
                edges.push({ commit_sha: curSha, similarity: Number.isFinite(score) ? score : 100, from: from, to: to });
            }
        }
        else {
            i += 1; // 单路径条目（A/M/D/T/X）跳过一个路径参数
        }
    }
    return edges;
}
export function collectFileLineage(input, ctx) {
    const out = [];
    const seen = new Set();
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
        const value = {
            from: fromN.ok ? fromN.subject : e.from,
            to: toN.subject,
            head_sha: input.headSha,
            commit_sha: e.commit_sha,
            similarity: e.similarity,
            threshold: input.threshold,
            detector_version: input.detectorVersion,
            git_version: input.gitVersion
        };
        const key = sha256Hex(JSON.stringify([value.from, value.to, value.commit_sha, value.threshold, input.detectorVersion]));
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, toN.subject, e.commit_sha, 'file.renamed', value));
    }
    const commits = new Set();
    for (const e of input.edges) {
        commits.add(e.commit_sha);
    }
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
