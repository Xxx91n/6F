// #37 试点面可用性实测探针——三仓只读扫描（git 只读命令：remote -v / log / shortlog / branch -r / rev-list / rev-parse / tag）
// 绝不写被测仓；唯一写动作 = 本文件同目录 37-pilot-measurements.json
// 用法：node 37-probe.mjs → 打印逐仓摘要 + 写 measurements json，exit 0
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const REPOS = {
  'env-manager': 'D:/Aworker/env-manager',
  'anysearch-cli': 'D:/Aworker/anysearch-cli',
  'jiahao': 'D:/Aworker/jiahao',
};

const git = (repo, args) => {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: 60000 });
  if (r.status !== 0) return { ok: false, out: '', err: (r.stderr || '').trim() };
  return { ok: true, out: r.stdout, err: '' };
};

// 非人类署名识别（PR 人/机比边缘形态单列）
const BOT_AUTHOR = /\[bot\]|^github-actions$|-bot$|^codex$|^GitButler$|release-please|renovate|dependabot|Env Manager Bot|env-manager-bot|anysearch-release-bot/i;
const HARD_BOT = /\[bot\]|github-actions|dependabot|renovate/i; // 平台级 bot（GitHub 官方/dependabot）
const isBot = (name, email) => BOT_AUTHOR.test(name) || BOT_AUTHOR.test(email) || /noreply\.github\.com|bot@|@.*\.local$|gitbutler@/.test(email);

const measureRepo = (name, root) => {
  const m = { repo: name, root, errors: [] };

  // ---------- 0. git 健康 ----------
  m.shallow = git(root, ['rev-parse', '--is-shallow-repository']).out.trim();
  m.commit_count = parseInt(git(root, ['rev-list', '--count', 'HEAD']).out.trim(), 10) || 0;
  m.head = git(root, ['rev-parse', 'HEAD']).out.trim();
  m.tags = git(root, ['tag']).out.trim().split('\n').filter(Boolean);

  // ---------- 1. 托管面 ----------
  const remotes = git(root, ['remote', '-v']).out.trim().split('\n').filter(Boolean)
    .map((l) => { const [n, rest] = l.split('\t'); const [url, kind] = rest.split(' '); return { name: n, url, kind }; });
  m.remotes = remotes;
  m.github_remote = remotes.find((r) => /github\.com[:/]/.test(r.url) || /github-[\w]+:/.test(r.url));
  const remoteBranches = git(root, ['branch', '-r']).out.trim().split('\n').map((s) => s.trim()).filter(Boolean);
  m.remote_branches = remoteBranches;
  m.dependabot_remote_branches = remoteBranches.filter((b) => /dependabot\//.test(b));
  m.release_please_remote_branches = remoteBranches.filter((b) => /release-please/.test(b));
  const sync = git(root, ['rev-list', '--left-right', '--count', 'main...origin/main']);
  m.main_origin_sync = sync.ok ? sync.out.trim() : null;
  const wfDir = join(root, '.github', 'workflows');
  m.workflows = fs.existsSync(wfDir) ? fs.readdirSync(wfDir).filter((f) => /\.(yml|yaml)$/.test(f)) : [];
  m.hosting_files = {};
  for (const f of ['.github/PULL_REQUEST_TEMPLATE.md', '.github/dependabot.yml', '.github/CODEOWNERS', '.github/FUNDING.yml', '.github/CONTRIBUTING.md', '.github/CODE_OF_CONDUCT.md', 'CODEOWNERS', 'CONTRIBUTING.md']) {
    m.hosting_files[f] = fs.existsSync(join(root, f));
  }
  m.hosting_files['.github/ISSUE_TEMPLATE'] = fs.existsSync(join(root, '.github', 'ISSUE_TEMPLATE'));
  m.ci_pull_request_trigger = m.workflows.some((w) => {
    try { return /pull_request/.test(fs.readFileSync(join(wfDir, w), 'utf8')); } catch { return false; }
  });

  // ---------- 2. PR 人/机比 ----------
  // 2a. GitHub web 中介证据 = committer == GitHub <noreply@github.com>
  const ghLog = git(root, ['log', '--all', '--format=%H|%an|%ae|%cn|%ad|%s', '--date=short', '--committer=noreply@github.com']);
  const ghCommits = ghLog.out.trim().split('\n').filter(Boolean).map((l) => {
    const [sha, an, ae, cn, ad, ...s] = l.split('|');
    return { sha: sha.slice(0, 8), author: an, author_email: ae, committer: cn, date: ad, subject: s.join('|') };
  });
  // 2b. merge-commit 型 PR：'Merge pull request #N'
  const mergePRs = ghCommits.filter((c) => /Merge pull request #(\d+)/.test(c.subject))
    .map((c) => ({ ...c, pr: c.subject.match(/Merge pull request #(\d+)/)[1], form: 'merge-commit' }));
  // 2c. squash 型 PR：subject 末尾 '(#N)'
  const squashPRs = ghCommits.filter((c) => /\(#(\d+)\)\s*$/.test(c.subject))
    .map((c) => ({ ...c, pr: c.subject.match(/\(#(\d+)\)\s*$/)[1], form: 'squash' }));
  // 2d. 其余 GitHub web 提交（非 PR 形态：dependabot 分支直推 / 手工 web merge 等）
  const prSet = new Set([...mergePRs, ...squashPRs].map((c) => c.sha));
  const otherGh = ghCommits.filter((c) => !prSet.has(c.sha));
  // 2e. PR 归类：bot 作者 PR / release-please 机器生成 PR / 人作者 PR
  // 机器生成判据收窄：release-please 产物 = `chore(main): release X.Y.Z` 标题 或 release-please--branches 分支；
  // 「subject 提到 release-please 字样」≠ 机器生成（那是人类在做 release-please 相关治理，如 #46/#47/#51/#32）
  const classifyPR = (c) => {
    if (HARD_BOT.test(c.author)) return 'bot-authored';
    if (/^chore\(main\): release\s/.test(c.subject) || /release-please--branches/.test(c.subject)) return 'machine-generated (release-please)';
    return 'human-authored';
  };
  m.pr_evidence = {
    merge_commit_prs: mergePRs.map((c) => ({ pr: c.pr, sha: c.sha, author: c.author, date: c.date, subject: c.subject.slice(0, 90), klass: classifyPR(c) })),
    squash_prs: squashPRs.map((c) => ({ pr: c.pr, sha: c.sha, author: c.author, date: c.date, subject: c.subject.slice(0, 90), klass: classifyPR(c) })),
    other_github_web_commits: otherGh.map((c) => ({ sha: c.sha, author: c.author, date: c.date, subject: c.subject.slice(0, 90) })),
  };
  const allPRs = [...mergePRs, ...squashPRs];
  m.pr_ratio = {
    github_pr_total: allPRs.length,
    human_authored: allPRs.filter((c) => classifyPR(c) === 'human-authored').length,
    bot_authored: allPRs.filter((c) => classifyPR(c) === 'bot-authored').length,
    machine_generated: allPRs.filter((c) => classifyPR(c) === 'machine-generated (release-please)').length,
    open_bot_pr_branches: m.dependabot_remote_branches.length + m.release_please_remote_branches.length,
    note: 'github_pr_total = merge-commit PR + squash(#N) PR（committer=GitHub 才计入）；bot/machine-generated 为非人类 PR 边缘形态单列',
  };
  // 2f. 全量作者/提交者构成（人/机分母）
  const authors = git(root, ['shortlog', '-sne', 'HEAD']).out.trim().split('\n').filter(Boolean)
    .map((l) => { const mm = l.trim().match(/^(\d+)\s+(.+?)\s*<(.+?)>$/); return mm ? { commits: +mm[1], name: mm[2], email: mm[3], bot: isBot(mm[2], mm[3]) } : null; }).filter(Boolean);
  m.authors = authors;
  m.author_split = {
    human_identities: authors.filter((a) => !a.bot).map((a) => `${a.name}(${a.commits})`),
    machine_identities: authors.filter((a) => a.bot).map((a) => `${a.name}(${a.commits})`),
    human_commits: authors.filter((a) => !a.bot).reduce((s, a) => s + a.commits, 0),
    machine_commits: authors.filter((a) => a.bot).reduce((s, a) => s + a.commits, 0),
  };
  // 2g. 本地（非 GitHub 中介）merge 提交 = bot 本地合流
  const localMerges = git(root, ['log', '--merges', '--format=%h|%an|%s', 'HEAD']).out.trim().split('\n').filter(Boolean)
    .filter((l) => !/Merge pull request/.test(l));
  m.local_merge_commits = localMerges.length;

  // ---------- 3. ADR supersede 链完整度 ----------
  const adrDirCandidates = ['docs/adr', 'docs/ADR', 'adr', 'ADR', 'docs/decisions'];
  let adrDir = null;
  for (const c of adrDirCandidates) { const p = join(root, c); if (fs.existsSync(p) && fs.readdirSync(p).some((f) => /^\d{3,}.*\.md$/i.test(f))) { adrDir = p; m.adr_dir = c; break; } }
  const adrs = [];
  if (adrDir) {
    const files = fs.readdirSync(adrDir).filter((f) => /^\d{3,}.*\.md$/i.test(f)).sort();
    for (const f of files) {
      const num = f.match(/^(\d+)/)[1];
      const text = fs.readFileSync(join(adrDir, f), 'utf8');
      const statusLine = (text.match(/^\s*[-*]?\s*status\s*[:：][^\n]*/im) || [''])[0].trim();
      const wholeSupersededBy = (statusLine.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || [])[1] || null;
      // 行级结构化引用：Amends: / References: 行 + 内文 supersede 引用
      const refLines = [];
      text.split('\n').forEach((line, i) => {
        if (/^\s*(Amends|References)\s*[:：]/i.test(line)) refLines.push({ line: i + 1, text: line.trim().slice(0, 200) });
      });
      const inlineSupersedeRefs = [];
      const lines = text.split('\n');
      let supersedeCtxLines = 0; // 段落级前瞻：superseded-by 命中后同段落内再捕「again by ADR-NNNN」（jiahao ADR-0039 锚点形态）
      lines.forEach((line, i) => {
        if (/^\s*$/.test(line)) supersedeCtxLines = 0; // 空行切段
        const sm = line.match(/superseded\s+by\s+ADR-?(\d{3,})/i) || line.match(/supersedes?\s+ADR-?(\d{3,})/i);
        if (sm && !/^\s*[-*]?\s*status\s*[:：]/i.test(line)) {
          const negated = /(does not|do not|not a|no longer|never)\s+supersede/i.test(line);
          inlineSupersedeRefs.push({ line: i + 1, to: sm[1], negated, text: line.trim().slice(0, 160) });
          supersedeCtxLines = 5;
        } else if (supersedeCtxLines > 0) {
          for (const am of line.matchAll(/again\s+by\s+\**ADR-?(\d{3,})/gi)) {
            inlineSupersedeRefs.push({ line: i + 1, to: am[1], negated: false, text: '(again-by) ' + line.trim().slice(0, 140) });
          }
        }
        supersedeCtxLines--;
      });
      const amendsRefs = [], refRefs = [], deferRefs = [];
      for (const rl of refLines) {
        for (const mm of rl.text.matchAll(/ADR-?(\d{3,})/gi)) (/^Amends/i.test(rl.text) ? amendsRefs : refRefs).push({ line: rl.line, to: mm[1] });
        for (const mm of rl.text.matchAll(/defer-(\d{3,})/gi)) deferRefs.push({ line: rl.line, to: 'defer-' + mm[1] });
      }
      adrs.push({ file: 'docs/adr/' + f, num, status: statusLine.slice(0, 120), whole_superseded_by: wholeSupersededBy, inline_supersede_refs: inlineSupersedeRefs, amends_refs: amendsRefs, references_refs: refRefs, defer_refs: deferRefs, mentions_adr: [...new Set([...text.matchAll(/ADR-?(\d{3,})/gi)].map((x) => x[1]))] });
    }
  }
  m.adr = { dir: m.adr_dir || null, count: adrs.length, files: adrs.map((a) => a.file) };
  const numSet = new Set(adrs.map((a) => a.num));
  const deferRegistry = fs.existsSync(join(root, 'docs', 'deferred-registry.json'));
  m.deferred_registry_present = deferRegistry;
  // 边清单 + 解析（negated 行记为 explicit-non-supersede 证据，自指引文记为 self-quote-artifact，均不进断链统计）
  const edges = [];
  for (const a of adrs) {
    if (a.whole_superseded_by) edges.push({ from: a.num, to: a.whole_superseded_by, kind: 'whole-adr-status', evidence: a.file + ' status-line' });
    for (const r of a.inline_supersede_refs) edges.push({ from: a.num, to: r.to, kind: r.negated ? 'explicit-non-supersede' : 'item-level-inline', evidence: `${a.file}:${r.line}` });
    for (const r of a.amends_refs) edges.push({ from: a.num, to: r.to, kind: 'amends', evidence: `${a.file}:${r.line}` });
    for (const r of a.references_refs) edges.push({ from: a.num, to: r.to, kind: 'references', evidence: `${a.file}:${r.line}` });
    for (const r of a.defer_refs) edges.push({ from: a.num, to: r.to, kind: 'defer-ref', evidence: `${a.file}:${r.line}` });
  }
  const SUPERSEDE_KINDS = new Set(['whole-adr-status', 'item-level-inline']);
  for (const e of edges) {
    if (e.from === e.to) { e.kind = 'self-quote-artifact'; }
    if (e.kind === 'defer-ref') e.resolved = deferRegistry;
    else e.resolved = numSet.has(e.to);
    // 回链断言仅对 supersede 族边有约定意义（Amends/References 前向引用按惯例本就单向，不求回链）
    if (e.kind !== 'defer-ref' && e.resolved) {
      const target = adrs.find((a) => a.num === e.to);
      e.back_reference = target ? target.mentions_adr.includes(e.from) : false;
    } else e.back_reference = null;
  }
  m.supersede_chain = {
    edges,
    edge_count: edges.length,
    whole_adr_supersessions: edges.filter((e) => e.kind === 'whole-adr-status').length,
    item_level_supersessions: edges.filter((e) => e.kind === 'item-level-inline').length,
    amends_edges: edges.filter((e) => e.kind === 'amends').length,
    references_edges: edges.filter((e) => e.kind === 'references').length,
    defer_ref_edges: edges.filter((e) => e.kind === 'defer-ref').length,
    explicit_non_supersedes: edges.filter((e) => e.kind === 'explicit-non-supersede').length,
    self_quote_artifacts: edges.filter((e) => e.kind === 'self-quote-artifact').length,
    unresolved_refs: edges.filter((e) => !e.resolved && e.kind !== 'self-quote-artifact').map((e) => `${e.from}->${e.to} (${e.kind}, ${e.evidence})`),
    missing_backrefs: edges.filter((e) => SUPERSEDE_KINDS.has(e.kind) && e.resolved && e.back_reference === false).map((e) => `${e.from}->${e.to} (${e.kind}, ${e.evidence})`),
    statuses_superseded: adrs.filter((a) => /superseded/i.test(a.status)).map((a) => a.num),
  };
  return m;
};

const out = { generated_at: new Date().toISOString(), probe: '37-probe.mjs', readonly_git_cmds: ['remote -v', 'log', 'shortlog', 'branch -r', 'rev-list', 'rev-parse', 'tag'], repos: {} };
for (const [name, root] of Object.entries(REPOS)) {
  if (!fs.existsSync(root)) { out.repos[name] = { repo: name, root, errors: ['repo-missing'] }; continue; }
  out.repos[name] = measureRepo(name, root);
  const r = out.repos[name];
  console.log(`== ${name}: commits=${r.commit_count} pr=${r.pr_ratio.github_pr_total}(h${r.pr_ratio.human_authored}/b${r.pr_ratio.bot_authored}/g${r.pr_ratio.machine_generated}) adr=${r.adr.count} edges=${r.supersede_chain.edge_count} unresolved=${r.supersede_chain.unresolved_refs.length} missBackref=${r.supersede_chain.missing_backrefs.length} gh=${!!r.github_remote} wf=${r.workflows.length}`);
}
fs.writeFileSync(join(here, '37-pilot-measurements.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('WROTE ' + join(here, '37-pilot-measurements.json'));
process.exit(0);
