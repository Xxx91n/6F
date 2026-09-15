# CodeLore — Analysis catalogue

Auto-generated from `AnalysisName::all()`. Run `codelore explain <topic>` for per-analysis citations and formulas. The full citation chain lives in `docs/research-foundations.md`.

## Supported analyses

- `hotspots`
- `hotspot-velocity`
- `coupling`
- `ownership`
- `code-age`
- `abs-churn`
- `author-churn`
- `entity-churn`
- `communication`
- `code-health`
- `summary`
- `revisions`
- `authors`
- `clones`
- `clone-coupling`
- `soc`
- `messages`
- `main-dev`
- `main-dev-by-revs`
- `main-dev-by-deletions`
- `entity-effort`
- `entity-ownership`
- `top-committers`
- `knowledge-islands`
- `centrality`
- `communities`
- `god-classes`
- `architecture-violations`
- `dependency-cycles`
- `architecture-roles`
- `instability`
- `architecture-metrics`
- `architecture-trend`
- `health-trend`
- `cycle-origins`
- `modularity-violations`
- `unstable-interface`
- `crossing`
- `stale-code`
- `pair-programming`
- `lead-time`
- `bus-factor`
- `delivery-friction`
- `delivery-metrics`
- `refactoring-targets`
- `effort-exposure`
- `code-familiarity`
- `team-composition`
- `coordination-needs`
- `marginal-owner-risk`
- `release-cadence`
- `function-xray`
- `function-hotspots`
- `function-coupling`
- `finding-hotspot-overlap`
- `cycle-health`
- `defect-validation`

## Output formats

- `csv` — code-maat-compatible flat tables
- `json` — stable JSON shape per row type
- `ndjson` — newline-delimited JSON — one row per line for stream consumers (LSP, `jq -c`, CI pipelines)
- `sarif` — SARIF 2.1.0 — surfaces in GitHub Code Scanning
- `markdown` — GFM tables for `$GITHUB_STEP_SUMMARY`
- `gha` — GitHub Actions workflow commands — `::error::` / `::warning::` / `::notice::` on stdout, surfaced as inline PR annotations
- `html` — self-contained per-analysis HTML report
- `parquet` — columnar bulk export for analytical pipelines
- `sqlite` — full DuckDB fact-store dump
- `spa` — single-file interactive dashboard (opt-in via `spa` feature)
- `step-summary` — GFM summary for `$GITHUB_STEP_SUMMARY`; streams to stdout

## Conventions

- Files alive at HEAD only (deleted files excluded from path-aggregating analyses)
- Mailmap + `.codelore-teams` + `.codelorebots` consulted at ingest time
- `.gitignore` / `.codeloreignore` honoured
- `--time-bucket` supported on: hotspots, coupling, soc, code-health

## Reproducibility

Every file output is paired with a `.provenance.json` sidecar capturing the run's full `Options` shape. SQLite outputs embed the equivalent inside the `provenance` table.

_See also: `codelore profile` for operational telemetry, `codelore schema <type>` for row schemas, `docs/research-foundations.md` for citations._
