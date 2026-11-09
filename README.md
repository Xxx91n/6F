<p align="center">
  <img src="docs/assets/hero.svg" alt="6F :  macro + micro engineering-content audit" width="880"/>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-38bdf8" alt="License: Apache-2.0"/></a>
  <img src="https://img.shields.io/badge/version-0.3.0-f59e0b" alt="Version: 0.3.0"/>
  <img src="https://img.shields.io/badge/node-%E2%89%A522.18-38bdf8" alt="Node: &ge;22.18"/>
  <a href="#install"><img src="https://img.shields.io/badge/marketplace-installable-f59e0b" alt="Marketplace: installable"/></a>
  <a href="https://github.com/Xxx91n/6F/actions/workflows/engine-ci.yml"><img src="https://github.com/Xxx91n/6F/actions/workflows/engine-ci.yml/badge.svg?branch=main" alt="engine-ci: main"/></a>
</p>

<p align="center"><a href="README.md">English</a> &middot; <a href="README.zh-CN.md">&#31616;&#20307;&#20013;&#25991;</a></p>

6F is a **Claude Code Plugin** that audits a code repository.
> It mainly targets repositories with a healthy git history.
- Macro-A cross-repo strategy analysis
- Micro-A PR diff analysis
- Macro-B single-repo four-quadrant analysis
- Micro-B single-file analysis
- Macro-C history evolution analysis

## Install {#install}

**Prerequisites**: Node.js ≥ 22.18

```text
/plugin marketplace add Xxx91n/6F
/plugin install 6f@xxx91n
```

## Mental model {#highlights}

- **Facts** :  every claim lands in the same append-only fact table (Hub-of-Facts: one shared fact table, each scale does its own adjudication).
- **Federation** :  every verdict passes the same `verdict-gate` decision checkpoint; the rules sit on that shared fact table.
- **Forensics** :  the history evolution scale (Macro-C) turns repository history into evidence.
- **Five scales** :  the five audit scales share one fact table; all five are planned, not a cut-down first version.
- **Frankness** :  preview, degraded output, and things marked `synthetic` say what they are, under staged preview releases.
- **Fingerprints** :  every verdict comes with a receipt with two checks, so you can check it offline.

> [!NOTE]
> Current status: Macro-B, Macro-C, Micro-A, and Micro-B are in preview; Macro-A is planned.

## Current status {#capability-matrix}

| scale | status |
|---|---|
| Macro-B single-repo four quadrants | **capability 1 of 5 · preview** (self-audit first report: [examples/first-report/](examples/first-report/)); quadrant statuses: **strategy: active** (S1+S2 collection is connected) · **behavior: preview** (the codelore churn/hotspot/coupling part, #51) · **structure: preview** (shape observations from the S3 family:  `structure/shape` readings in the reading layer, observation only, not used for decisions, D-205) · **supply-chain: queued** (D-034③ Scorecard does not jump the queue) |
| Macro-C history evolution scale | **capability 2 of 5 · preview** (single-repo calibration note) |
| Micro-A PR diff | **capability 3 of 5 · preview** (consumer of the hosted-platform data middle layer; after hardening, this layer is now an official engine entry point:  #85②, D-204③④) |
| Micro-B single-file scale | **capability 4 of 5 · preview** (`audit file` file card; the pilot repos are two repos under the same owner, jiahao and env-manager, used for file-rename tracking and calibration:  advice only (`advisory` / advisory-only), kept structurally apart from adjudication, advice never enters the decision checkpoint) |
| Macro-A cross-repo strategy scale | Not yet in preview |

## What a report looks like {#what-a-report-looks-like}

This is a real excerpt from this repository's self-audit ([examples/first-report/23-first-report.md](examples/first-report/23-first-report.md)):  verdicts are written down as measured, not rounded up:

```text
# MA-23-6F-FIRST-REPORT :  Macro-B first report (6F@fc00d458…)
> RECEIPT RCP-9d20125ad0976c86  facts=228  adjudications=6
> issued_at=2026-09-13T14:31:09+08:00  commit=fc00d458e215…  tree=6f405cfc2ce5

- overall_verdict: unsupported        confidence: 0.75
- headline: main premise falsified at TC-2 (mean_ratio 0.2462 < 0.60,
  Status/Date missing 84.62%); TC-1 INCONCLUSIVE; TC-3 AMBER
```

## Quick check {#quick-verification}

Run from source (Node ≥ 22.18):

```bash
cd engine
npm install
npm test         # gen manifests → tsc build → smoke (launch & liveness)
npm run selftest
```
---


## Three layers {#architecture-three-layers}

![Three-layer architecture: Agent Plugin distribution layer → facts and adjudication core → upstream evidence layer](docs/assets/architecture.svg)

The distribution layer (CLI, skills shell, MCP surface) sits on a core we built: an append-only `audit_fact` DuckDB fact table, shared `verdict-gate` decision rules, and a receipt with two checks. Evidence comes in only through the data middle layer; upstream raw content never leaves that layer.


## Upstreams {#upstream-components}

| upstream | what it does | form | how it is brought in (D-020 dual-track) | lock method | status |
|---|---|---|---|---|---|
| DuckDB（@duckdb/node-api） | fact-table base | Node library | runtime dependency | package-lock exact lock | 已接入（active） |
| git CLI | dig repository history / deterministic collection | external CLI | middle layer + external CLI | comes with the host; parsing its output is the contract | 已接入（active） |
| CodeLore | code archaeology / evidence layer | CLI | middle layer + external CLI | exact pin 0.28.0 + golden contract tests | 已接入（active；只读检查：explain/summary） |
| OpenSSF Scorecard | supply-chain health score | Go library / CLI | library → dependency; CLI → middle layer | hash lock / locked version | 规划中（planned） |
| GitHub REST API | PR data source for the change scale (Micro-A):  enumeration/metadata/diff fallback; local git first | remote-api | middle layer + env token three-level probe | X-GitHub-Api-Version fixed + golden cassette contract | 已接入（active） |

Upstreams are brought in on two tracks: middle layer + external CLI/library is the main line; library-form upstreams are fixed by package-manager lockfile hash; copying upstream source into the repo is the last resort, only for offline distribution or abandoned upstreams.


## Who owns what {#ownership-boundary}

| owner | component |
|---|---|
| **Ours** | shared decision-checkpoint rules (`verdict-gate`) · DuckDB fact-table structure (append-only + cross-scale correlation keys) · three acceptance gates (A form / B criteria written before the run / C human override) · receipt with two checks · criteria written before the run (2 positive controls + 3 real criteria + 1 negative control) |
| **Upstream** | DuckDB engine itself · git CLI · CodeLore (connected · read-only check) · GitHub REST API (connected · REST primary + optional `gh` fallback) · OpenSSF Scorecard (planned) |

## Rules {#contracts}

- Upstream components write to the fact table **only through the data middle layer**; upstream raw content never leaves that layer (isolation rule: no business rules in the middle layer).
- Replacing or upgrading an upstream **must not change the fact-table structure**:  the structure is fixed; changes only go through version numbers.
- Every upstream is version-locked and has golden output contract tests; copying upstream source into the repo is only for offline distribution or abandoned upstreams, and must carry an UPSTREAM manifest and patches/ rules.

## Repository layout {#repository-map}

| path | contents |
|---|---|
| [docs/authority.md](docs/authority.md) | decisions and terms |
| [GLOSSARY.md](GLOSSARY.md) | glossary:  what each domain word means |
| [docs/spec.md](docs/spec.md) | product decisions (gaps: docs/known-gaps.md; risk records: docs/ra/) |
| [docs/adr/](docs/adr/) | architecture decisions (background / options / consequences) |
| [engine/](engine/) | kernel CLI + Agent Plugin five-layer box (build / command details in [engine/README.md](engine/README.md)) |
| [examples/first-report/](examples/first-report/) | release sample: 6F self-audit Macro-B first report, four files (happy + failure pair, explanation rules) |
| [engine/CHANGELOG.md](engine/CHANGELOG.md) | product version record |

## Try it on a real repository {#try-on-a-real-repository}

External repos only come in through URL opt-in (D-013 local first + URL opt-in): clone to an isolated cache (sha256 as key) + full-depth check + shallow clone rejected outright + remote config must not run + reuse the local git credential chain.

```bash
cd engine && npm install && npm run build

# intake: local path | owner/repo (local-first) | URL opt-in isolated clone
node dist/cli.js repo add https://github.com/open-gsd/gsd-core.git
node dist/cli.js repo add /path/to/local/repo

# audit: first-class command :  Macro-B default; Macro-C / Micro-A also shipped
node dist/cli.js audit /path/to/local/repo
node dist/cli.js audit <repo> --scale Macro-C
node dist/cli.js audit <repo> --scale Micro-A

# Micro-B file card (lazy supplementary collection, --db required)
node dist/cli.js audit file <repo> <file> --db <facts.duckdb> [--at <sha>]
```

- Opt-in public repo example: [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) (this repo has actually onboarded it: on 2026-09-16 it ran Macro-B once, produced 1424 facts, and wrote the `unsupported` verdict down as measured:  TC-2 traced to a detection gap for ADR dash+bold formatting, registered as a coverage gap; the run record is in execution record A-045).
- **⚠ external content changes with its upstream**: external repo content and structure follow their upstream, so audit readings cannot be expected to match golden:  this example only shows the intake path, not a promise about any verdict.
- `--scale` only accepts the scales that are already built (`Macro-B` / `Macro-C` / `Micro-A`); a scale that is not built returns structured `SCALE-NOT-IMPLEMENTED` + exit 2:  the CLI does not pretend to run scales that are not connected.

<!-- acknowledgments:start — GENERATED by engine/scripts/gen-acknowledgments.mjs; do not edit by hand (regen: node engine/scripts/gen-acknowledgments.mjs) -->
## Acknowledgments

6F builds on these upstream components — the `active` set in [engine/upstream-lock.yaml](engine/upstream-lock.yaml):

- **[CodeLore](https://github.com/emrecdr/codelore)** — code archaeology and evidence-layer external CLI (read-only explain/summary probes)
- **[DuckDB Node API](https://github.com/duckdb/duckdb-node)** — the DuckDB base that every audit scale writes its fact table into (@duckdb/node-api)
- **[DuckDB Node bindings](https://github.com/duckdb/duckdb-node)** — the platform-native DuckDB binaries the fact table runs on (@duckdb/node-bindings-*)
- **[git](https://github.com/git/git)** — deterministic repository history digging and evidence collection (external CLI, provided by the host)
- **[GitHub REST API](https://docs.github.com/rest)** — the PR data source for the change level (Micro-A) — enumeration / metadata / diff fallback, local git first
- **[esbuild](https://github.com/evanw/esbuild)** — single-file dist bundle builder for the packaged CLI
- **[SchemaStore](https://github.com/SchemaStore/schemastore)** — the claude-code-plugin-manifest schema, consumed as a snapshot-as-contract validation source
- **[Claude Code CLI](https://github.com/anthropics/claude-code)** — the claude plugin validate toolchain, used for advice only

*The full upstream record — including planned / evaluating / retired rows — lives in [engine/upstream-lock.yaml](engine/upstream-lock.yaml). Legal attribution obligations are carried by NOTICE/license files; this section is the human-readable credit list only.*
<!-- acknowledgments:end -->
