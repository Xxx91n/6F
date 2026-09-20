# Security Policy

## Supported Versions

macro-audit is in **0.x preview**. Per [docs/versioning.md](docs/versioning.md), version numbers increase monotonically and no patches are backported to older lines: **only the latest release is supported**.

| Version | Supported |
|---|---|
| Latest 0.x | yes |
| Older 0.x | no |

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Preferred channels:

- **GitHub private vulnerability reporting**: <https://github.com/Xxx91n/6F/security/advisories/new>
- **Email**: <xxx91n@duck.com> — include `macro-audit security` in the subject.

Please include: affected version or commit, reproduction steps or proof of concept, and an impact assessment if known.

**Response expectation (honest)**: single maintainer — acknowledgment is targeted within 7 days; no SLA is promised. If a report is accepted, the fix lands on the next release; credit is given unless you prefer otherwise.

## Scope notes

- The audit engine runs **read-only** git subcommands and file reads against audited repositories; it never writes to the audited repository.
- External repositories are only accessed via explicit URL opt-in and are cloned into an isolated cache with remote-config execution disabled (`hooksPath` noop, `protocol.ext.allow=never`, shallow clones rejected).
- The kernel MCP surface is read-only.
- Third-party upstreams (git CLI, CodeLore, DuckDB, GitHub REST) are pinned in `engine/upstream-lock.yaml`; vulnerabilities in the upstreams themselves should be reported upstream.
