## What & why

<!-- What changed and why. Link the GitHub issue, or the file that holds the decision (see docs/authority.md), if it applies. -->

## Self-check

This repo audits itself. Run the checks that match what you changed; the same rule shows up in the engine's own reports.

- [ ] `cd engine && npm test` passes (gen + build + smoke)
- [ ] If your change touches a contract, a checker, or the behavior they cover, the relevant `node engine/test/contracts/NN-check.mjs` exits 0
- [ ] `engine/src` changed → `engine/dist` rebuilt and committed (`npm run build`; `dist` ships with `src`, and CI fails when the two drift apart)
- [ ] Docs or a policy file (`SECURITY.md`/`CODE_OF_CONDUCT.md`) changed → `cd engine && npm run check:docs` exits 0 (read-only; covers authority pointers, ADR references, and the generated acknowledgments block)
- [ ] Wording follows [`GLOSSARY.md`](../GLOSSARY.md): one name per concept, and no retired or invented jargon outside the historical and frozen areas
- [ ] Machine-read names, numbers, and links untouched: database columns, JSON keys, CLI flags and error codes, file paths, and pinned phrases
- [ ] Decision made → recorded where decisions live (see [`docs/authority.md`](../docs/authority.md)) or explicitly confirmed not a decision
- [ ] No claims beyond the evidence: preview labels, ⚠ markers, and `synthetic` marks preserved — the capability matrix changes only when the capability actually ships
- [ ] No secrets or tokens; upstream credentials stay out of facts and logs
