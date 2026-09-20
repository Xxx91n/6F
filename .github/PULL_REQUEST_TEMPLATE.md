## What & why

<!-- What changed and why. Link the issue or decision-ledger ID (D-xxx / A-xxx) if applicable. -->

## Dogfood checklist

This repo audits itself — the checklist below is the same discipline the engine reports on.

- [ ] `cd engine && npm test` passes (gen + build + smoke)
- [ ] Relevant guard script(s) green: `node .scratch/architecture-recovery/reports/NN-check.mjs` exits 0
- [ ] `engine/src` changed → `engine/dist` rebuilt and included (`npm run build`; dist ships with source, CI guards drift)
- [ ] `README.md` changed → `README.zh-CN.md` updated or `<!-- sync: <en-hash> -->` stamp deliberately reviewed (`73-check.mjs` must exit 0)
- [ ] Decision made → recorded in `.scratch/macro-audit/decision-ledger.md` (or explicitly confirmed not a decision)
- [ ] No claims added beyond evidence: preview labels, ⚠ markers, and `synthetic` marks preserved — capability matrix untouched unless the capability actually shipped
- [ ] No secrets or tokens; upstream credentials stay out of facts and logs
