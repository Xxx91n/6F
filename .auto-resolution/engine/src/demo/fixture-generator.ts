// demo/fixture-generator.ts — 确定性合成 git 仓生成器（D-038① FerrLabs 模式 / A-050 / #45）
// 单模块约束：只依赖 node: 内建（fs/child_process/path），守卫脚本可直接 import 编译产物。
// 确定性纪律：author/committer/date 全部 pin 自 definition.steps —— 同 definition 重复生成
//   逐字节同 SHA（commit object = tree + parents + author + committer + message 全冻结），
//   golden 可 diff；输出含 merge/多分支/tag 全要素。
// 合成诚实纪律：本模块只生成 synthetic fixture 仓（author 恒为 Fixture Bot、
//   email 域 .invalid 保留域），产物绝不冒充真实仓——披露义务在 demo.ts 披露块落实。

import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';

export const FIXTURE_GENERATOR_VERSION = '1.0.0';
export const FIXTURE_GENERATOR_ID = 'fixture-generator@' + FIXTURE_GENERATOR_VERSION;
export const FIXTURE_AUTHOR_NAME = 'Fixture Bot';
export const FIXTURE_AUTHOR_EMAIL = 'fixture@macro-audit.invalid';

export interface FixtureFile { path: string; content: string }

export interface FixtureStepCommit {
  type: 'commit';
  branch?: string;          // 指定则先 checkout（须已由 branch step 建好）
  date: string;             // ISO——同时 pin author_date + committer_date
  message: string;
  files: readonly FixtureFile[];
}
export interface FixtureStepBranch { type: 'branch'; name: string; from?: string } // from 默认 HEAD
export interface FixtureStepMerge { type: 'merge'; branch: string; into: string; date: string; message: string }
export interface FixtureStepTag { type: 'tag'; name: string; at?: string }         // lightweight tag（无对象，天然确定）
export type FixtureStep = FixtureStepCommit | FixtureStepBranch | FixtureStepMerge | FixtureStepTag;

export interface FixtureDefinition {
  scenario: string;
  kind: 'fixture-definition';
  schema_version: string;
  synthetic: true;
  description: string;
  generator: string;
  repo: { name: string; default_branch: string; steps: readonly FixtureStep[] };
  failure: null | { trigger: string; reason: string };
  expect: { overall_verdict: string; degraded_mode: boolean; degraded_reason_marker?: string };
}

export interface GeneratedRepo {
  dir: string;
  name: string;
  head_sha: string;
  tree_sha: string;
  commit_count: number;
  branches: string[];
  tags: string[];
  merge_commits: number;
}

function gitEnv(date: string | null): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_AUTHOR_NAME: FIXTURE_AUTHOR_NAME, GIT_AUTHOR_EMAIL: FIXTURE_AUTHOR_EMAIL, GIT_COMMITTER_NAME: FIXTURE_AUTHOR_NAME, GIT_COMMITTER_EMAIL: FIXTURE_AUTHOR_EMAIL };
  // 宿主隔离：fixture 逐字节 SHA 契约要求与宿主 git config 完全脱钩——
  // 禁 system/global 配置（autocrlf/user/hooks 等漂移源），与 intake.ts clone 纪律同型
  env['GIT_CONFIG_NOSYSTEM'] = '1';
  env['GIT_CONFIG_GLOBAL'] = '';
  env['GIT_CONFIG_SYSTEM'] = '';
  if (date) { env['GIT_AUTHOR_DATE'] = date; env['GIT_COMMITTER_DATE'] = date; }
  return env;
}

function git(args: readonly string[], cwd: string, date: string | null): string {
  // 每个 git 子进程统一挂 -c core.hooksPath=<noop>：fixture 仓为新建临时仓，指向 .git 下不存在的
  // 空目录即可——宿主/全局 hook 一律不触达（参 intake.ts noop-hooks 同型纪律）
  const noopHooks = join(cwd, '.git', 'noop-hooks');
  const r = spawnSync('git', ['-c', 'core.hooksPath=' + noopHooks].concat(args as string[]), { cwd: cwd, encoding: 'utf8', env: gitEnv(date), windowsHide: true });
  if (r.error || r.status !== 0) {
    throw new Error('FIXTURE-GIT-FAILED: git ' + args.join(' ') + ' :: ' + (r.error ? String(r.error) : (r.stderr || 'exit ' + r.status)));
  }
  return (r.stdout || '').trim();
}

export function generateFixtureRepo(def: FixtureDefinition, targetDir: string): GeneratedRepo {
  if (!def || def.kind !== 'fixture-definition' || def.synthetic !== true) {
    throw new Error('FIXTURE-DEF-INVALID: kind/synthetic 契约缺失（synthetic 标记为硬契约，D-038）');
  }
  if (def.generator !== FIXTURE_GENERATOR_ID) {
    throw new Error('FIXTURE-DEF-INVALID: generator 字段须为 ' + FIXTURE_GENERATOR_ID + '（got ' + String(def.generator) + '）');
  }
  mkdirSync(targetDir, { recursive: true });
  git(['init', '-q', '-b', def.repo.default_branch], targetDir, null);

  let mergeCommits = 0;
  const seenBranches = new Set<string>([def.repo.default_branch]);
  const tags: string[] = [];
  for (const step of def.repo.steps) {
    if (step.type === 'commit') {
      if (step.branch) {
        if (!seenBranches.has(step.branch)) { throw new Error('FIXTURE-STEP-INVALID: commit 引未建分支 ' + step.branch); }
        git(['checkout', '-q', step.branch], targetDir, null);
      }
      for (const f of step.files) {
        const p = join(targetDir, f.path);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, f.content, 'utf8');   // LF 逐字写入——blob 内容确定
      }
      git(['add', '-A'], targetDir, null);
      git(['commit', '-q', '--no-gpg-sign', '-m', step.message], targetDir, step.date);
    } else if (step.type === 'branch') {
      git(['branch', step.name, step.from ? step.from : 'HEAD'], targetDir, null);
      seenBranches.add(step.name);
    } else if (step.type === 'merge') {
      if (!seenBranches.has(step.branch)) { throw new Error('FIXTURE-STEP-INVALID: merge 引未建分支 ' + step.branch); }
      git(['checkout', '-q', step.into], targetDir, null);
      git(['merge', '-q', '--no-ff', '--no-edit', '-m', step.message, step.branch], targetDir, step.date);
      mergeCommits++;
    } else if (step.type === 'tag') {
      git(['tag', step.name, step.at ? step.at : 'HEAD'], targetDir, null);
      tags.push(step.name);
    }
  }
  git(['checkout', '-q', def.repo.default_branch], targetDir, null);
  const head = git(['rev-parse', '--verify', 'HEAD'], targetDir, null);
  const tree = git(['rev-parse', 'HEAD^{tree}'], targetDir, null);
  const count = Number(git(['rev-list', '--count', 'HEAD'], targetDir, null));
  const branches = git(['branch', '--format=%(refname:short)'], targetDir, null).split('\n').filter(Boolean);
  return { dir: targetDir, name: def.repo.name, head_sha: head, tree_sha: tree, commit_count: count, branches: branches, tags: tags, merge_commits: mergeCommits };
}
