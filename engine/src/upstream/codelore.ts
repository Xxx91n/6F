// ---------- 上游适配器：CodeLore（ADR-0014 / D-020 双轨制主线） ----------
// 反腐层纪律：本文件只做「进程调用 + 原始输出解析」——退出码、字节解析、pin 校验在此；
// 业务规则（判据/阈值/裁决）禁止进入本层；上游 raw 语义不出本层（以结构化 fact 传出）。
// 运行时解析策略 = 二进制发现（binary discovery）：codelore 经 PATH 解析 + --version 校验 pin。

import { spawnSync } from 'node:child_process';
import type { CollectContext, CollectedFact, CollectorDescriptor } from '../collect/collectors.js';
import { makeFact } from '../collect/collectors.js';

export const CODELORE_ADAPTER_ID = 'codelore-adapter@v1';
export const CODELORE_FAMILY = 'upstream-codelore';
export const CODELORE_PINNED_VERSION = '0.28.0';

export const CODELORE_DESCRIPTOR: CollectorDescriptor = {
  id: CODELORE_ADAPTER_ID,
  family: CODELORE_FAMILY,
  dimension: null,
  quadrant: 'strategic'
};

export interface CodeloreResolution {
  strategy: 'binary-discovery';
  binary: string;
  version: string | null;
  pinned: boolean;
  error: string | null;
}

export function resolveCodelore(binary: string): CodeloreResolution {
  const bin = binary || 'codelore';
  const r = spawnSync(bin, ['--version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    return { strategy: 'binary-discovery', binary: bin, version: null, pinned: false, error: String(r.error || ('exit ' + r.status)) };
  }
  const m = (r.stdout || '').match(/codelore\s+(\d+\.\d+\.\d+)/i);
  const version = m ? m[1] : null;
  return { strategy: 'binary-discovery', binary: bin, version: version, pinned: version === CODELORE_PINNED_VERSION, error: version ? null : 'version-parse-failed' };
}

export interface ExplainDossier {
  sections: Record<string, Record<string, string>>;
}

// `codelore explain <file>` 的确定性输出 = INI 式 [section] + key = value 行。
export function parseExplainDossier(text: string): ExplainDossier {
  const sections: Record<string, Record<string, string>> = {};
  let cur: string | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const sec = line.match(/^\[(.+)\]$/);
    if (sec) { cur = sec[1]; sections[cur] = sections[cur] || {}; continue; }
    const kv = line.match(/^([A-Za-z0-9_][A-Za-z0-9_.]*)\s*=\s*(.*)$/);
    if (kv && cur) { sections[cur][kv[1]] = kv[2].trim(); }
  }
  return { sections };
}

export interface SummaryMetric { metric: string; value: number }

export function parseSummaryJson(text: string): SummaryMetric[] {
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) { throw new Error('summary output is not an array'); }
  for (const m of arr) {
    if (typeof m.metric !== 'string' || typeof m.value !== 'number') {
      throw new Error('summary row shape drift: expected {metric:string,value:number}');
    }
  }
  return arr;
}

function runText(binary: string, args: readonly string[], cwd: string): { ok: boolean; stdout: string; stderr: string; status: number | null } {
  const r = spawnSync(binary, args as string[], { cwd: cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: !r.error && r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '', status: r.status };
}

export interface CodeloreProbeInput {
  repoRoot: string;
  explainPaths: readonly string[];
  binary?: string;
}

export function collectCodeloreFacts(input: CodeloreProbeInput, ctx: CollectContext): CollectedFact[] {
  const out: CollectedFact[] = [];
  const bin = input.binary || 'codelore';
  const res = resolveCodelore(bin);
  out.push(makeFact(ctx, CODELORE_DESCRIPTOR, 'codelore', 'codelore', 'upstream.resolution', {
    strategy: res.strategy,
    binary: res.binary,
    version: res.version,
    pinned_version: CODELORE_PINNED_VERSION,
    pinned: res.pinned,
    error: res.error
  }));
  if (res.error || !res.pinned) { return out; }

  const sum = runText(bin, ['analyze', '--analysis', 'summary', '--format', 'json', '--repo', input.repoRoot], input.repoRoot);
  if (sum.ok) {
    for (const m of parseSummaryJson(sum.stdout)) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary --format json', 'codelore.summary_metric', {
        metric: m.metric,
        value: m.value
      }));
    }
  } else {
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, input.repoRoot, 'codelore analyze summary', 'codelore.summary_error', {
      status: sum.status,
      stderr_tail: sum.stderr.slice(-400)
    }));
  }

  for (const p of input.explainPaths) {
    const ex = runText(bin, ['explain', p, '--repo', input.repoRoot], input.repoRoot);
    if (!ex.ok) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, p, 'codelore explain', 'codelore.explain_error', {
        status: ex.status,
        stderr_tail: ex.stderr.slice(-400)
      }));
      continue;
    }
    const d = parseExplainDossier(ex.stdout);
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, p, 'codelore explain ' + p, 'codelore.file_dossier', {
      path: p,
      sections: Object.keys(d.sections),
      dossier: d.sections
    }));
  }
  return out;
}
