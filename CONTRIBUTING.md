# Contributing to macro-audit (6f)

To be upfront: this project is in **preview** (0.x) and one person maintains it ([@Xxx91n](https://github.com/Xxx91n)). That is what shapes contributing right now.

## What is welcome

- **Bug reports and feedback** — the most useful thing you can send at this stage. Please use the issue templates; adding your host, plugin version, OS, and `selftest` output saves us a back-and-forth.
- **Documentation fixes** — typos, stale statements, unclear sections.
- **Audit result reports** — run the audit on a real repository with a healthy git history, then share the verdict and its receipt. This is useful calibration: it helps us check whether our judgments hold up.

## How to run and verify

All the flags are in [engine/README.md](engine/README.md). The short version, run from `engine/`:

- `npm test` — generates the manifests, builds, and runs a quick smoke check.
- `npm run check:docs` — checks the acknowledgments block and that every ADR number, decision number, and anchor still resolves.

## What not to change

- **`engine/dist/` is generated, not hand-written.** Change `engine/src` and rebuild with `npm run build`; never edit the output by hand.
- **Machine names stay as they are.** CLI commands and flags, error codes, JSON keys, database columns, environment variables, and file paths are read by scripts and other tools; renaming them breaks people who rely on them.
- **Each decision and each term has exactly one home.** [docs/authority.md](docs/authority.md) says which file that is; this page only points there and does not repeat it.

## Pull requests

PRs are welcome. Two things to know up front:

1. **Waiting time** — there is one maintainer, so expect days, not hours. For big changes, open a draft PR so we can agree on direction early.
2. **Keep the scope honest** — this repo is where the audit method itself gets built: each capability ships one step at a time, behind a label that says it is preview, and anything not built yet is written down rather than hidden. A PR that claims more than it can show will be asked to trim its claims.

Before you open a PR, go through the checklist in the PR template: scripts green, decisions recorded in the place [`docs/authority.md`](docs/authority.md) says they go, and `engine/dist` rebuilt if `engine/src` changed.

## Where things live (links, not copies)

- [AGENTS.md](AGENTS.md) — how humans and agents work together in this repo.
- [docs/authority.md](docs/authority.md) — which file a decision or a term lives in.
- [docs/versioning.md](docs/versioning.md) — 0.x version rules, how upstream versions are locked, and how often they get reviewed.
- [docs/spec.md](docs/spec.md) — product decisions.
- [GLOSSARY.md](GLOSSARY.md) — what the domain words mean.

## Reading map — where to start, what to skip

This repo keeps a lot of its own history on purpose: the product audits engineering content, and its own history is the sample the method is tried on. You do not have to read it in order.

Start with these:

1. [README.md](README.md) — what the product does, the five audit scales, and what is usable today.
2. [GLOSSARY.md](GLOSSARY.md) — what the domain words mean; every term used elsewhere is defined here.

Skip these unless you are working on them:

- `engine/dist/` — build output that is committed; do not read its diffs line by line. The rebuild-diff CI guard rebuilds it and compares, so correctness does not depend on a human reading the diff.
- Closed decisions and past audit rounds — they explain how the project got here, not what it is now.

## License

By contributing you agree that your contributions are licensed under the project's [Apache-2.0 license](LICENSE).
