# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

Where a decision or a term belongs is stated once, in **[`docs/authority.md`](../authority.md)**. Read the files below for content:

- **`GLOSSARY.md`** at the repo root — domain vocabulary.
- **`docs/spec.md`** — product decisions.
- **`docs/adr/`** — architecture decisions (Context / options / consequences).
- **`docs/known-gaps.md`** — code-level coverage gaps already registered.

If any of these files don't exist, proceed silently. Don't flag their absence.

## File structure

Single-context repo:

```
/
├── GLOSSARY.md
├── docs/
│   ├── authority.md
│   ├── spec.md
│   ├── adr/
│   └── known-gaps.md
└── engine/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Reviewing the authority surface

When a diff touches `docs/authority.md`, `GLOSSARY.md`, or the files that point at it, apply each of these:

- **A pointer points.** It names the target and stops there; the carrier→decision-type mapping is written once, in `docs/authority.md`.
- **A term definition defines.** What the term is, in domain language. Mechanics (fields, paths, materialization) stay with the ADR or spec that owns them.
- **A count is either an invariant or a snapshot.** A number read off a moving target (tracker range, entry tally) is stated as a direction ("只增不减") or replaced by the rule it was meant to encode.

## Flag decision conflicts

If your output contradicts a recorded decision, surface it explicitly rather than silently overriding (`docs/authority.md` says which carrier holds it):

> _Contradicts docs/spec.md §…, but worth reopening because…_
> _Contradicts docs/adr/00NN-…, but worth reopening because…_
