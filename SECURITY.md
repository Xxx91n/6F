# Security Policy

Which file holds a decision or a term is written once, in [`docs/authority.md`](docs/authority.md) — the authority surface. This page only explains how to report a security problem.

## Supported versions

macro-audit is in **0.x preview**. Per [docs/versioning.md](docs/versioning.md), version numbers only go up, and older lines do not get patches: **only the latest release is supported**.

| Version | Supported |
|---|---|
| Latest 0.x | yes |
| Older 0.x | no |

## Reporting a vulnerability

Please **do not** open a public issue for a security vulnerability.

Where to send it:

- **GitHub private vulnerability reporting**: <https://github.com/Xxx91n/6F/security/advisories/new>
- **Email**: <xxx91n@duck.com> — put `macro-audit security` in the subject.

Include what you can: the affected version or commit, steps to reproduce or a proof of concept, and an impact assessment if you already have one.

**What to expect, honestly**: one person maintains this project. We aim to reply within 7 days, but we cannot promise when a fix will land. If we accept the report, the fix goes into the next release. We credit you unless you ask us not to.

## Scope notes

- The audit kernel runs **read-only** git commands and file reads against the repository it is auditing. It never writes to that repository.
- External repositories are only accessed after you explicitly pass a URL, and they are cloned into a separate cache with execution from the clone's remote configuration disabled: `hooksPath` is set to a noop, `protocol.ext.allow=never`, and shallow clones are rejected.
- The kernel's MCP surface is read-only.
- Third-party upstreams (git CLI, CodeLore, DuckDB, GitHub REST) are pinned in `engine/upstream-lock.yaml`. Report vulnerabilities in those projects to their own maintainers.
