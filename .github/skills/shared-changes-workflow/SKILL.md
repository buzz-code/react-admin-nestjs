---
name: shared-changes-workflow
description: Use when authoring a NEW change in a shared submodule (client/shared -> nra-client, server/shared -> nra-server) and rolling it out across all NRA projects, when refactoring duplicated project code into a shared component, or when recording/consuming a CONSUMER_CHANGES.md row. For moving ONE project's pointer to an already-known target, use bump-shared-ref instead.
---

# Skill: Make a Shared Change Across NRA Projects

> **Use this skill when:** you modify code in `client/shared` (→ `nra-client`) or `server/shared` (→ `nra-server`) and must propagate it to all NRA projects, refactor duplicated project code into a shared component, or add/consume a `CONSUMER_CHANGES.md` row.
>
> **Not this skill when:** you're only moving one project's submodule pointer to a commit/branch that already exists — that's `bump-shared-ref`.

---

## Context

5 projects share two git submodules:

- `client/shared` → `buzz-code/nra-client`
- `server/shared` → `buzz-code/nra-server`

Each project pins the submodule to one commit. Shared code lives in **one place** (the submodule repo); all projects reference it. **Never** copy a shared file into each project — that creates divergent copies.

| Project | Client | Server |
|---|---|---|
| `react-admin-nestjs` | 3000 | 3001 |
| `event-management-nra` | 3010 | 3011 |
| `teacher-report-nra` | 3020 | 3021 |
| `student-report-nra` | 3030 | 3031 |
| `dnd-management-nra` | 3040 | 3041 |

`react-admin-nestjs` is the base project — author shared changes from its submodule checkout.

## The CONSUMER_CHANGES.md contract (read this first)

Both shared repos keep a `CONSUMER_CHANGES.md` table at their root. It is the handshake between "a shared change landed" and "each app wired it in". A row exists **only** for changes that do NOT work automatically after a pointer bump — i.e. they need a matching edit in each consuming app (a new import, a new package, a Dockerfile/compose label, a policy line).

| Column | Meaning |
|---|---|
| `Commit` | short hash of the shared commit (or `(docs)` for policy-only changes) |
| `Adds` | what the shared commit introduced |
| `Per-app action` | the exact edit each consuming app must make |
| `Done in` | which apps have already applied it |

**Rules:**
1. A shared change that is purely additive and auto-works after a bump gets **no row**. Only add a row when a consumer must do something.
2. When you author such a change, **add the row in the same shared PR**, `Done in` listing whatever apps you wired in this pass (often none yet).
3. When you wire an app (here or via `bump-shared-ref`), **append that app to the row's `Done in`** in the shared repo and commit it.
4. If a bump breaks an app at runtime but no row explains it, the doc is missing an entry — add it.

## Workflow

### 1. Author the change in the shared submodule

```bash
cd /workspaces/react-admin-nestjs/client/shared   # or server/shared
git checkout -b claude/<descriptive-name>
# make changes...
```

If the change needs per-app wiring, edit `CONSUMER_CHANGES.md` in the same checkout (see contract above). Commit and push:

```bash
git add .
git commit -m "feat: <shared change>"
git push -u origin claude/<descriptive-name>
```

### 2. Verify in the base project

```bash
cd /workspaces/react-admin-nestjs/client && yarn test   # or server
```

Fix + re-push shared code until green.

### 3. Ask before merging the shared PR

Do **not** merge or open PRs without user confirmation. The shared PR merges to the shared repo's `main` **before** any project's `main` pins it (the main-branch rule — see `bump-shared-ref`).

### 4. Roll out to every project

After the shared PR merges, for each of the 5 projects use `bump-shared-ref`: bump the pointer to the merged `main` commit, apply the row's `Per-app action`, append the app to `Done in`, commit pointer + consumer edits together, push to the project's branch.

### 5. Update the roadmap

If the change is client-facing, add a `roadmapFeatures.js` entry in each affected project (see multi-repo coding guidelines).

## Rules

1. Never push directly to `main` (shared or project) without asking. Use a branch.
2. Always ask before creating PRs.
3. Shared PR merges first; project `main` never pins a non-`main` shared commit.
4. One source of truth — shared code lives in the submodule only.
5. Test in at least one project before propagating.
6. Commit the submodule pointer (gitlink) whenever it moves.
