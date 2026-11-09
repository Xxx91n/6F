# Domain Docs

How the engineering skills should read this repo's domain documentation while they explore the codebase.

## Before exploring, read these

Where a decision or a term belongs is written once, in **[`docs/authority.md`](../authority.md)** — the authority surface. The files below hold the content:

- **`GLOSSARY.md`** at the repo root — the primary name for each domain term.
- **`docs/spec.md`** — product decisions.
- **`docs/adr/`** — architecture decisions (Context / options / consequences).
- **`docs/known-gaps.md`** — known gaps already registered.

If one of these files is missing, keep going and do not mention it.

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

## Use the glossary's names

When your output names a domain concept — an issue title, a refactor proposal, a hypothesis, a test name — use the name `GLOSSARY.md` gives it. Do not drift to a synonym the glossary avoids.

If the concept you need is not in the glossary, decide which case you are in: you are inventing language the project does not use (reconsider), or the term is really missing (note it for `/domain-modeling`).

## Reviewing the authority surface

When a diff touches `docs/authority.md`, `GLOSSARY.md`, or a file that points at it, check these:

- **A pointer only points.** It names the target and stops. The map from carrier to decision type is written once, in `docs/authority.md`.
- **A term definition defines.** It says what the term is. How it works — fields, paths, how a value is produced — belongs to the code and its comments; the reasons belong to the ADR or spec that owns it.
- **A count is a rule or a reading.** A number read off a moving target (a ticket range, an entry tally) is written as a direction ("only grows"), or replaced by the rule it stood for.

## Flag decision conflicts

If your output contradicts a recorded decision, say so in the open instead of quietly overriding it (`docs/authority.md` names the carrier that holds that decision):

> _Contradicts docs/spec.md §…, but worth reopening because…_
> _Contradicts docs/adr/00NN-…, but worth reopening because…_
