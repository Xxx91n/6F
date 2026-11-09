# Security Policy

Where a decision or a term belongs is written once, in [`docs/authority.md`](docs/authority.md) — the authority surface. This page only explains how to report a security problem.

## Supported versions

macro-audit is in **0.x preview**. Per [docs/versioning.md](docs/versioning.md), version numbers only go up, and older lines do not receive patches: **only the latest release is supported**.

| Version | Supported |
|---|---|
| Latest 0.x | yes |
| Older 0.x | no |

## Reporting a vulnerability

Please **do not** open a public issue for a security vulnerability.

Preferred channels:

- **GitHub private vulnerability reporting**: <https://github.com/Xxx91n/6F/security/advisories/new>
- **Email**: <xxx91n@duck.com> — put `macro-audit security` in the subject.

Include what you can: the affected version or commit, steps to reproduce or a proof of concept, and an impact assessment if you already have one.

**What to expect, honestly**: this project has one maintainer. We aim to acknowledge a report within 7 days, but we cannot promise when a fix will land. If we accept the report, the fix goes into the next release. We credit you unless you ask us not to.

## Scope notes

- The audit kernel runs **read-only** git subcommands and file reads against the repository under audit. It never writes to that repository.
- External repositories are accessed only after explicit URL opt-in and are cloned into an isolated cache with remote-configured execution disabled: `hooksPath` is a noop, `protocol.ext.allow=never`, and shallow clones are rejected.
- The kernel's MCP surface is read-only.
- Third-party upstreams (git CLI, CodeLore, DuckDB, GitHub REST) are pinned in `engine/upstream-lock.yaml`. Report vulnerabilities in those projects to their own maintainers.
