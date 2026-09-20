# Contributing to macro-audit (6f)

Honest status first: this project is in **preview** (0.x) and is maintained by a **single author** ([@Xxx91n](https://github.com/Xxx91n)). That shapes what contributing looks like right now.

## What is welcome

- **Bug reports and feedback** — the most useful contribution at this stage. Please use the issue templates; including your host, plugin version, OS, and `selftest` output saves a round trip.
- **Documentation fixes** — typos, stale statements, unclear sections.
- **Audit result reports** — running the audit on a real (git-healthy) repository and sharing the verdict plus receipt is valuable calibration data.

## Pull requests

PRs are welcome, with two honest caveats:

1. **Review latency** — single maintainer; expect days, not hours. Draft PRs for large changes are appreciated so direction can be confirmed early.
2. **Scope discipline** — this repository is a walking-skeleton methodology exercise: capabilities ship behind explicit preview labels, and "not yet implemented" is recorded rather than hidden. PRs that add claims faster than evidence will be asked to narrow.

Before opening a PR, please work through the checklist in the PR template: guard scripts green, decision-ledger updated for decisions, bilingual README sync stamp reviewed if `README.md` changed, and `engine/dist` rebuilt if `engine/src` changed.

## Ground rules (pointers, not duplicated)

- [AGENTS.md](AGENTS.md) — working agreements for humans and agents in this repo.
- [engine/README.md](engine/README.md) — build / test / package commands (`npm test` = gen + build + smoke).
- [docs/versioning.md](docs/versioning.md) — 0.x semantics and upstream lock discipline.
- [docs/adr/](docs/adr/) — architecture decision records; ledger IDs (D-xxx / A-xxx) are the source of truth.
- [CONTEXT.md](CONTEXT.md) — domain glossary.

## License

By contributing you agree that your contributions are licensed under the project's [Apache-2.0 license](LICENSE).
