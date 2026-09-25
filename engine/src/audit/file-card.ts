// audit/file-card.ts — `audit file` lazy 补采编排（#80 步② / D-122/D-126 / ADR-0023）
// 双触发面之 CLI 面：miss→仓级管线重跑产新观测集 append 非覆盖（同构发射管线——与批量同一 emit 函数、
//   同 grain 同 fact_id 规则；lazy 是发射时机非 grain/身份决策）。MCP 面永不写。
// 资格检查=目标 SHA 对象库可达（git rev-parse HEAD）；脏工作区零感知（只读 git 观测，不 stat 工作树）。
// DuckDB SWMR：补采写连接先关再开读连接投影卡（同库读写不并存）。

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { repoAdd, type RepoAddResult } from '../intake/intake.js';
import { auditRepoName } from './audit.js';
import { macroBContext, probeGitVersion } from './macro-b.js';
import { collectCodeloreFacets, CODELORE_BEHAVIOR_FACETS } from '../upstream/codelore.js';
import { collectFileLineage, gitRenameLogArgs, parseRenameLogZ, RENAME_DEFAULT_THRESHOLD, RENAME_DETECTOR_VERSION } from '../collect/file-lineage.js';
import { absorbGitIsoDialect, classifyGitIsoField } from '../intake/quarantine.js';
import { openWriter, closeDuckdb, appendFact, isAuditIoError, isFactIdUniqueViolation, existingFactIds, runInTransaction } from '../fact/store.js';
import { headShaOfRepoRef } from '../fact/file-card.js';
import { projectFileCard } from '../fact/projection.js';
import { buildFileCard } from '../fact/file-card.js';
import type { FileCard } from '../fact/file-card.js';
import type { CollectContext, CollectedFact } from '../collect/collectors.js';

export class AuditFileError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}
export function isAuditFileError(e: unknown): e is AuditFileError {
  return e instanceof AuditFileError || (typeof e === 'object' && e !== null && typeof (e as { code?: unknown }).code === 'string' && String((e as { code?: unknown }).code).indexOf('AUDIT-FILE-') === 0);
}

export interface AuditFileCollectors {
  // 注入缝（测试确定性）：默认=真实发射管线；注入函数收 ctx 返 CollectedFact[]。
  codelore?: (ctx: CollectContext, repoRoot: string) => CollectedFact[];
  lineage?: (ctx: CollectContext, repoRoot: string) => CollectedFact[];
}

export interface AuditFileOptions {
  input: string;                    // repo 输入（repoAdd 三段式复用）
  path: string;                     // 目标文件路径（卡内归一）
  db: string;                       // facts.duckdb 路径（缺则创建——append 非覆盖）
  at?: string;                      // at:<sha> pin——pin 时禁补采（观测集缺席照答 miss 不伪造采集）
  cwd?: string;
  collectors?: AuditFileCollectors; // 测试注入缝
}

export interface AuditFileResult {
  card: FileCard;
  backfilled: boolean;
  emitted: number;                  // 本次补采新增事实数（0=纯 prefetch 读）
  skipped: number;                  // 已存 fact_id 命中跳过数（D-134② 披露：emitted/skipped 分列——吞错命中可观测）
  repo_ref: string;
  repo_name: string;
  head_sha: string;
}

function gitOut(root: string, args: readonly string[]): string {
  return execFileSync('git', ['-C', root].concat(args as string[]), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).trim();
}

// 默认补采发射管线=批量同款：codelore 行为三面（per-file 事实在发射边界内落 Micro-B grain——ctx 变换为 collectCodeloreFacets 内部职责）＋rename 血缘。
function defaultCodeloreCollect(ctx: CollectContext, repoRoot: string): CollectedFact[] {
  return collectCodeloreFacets({ repoRoot: repoRoot, facets: CODELORE_BEHAVIOR_FACETS }, ctx);
}
function defaultLineageCollect(ctx: CollectContext, repoRoot: string): CollectedFact[] {
  const rawLog = gitOut(repoRoot, gitRenameLogArgs(RENAME_DEFAULT_THRESHOLD));
  return collectFileLineage({
    edges: parseRenameLogZ(rawLog),
    headSha: headShaOfRepoRef(ctx.repoRef) as string,
    threshold: RENAME_DEFAULT_THRESHOLD,
    detectorVersion: RENAME_DETECTOR_VERSION,
    gitVersion: probeGitVersion()
  }, { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: 'Micro-B', observedAt: ctx.observedAt });
}

export async function runAuditFile(opts: AuditFileOptions): Promise<AuditFileResult> {
  const intake: RepoAddResult = repoAdd(opts.input, { cwd: opts.cwd || process.cwd() });
  const repoRoot = intake.resolved_root;
  const name = auditRepoName(opts.input, repoRoot);

  // 资格检查=SHA 对象库可达（D-126）：rev-parse HEAD 失败=协议级失败 fail-fast（非字段病态）
  let headSha: string;
  try {
    headSha = gitOut(repoRoot, ['rev-parse', 'HEAD']);
    if (!/^[0-9a-f]{40}$/i.test(headSha)) { throw new Error('unexpected rev-parse output'); }
  } catch (e) {
    throw new AuditFileError('AUDIT-FILE-SHA-UNREACHABLE', '目标 SHA 对象库不可达（git rev-parse HEAD）：' + String((e as Error).message));
  }
  // headDate=观测时点（方言吸收→分类器同构主链：+00:00↔Z 仪器方言落边界吸收不入 quarantine）
  const headRaw = gitOut(repoRoot, ['log', '-1', '--format=%cI']);
  const absorbed = absorbGitIsoDialect(headRaw);
  const cls = classifyGitIsoField(absorbed.value);
  const headDate = cls.value !== null ? cls.value : null;
  const repoRef = name + '@' + headSha;
  const pinned = opts.at !== undefined && opts.at.length > 0;

  // 观测集存在性：pin 时禁补采（at:<sha>=只读历史集，采集缺席照答 miss）；非 pin 且当前 HEAD 集空→lazy 补采
  let backfilled = false;
  let emitted = 0;
  let skipped = 0;
  if (!pinned) {
    // db 不存在=零观测集→跳过预读直接补采（READ_ONLY 开库对不存在的文件会 IO 失败）
    const preCard = existsSync(opts.db)
      ? await projectFileCard(opts.db, { repo: name, subject: opts.path, current_head_sha: headSha })
      : null;
    const setExists = preCard !== null && preCard.observation.head_sha === headSha;
    const subjectHasFacts = preCard !== null && Object.keys(preCard.kernel.facet_rows).length > 0;
    if (!setExists || !subjectHasFacts) {
      const ctx = macroBContext('audit-file-' + name, name, headSha, headDate, headRaw);
      const codeloreFn = (opts.collectors && opts.collectors.codelore) || defaultCodeloreCollect;
      const lineageFn = (opts.collectors && opts.collectors.lineage) || defaultLineageCollect;
      const batch = codeloreFn(ctx, repoRoot).concat(lineageFn(ctx, repoRoot));
      mkdirSync(dirname(opts.db), { recursive: true });   // db 父目录缺席即建（--db 落点由调用方指定）
      const writer = await openWriter(opts.db);
      try {
        // D-115 事务包裹（F3 返修）：中途失败回滚不产残观测集——补采 append 语义=all-or-nothing
        emitted = await runInTransaction(writer, async function () {
          // D-134① 吞错收窄（#83）：写循环前预查库内已存 fact_id——撞键消除在判定层；
          //   skipped=已存命中＋批内重号＋收窄 catch 命中（下段 isFactIdUniqueViolation 臂），与 emitted 分列披露（跳过可观测，对齐 D-122 披露纪律）
          const seen = await existingFactIds(writer, batch.map(function (f) { return f.fact_id; }));
          let n = 0;
          for (const f of batch) {
            if (seen.has(f.fact_id)) { skipped += 1; continue; }
            seen.add(f.fact_id);
            try {
              await appendFact(writer, f);
              n += 1;
            } catch (e) {
              // 精确指认：仅 fact_id UNIQUE 撞键可跳（防御性残留臂——同事务单写者无竞窗）；
              //   其余写错（PK/NOT NULL/CHECK/FK/IO）照常上抛→runInTransaction 回滚（D-115① fail-fast 归位）
              if (!isFactIdUniqueViolation(e)) { throw e; }
              skipped += 1;
            }
          }
          return n;
        });
      } finally {
        closeDuckdb(writer);   // SWMR：写连接先关再开读投影
      }
      backfilled = true;
    }
  }

  const card = existsSync(opts.db)
    ? await projectFileCard(opts.db, {
      repo: name,
      subject: opts.path,
      at: pinned ? opts.at : undefined,
      current_head_sha: headSha,
      source: backfilled ? 'backfill' : 'prefetch'
    })
    : buildFileCard({   // pin 且库缺席=零观测集——never_collected 照答不伪造
      subject: opts.path, setRepoRef: null, setFacts: [], availableHeadShas: [],
      pinnedSha: pinned ? (opts.at as string) : null, currentHeadSha: headSha,
      source: 'unknown', cliGuidance: null
    });
  return { card: card, backfilled: backfilled, emitted: emitted, skipped: skipped, repo_ref: repoRef, repo_name: name, head_sha: headSha };
}

export { isAuditIoError };
