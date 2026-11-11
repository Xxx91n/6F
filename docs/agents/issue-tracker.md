# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Do everything with the `gh` CLI. **[`docs/authority.md`](../authority.md) — the authority surface — is the one place that says where a decision or a term belongs.** This file only explains how to work the GitHub tracker, and the `gh` commands and paths below stay exactly as written.

## Conventions

- **Search before you file**: `gh issue list --search "<file:line or symptom string>" --state all`. If an issue already exists, add your evidence there; do not open a second one. If the same cause gets filed twice, the fix gets split between two agents and you can end up with two PRs that fight over it (`#54` / `#64` are the worked example). Search with the strings you would put in the body — the file and line plus the symptom — not a rewording of the title.
- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with the `--label` and `--state` filters you need.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or add it afterwards with `gh issue edit <parent> --add-sub-issue <child>` (`gh` 2.94+). On older `gh`, use `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (that number is the child's database id, as in **Blocking** below). If sub-issues are not available, put `Part of #<parent>` at the top of the child body.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Work out the repo from `git remote -v`; `gh` does this for you when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs go through the same labels and states as issues, using the `gh pr` versions of each command:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

Issues and PRs share one number space on GitHub, so a bare `#42` can be either. Check `gh pr view 42` first, then `gh issue view 42`.

## Merging PRs created by GitButler

Merging is an outward action — do it only once the user has explicitly asked for that merge (`AGENTS.md`).

GitButler publishes *native* GitHub stacked pull requests when the repo is enrolled in GitHub's stacked-PR preview, the PR uses branches in the same repo, and stacks have not been switched off. In every other case — preview not enabled, a PR from a fork, or `but config forge github-stacks disable` — it publishes an *ordinary* PR, and the PR description carries the stack details.

- **Ordinary (non-stacked) PR** — the usual path works: `gh pr merge "$PR_NUMBER" --squash` (#65 in this repo merged this way).
- **Native stacked PR** — the usual commands all refuse it, each with a different message: `gh pr merge` fails with a GraphQL error ("This pull request is part of a stack and must be merged using the asynchronous merge REST API"), while `PUT /repos/{owner}/{repo}/pulls/$PR_NUMBER/merge` returns 403 "Merging stacked PRs via this endpoint is not supported". Use the asynchronous merge API below. Once the merge is already authorized, either failure is the signal to take the other path; never test the endpoint before you have authorization, because a successful test *is* a merge.

```bash
PR_NUMBER=123
# Enqueue → 202 carries details.uuid; 200 means it was already merged/enqueued (no uuid — skip the poll)
UUID=$(gh api -X PUT "repos/{owner}/{repo}/pulls/$PR_NUMBER/merge-async" \
  -F merge_method=squash -F merge_action=direct_merge --jq '.details.uuid // empty')
# Poll only when enqueue actually returned a uuid (200 = already merged/enqueued, no uuid)
if [ -n "$UUID" ]; then
  gh api "repos/{owner}/{repo}/pulls/$PR_NUMBER/merge-async/$UUID"   # pending | merged (details.sha) | failed
fi
```

- **Note**: closing keywords in the PR body are not processed on this path — close linked issues explicitly after the merge finishes.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is one issue; its **child** issues are its tickets.

- **Map**: one issue labelled `wayfinder:map`; its body holds the Notes, Decisions so far, and Fog sections. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). If sub-issues are not available, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once someone claims the ticket, assign it to them.
- **Blocking**: GitHub's **native issue dependencies**; they show in GitHub's UI, so people can see what is blocked. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only), which is the current block. If dependencies are not available, use a `Blocked by: #<n>, #<n>` line at the top of the child body instead. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee. Take the first one left in map order.
- **Claim**: `gh issue edit <n> --add-assignee @me`; do this first in the session, before any other write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then add a context pointer (a short summary plus a link) under the map's Decisions so far.
