// demo/fixture-generator.ts —— 造逐字节固定的合成 git 仓（D-038① 照 FerrLabs 那套 / A-050 / #45）
// 单模块：只认 node: 内建（fs/child_process/path），守卫脚本能直接 import 编译产物。
// 确定性怎么保证：author/committer/date 全从 definition.steps 里钉死——同一份 definition 来回生成
// 出来的 SHA 逐字节一样（commit 对象=tree 加 parents 加 author 加 committer 加 message，全冻住），
// golden 就能拿 diff 对；产物里 merge、多分支、tag 这些要素一个不少。
// 合成的诚实规矩：这个模块只造合成 fixture 仓（author 永远叫 Fixture Bot，
// 邮箱挂在 .invalid 保留域上），造出来的东西绝不冒充真仓——该说的在 demo.ts 披露块里说。
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
export const FIXTURE_GENERATOR_VERSION = '1.0.0';
export const FIXTURE_GENERATOR_ID = 'fixture-generator@' + FIXTURE_GENERATOR_VERSION;
export const FIXTURE_AUTHOR_NAME = 'Fixture Bot';
export const FIXTURE_AUTHOR_EMAIL = 'fixture@macro-audit.invalid';
function gitEnv(date) {
    const env = { ...process.env, GIT_AUTHOR_NAME: FIXTURE_AUTHOR_NAME, GIT_AUTHOR_EMAIL: FIXTURE_AUTHOR_EMAIL, GIT_COMMITTER_NAME: FIXTURE_AUTHOR_NAME, GIT_COMMITTER_EMAIL: FIXTURE_AUTHOR_EMAIL };
    // 把宿主的 git 配置隔开：fixture 要逐字节同 SHA，就不能沾宿主 config 的一点边——
    // system/global 那层配置（autocrlf/user/hooks 这些漂移源）一律不读，跟 intake.ts 克隆那套一个路子
    env['GIT_CONFIG_NOSYSTEM'] = '1';
    env['GIT_CONFIG_GLOBAL'] = '';
    env['GIT_CONFIG_SYSTEM'] = '';
    if (date) {
        env['GIT_AUTHOR_DATE'] = date;
        env['GIT_COMMITTER_DATE'] = date;
    }
    return env;
}
function git(args, cwd, date) {
    // 每个 git 子进程都挂上 -c core.hooksPath=<noop>：fixture 是新建的临时仓，指到 .git 下一个不存在的
    // 空目录就行——宿主和全局的 hook 一律够不着（跟 intake.ts 那套 noop-hooks 一个规矩）
    const noopHooks = join(cwd, '.git', 'noop-hooks');
    const r = spawnSync('git', ['-c', 'core.hooksPath=' + noopHooks].concat(args), { cwd: cwd, encoding: 'utf8', env: gitEnv(date), windowsHide: true });
    if (r.error || r.status !== 0) {
        throw new Error('FIXTURE-GIT-FAILED: git ' + args.join(' ') + ' :: ' + (r.error ? String(r.error) : (r.stderr || 'exit ' + r.status)));
    }
    return (r.stdout || '').trim();
}
export function generateFixtureRepo(def, targetDir) {
    if (!def || def.kind !== 'fixture-definition' || def.synthetic !== true) {
        throw new Error('FIXTURE-DEF-INVALID: kind/synthetic 契约缺失（synthetic 标记为硬契约，D-038）');
    }
    if (def.generator !== FIXTURE_GENERATOR_ID) {
        throw new Error('FIXTURE-DEF-INVALID: generator 字段须为 ' + FIXTURE_GENERATOR_ID + '（got ' + String(def.generator) + '）');
    }
    mkdirSync(targetDir, { recursive: true });
    git(['init', '-q', '-b', def.repo.default_branch], targetDir, null);
    let mergeCommits = 0;
    const seenBranches = new Set([def.repo.default_branch]);
    const tags = [];
    for (const step of def.repo.steps) {
        if (step.type === 'commit') {
            if (step.branch) {
                if (!seenBranches.has(step.branch)) {
                    throw new Error('FIXTURE-STEP-INVALID: commit 引未建分支 ' + step.branch);
                }
                git(['checkout', '-q', step.branch], targetDir, null);
            }
            for (const f of step.files) {
                const p = join(targetDir, f.path);
                mkdirSync(dirname(p), { recursive: true });
                writeFileSync(p, f.content, 'utf8'); // 按 LF 逐字写进去——blob 的内容才定得下来
            }
            git(['add', '-A'], targetDir, null);
            git(['commit', '-q', '--no-gpg-sign', '-m', step.message], targetDir, step.date);
        }
        else if (step.type === 'branch') {
            git(['branch', step.name, step.from ? step.from : 'HEAD'], targetDir, null);
            seenBranches.add(step.name);
        }
        else if (step.type === 'merge') {
            if (!seenBranches.has(step.branch)) {
                throw new Error('FIXTURE-STEP-INVALID: merge 引未建分支 ' + step.branch);
            }
            git(['checkout', '-q', step.into], targetDir, null);
            git(['merge', '-q', '--no-ff', '--no-edit', '-m', step.message, step.branch], targetDir, step.date);
            mergeCommits++;
        }
        else if (step.type === 'tag') {
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
