// #36 探针——explain 族 LLM 面实物枚举（env 门控关态）
// 安全纪律：spawn 前从 env 中删除全部 CODELORE_LLM_* 与 ANTHROPIC_API_KEY——
// 未配置端点时 --llm 在上游侧必然走 exit≠0 的显式错误路径，物理上不可能真调 LLM。
// 本探针有写副作用（写 reports/36-*.txt 存档）；不录 cassette（无真 LLM 输出可录）。
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..', '..');
const BIN = 'codelore';

// 门控关态 env：剔除 LLM 族变量后透传其余环境（PATH/HOME 等必须保留）
const env = { ...process.env };
for (const k of Object.keys(env)) {
  if (k.startsWith('CODELORE_LLM_') || k === 'ANTHROPIC_API_KEY') delete env[k];
}

const run = (args) => {
  const r = spawnSync(BIN, args, { cwd: ROOT, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error ? String(r.error) : null };
};

const w = (name, text) => fs.writeFileSync(join(here, name), text, 'utf8');

const out = { binary: BIN, env_scrubbed: true, probed_at: new Date().toISOString() };

// 1) --version（pin 复核）
const ver = run(['--version']);
out.version = ver.stdout.trim();
w('36-version.txt', ver.stdout);

// 2) 顶层命令面存档（explain/diff/mcp 子命令存在性证据）
const top = run(['--help']);
w('36-top-help.txt', top.stdout);
out.top_commands = (top.stdout.match(/^  [a-z][a-z-]+/gm) || []).map((s) => s.trim());

// 3) explain --help（LLM 旗标与 env 族提示的实物枚举）
const eh = run(['explain', '--help']);
w('36-explain-help.txt', eh.stdout);
out.explain_help_bytes = Buffer.byteLength(eh.stdout);
out.explain_help_has_llm_flag = eh.stdout.includes('--llm');
out.explain_help_mentions_env_family = eh.stdout.includes('CODELORE_LLM_*');

// 4) 裸 explain → supported topics 枚举（主题面非 LLM 面，--llm 对 topic 无效——如实登记）
const topics = run(['explain']);
w('36-explain-topics.txt', topics.stdout);
out.explain_topics = (topics.stdout.match(/^  [a-z][a-z0-9-]+$/gim) || []).map((s) => s.trim()).filter((s) => s !== 'usage');

// 5) diff --help（同族 --llm PR 叙事面）
const dh = run(['diff', '--help']);
w('36-diff-help.txt', dh.stdout);
out.diff_help_has_llm_flag = dh.stdout.includes('--llm');

// 6) 门控关态 --llm 实测（决定性证据：未配置 → exit≠0 + stderr 显式错误 + stdout 仍出确定性 dossier）
const sample = 'engine/src/cli.ts';
const g = run(['explain', sample, '--llm', '--repo', '.']);
w('36-explain-llm-unconfigured.stdout.txt', g.stdout);
w('36-explain-llm-unconfigured.stderr.txt', g.stderr);
out.unconfigured_llm = {
  argv: ['explain', sample, '--llm', '--repo', '.'],
  exit: g.status,
  stdout_bytes: Buffer.byteLength(g.stdout),
  stderr_tail: g.stderr.slice(-400),
  dossier_still_emitted: /\[code-health\]/.test(g.stdout),
  explicit_error: /CODELORE_LLM_MODEL|ANTHROPIC_API_KEY/.test(g.stderr)
};

w('36-probe-measurements.json', JSON.stringify(out, null, 2) + '\n');
console.log('36-probe done:', JSON.stringify({ version: out.version, topics: out.explain_topics.length, exit_llm_unconfigured: out.unconfigured_llm.exit, dossier_emitted: out.unconfigured_llm.dossier_still_emitted, explicit_error: out.unconfigured_llm.explicit_error }));
