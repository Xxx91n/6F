# Contributing to macro-audit (6f)

First, the honest status: this project is in **preview** (0.x) and is maintained by a **single author** ([@Xxx91n](https://github.com/Xxx91n)). That is what shapes contributing right now.

## What is welcome

- **Bug reports and feedback** — the most useful contribution at this stage. Please use the issue templates; including your host, plugin version, OS, and `selftest` output saves a round trip.
- **Documentation fixes** — typos, stale statements, unclear sections.
- **Audit result reports** — running the audit on a real (git-healthy) repository and sharing the verdict and its receipt is valuable calibration data.

## How to run and verify

The exact command flags live in [engine/README.md](engine/README.md). The short version, run from `engine/`:

- `npm test` — generates manifests, builds, and runs a smoke check.
- `npm run check:docs` — checks the bilingual README pair, the acknowledgment block, and that every ADR number, decision number, and anchor resolves.

## What not to change

- **`engine/dist/` is generated, not hand-written.** Change `engine/src` and rebuild with `npm run build`; never hand-edit the output.
- **Machine names stay as they are.** CLI commands and flags, error codes, JSON keys, database columns, environment variables, and file paths are read by scripts and consumers; renaming them breaks people.
- **Decisions and terms have one home.** [docs/authority.md](docs/authority.md) says which file a decision or a term belongs in; this file only points there and does not restate the mapping.

## Pull requests

PRs are welcome, with two things to know up front:

1. **Review latency** — single maintainer; expect days, not hours. Draft PRs for large changes are appreciated so direction can be confirmed early.
2. **Scope discipline** — this repository is an exercise in building the audit method: capabilities ship one step at a time behind explicit preview labels, and "not yet implemented" is recorded rather than hidden. PRs that promise more than their evidence shows will be asked to narrow their claims.

Before opening a PR, work through the checklist in the PR template: guard scripts green, decisions recorded where [`docs/authority.md`](docs/authority.md) says they belong, bilingual README sync stamp reviewed if `README.md` changed, and `engine/dist` rebuilt if `engine/src` changed.

## Where things live (pointers, not duplicated)

- [AGENTS.md](AGENTS.md) — working agreements for humans and agents in this repo.
- [docs/authority.md](docs/authority.md) — which file a decision or a term belongs in.
- [docs/versioning.md](docs/versioning.md) — 0.x version rules, how upstream versions are locked, and the review cadence.
- [docs/spec.md](docs/spec.md) — product decisions.
- [GLOSSARY.md](GLOSSARY.md) — the domain glossary.

## Reading map — where to start, what to skip

This repository keeps a lot of written history on purpose — the product audits engineering content, and its own history is the method's working sample. You do not need to read it in order.

Read these first:

1. [README.md](README.md) — what the product is, the five audit scales, current capability status.
2. [GLOSSARY.md](GLOSSARY.md) — the domain glossary; terms used elsewhere are defined here.

Skip these unless you are working on them:

- `engine/dist/` — checked-in build output; do not review its diffs line by line — correctness is enforced by the rebuild-diff CI guard, not human diff inspection.
- Closed decisions and past audit rounds — they explain how the project got here, not the current state.

## License

By contributing you agree that your contributions are licensed under the project's [Apache-2.0 license](LICENSE).
