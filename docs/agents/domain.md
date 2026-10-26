# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **[`docs/authority.md`](../authority.md)**: the single written statement of where a decision or a term lands — everything below is a carrier it points at.
- **`GLOSSARY.md`** at the repo root: the terminology carrier.
- **`docs/spec.md`**: the product-decision carrier.
- **`docs/adr/`**: the architecture-decision carrier (Context / options / consequences).
- **`docs/known-gaps.md`**: code-level coverage gaps already registered.

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

## Flag decision conflicts

If your output contradicts a recorded decision, surface it explicitly rather than silently overriding — product decisions live in `docs/spec.md`, architecture decisions in `docs/adr/`:

> _Contradicts docs/spec.md §…, but worth reopening because…_
> _Contradicts docs/adr/00NN-…, but worth reopening because…_
