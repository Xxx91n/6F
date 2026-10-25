# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root: the single authority for domain vocabulary.
- **`docs/spec.md`**: the authority for product decisions.
- **`docs/known-gaps.md`**: code-level coverage gaps already registered.

If any of these files don't exist, proceed silently. Don't flag their absence.

## File structure

Single-context repo:

```
/
├── GLOSSARY.md
├── docs/
│   ├── spec.md
│   └── known-gaps.md
└── engine/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts a recorded product decision in `docs/spec.md`, surface it explicitly rather than silently overriding:

> _Contradicts docs/spec.md §…, but worth reopening because…_
