# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Search before you file**: `gh issue list --search "<file:line or symptom string>" --state all`. A hit means add your evidence to that issue instead of opening a second one: one root cause filed twice splits the fix across two agents and can land two conflicting PRs (`#54` / `#64` are the worked example). Search by the same strings you would put in the body — the offending path plus the symptom — not by a paraphrase of the title.
- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## Merging PRs created by GitButler

Merging is an outward action — do it only once the user has explicitly asked for that merge (`AGENTS.md`).

GitButler publishes *native* GitHub stacked pull requests when the repo is enrolled in GitHub's stacked-PR preview and the PR uses same-repo branches; otherwise (preview not enabled, fork-based, or `but config forge github-stacks disable`) it falls back to an *ordinary* PR whose description carries the stack info.

- **Ordinary (fallback) PR** — the regular path works: `gh pr merge "$PR_NUMBER" --squash` (#65 in this repo merged this way).
- **Native stacked PR** — the regular paths all reject it, with different messages: `gh pr merge` fails with a GraphQL error ("This pull request is part of a stack and must be merged using the asynchronous merge REST API"), while `PUT /repos/{owner}/{repo}/pulls/$PR_NUMBER/merge` returns 403 "Merging stacked PRs via this endpoint is not supported". Use the asynchronous merge API below. Once merge is already authorized, either failure is the signal to switch paths; never probe before authorization, since a successful probe *is* a merge.

```bash
PR_NUMBER=123
# Enqueue → 202 carries details.uuid; 200 means it was already merged/enqueued (no uuid — skip the poll)
UUID=$(gh api -X PUT "repos/{owner}/{repo}/pulls/$PR_NUMBER/merge-async" \
  -F merge_method=squash -F merge_action=direct_merge --jq '.details.uuid')
# Poll → pending | merged (with details.sha) | failed
gh api "repos/{owner}/{repo}/pulls/$PR_NUMBER/merge-async/$UUID"
```

- **Note**: closing keywords in the PR body are not processed on this path — close linked issues explicitly after the merge lands.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only, the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
