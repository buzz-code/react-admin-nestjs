# LLM Wiki

Documentation source for the customer-support chat widget (`server/src/llm-assistant`). Every file here gets loaded into the assistant's system prompt verbatim — the assistant answers *only* from what's written here.

## Folder layout

```
llm-wiki/
  faq/         # one file per recurring support question
  entities/    # one file per table/entity, explaining what it holds (not yet populated)
```

## Entry format

Every `.md` file starts with YAML frontmatter (stripped before it reaches the LLM, kept for maintainers):

```markdown
---
title: <short Hebrew title, matches how a customer would phrase it>
keywords: [<Hebrew UI terms>, <English code identifiers>]
verified_against:
  - <path/to/file.ts:line>
last_verified_commit: <git short sha>
---

## שאלה נפוצה
<the question, close to how a real customer asked it>

## הסבר
<the actual mechanism/rule, plain language, no hedging>

## תשובה מוצעת
<a ready-to-send answer, including any caveats>
```

## Adding a new entry

1. A new/unhandled support question comes in.
2. Find the actual rule in code — don't guess. Cite exact `file:line`.
3. Draft the entry using the format above.
4. **A human must review and correct it before merging** — an LLM-drafted business rule with a subtle error (missing a caveat, wrong condition) will otherwise reach customers as fact.
5. Commit.

## Keeping it current

Each entry lists the files it was verified against. When those files change, the entry may be stale. To check:

```bash
git log <last_verified_commit>..HEAD -- <path/to/file.ts>
```

If that shows commits, re-verify the entry against the current code and bump `last_verified_commit`. No automated staleness check yet — run this manually per entry when in doubt, or before a release.
