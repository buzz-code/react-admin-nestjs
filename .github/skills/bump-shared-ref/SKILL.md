---
name: bump-shared-ref
description: Use when moving one project's client/shared (nra-client) or server/shared (nra-server) submodule pointer to a newer commit or branch, and figuring out whether the project's own code needs to change to match. Use when asked to "bump the shared ref/submodule", "update client/shared or server/shared", or "pull in a shared change" for a single project.
---

# Skill: Bump a Shared Submodule Reference

> **Use this skill when:** you need to move one project's `client/shared` (→ `nra-client`) or `server/shared` (→ `nra-server`) submodule pointer forward to a newer commit/branch, and determine whether the consuming project needs any code changes to go with it.

This is the single-project, single-submodule bump flow. If instead you're *making a new change* in the shared repo and need to roll it out across all five projects, use the `shared-changes-workflow` skill — that skill covers authoring the shared change; this one covers consuming an already-known target commit/branch, in one project, on either the client or server side.

---

## Context

Every NRA project pins each shared submodule to one specific commit — visible via `git submodule status` (a `-` prefix means uninitialized, `+` means the checked-out commit differs from what's committed, no prefix means clean and in sync). Moving that pointer touches two repos: the submodule directory's own git history moves to a new commit, and the parent project repo must commit that new commit hash as a change to its own tree (the "gitlink").

A bump is never purely mechanical. Because `client/shared`/`server/shared` code is consumed by all five NRA projects, a behavior or API change there can silently break a project that isn't updated to match. Treat every bump as: identify what changed, decide what (if anything) the consumer needs to change, then move the pointer and make that change together.

The exact same process applies to both submodules: `client/shared` (`nra-client` repo, client-side JSX/React-Admin code) and `server/shared` (`nra-server` repo, server-side TypeScript/NestJS code).

## Steps

### 1. Identify the gap

```bash
cd /workspaces/<project>/client/shared   # or server/shared
git fetch origin
git log --oneline HEAD..<target-branch-or-commit>   # commits you're about to pick up
```

This is the set of commits step 2 checks against `CONSUMER_CHANGES.md`.

### 2. Read the consumer changes doc

Each shared repo maintains `CONSUMER_CHANGES.md` at its root: a table of commits that don't work automatically after a bump, what each one adds, the required per-app action, and which apps have already done it.

```bash
cat client/shared/CONSUMER_CHANGES.md   # or server/shared/CONSUMER_CHANGES.md
```

For every row whose commit falls within the gap from step 1:
- This project already listed in **Done in** → nothing to do.
- Not listed → apply that row's **Per-app action** to this project.

This is the primary source for step 1's contract-diffing question — the shared repo's own commits already document what needs consumer follow-up, so you don't need to grep the diff for breaking changes yourself. Only fall back to reading the raw diff if a commit in the gap looks contract-affecting but has no row in `CONSUMER_CHANGES.md` — treat it the same as a listed row, and flag that the shared repo's doc is missing an entry for it.

### 3. Bump the pointer

```bash
cd /workspaces/<project>/client/shared   # or server/shared
git checkout <target-commit-or-branch>
cd /workspaces/<project>
git add client/shared   # or server/shared
```

This stages only the gitlink change (the submodule's new pinned commit) — nothing else.

### 4. Make the consumer changes identified in step 2

Edit the affected project-local files (`client/src/...` or `server/src/...`, e.g. `entities/<name>.jsx`, `entity-modules/<name>.config.ts`) to match the new shared contract. Scope this to exactly what step 2 flagged — a bump is not an opportunity to refactor unrelated consumer code.

### 5. Commit together

```bash
git add client/shared client/src/<changed files>   # adjust for client vs server side
git commit -m "chore: bump client/shared to <short-hash>

- <consumer change 1, if any>
- <consumer change 2, if any>"
```

Commit the pointer bump and its required consumer changes as one unit. A pointer bump that needed a consumer change but didn't get one leaves the project broken at that commit.

### 6. Verify (only if you made a consumer change)

A pointer-only bump with no row applying to this project needs no separate verification step. When step 2 did require a consumer change, run the relevant test suite (`cd client && yarn test`, `cd server && yarn test`) and, only if the change needs manual/UI checking, start the stack (`run-one-project` skill) and exercise the affected flow.

---

## The main-branch rule (critical)

- **On a feature/dev branch:** the submodule pointer may reference *any* commit or branch tip of `nra-client`/`nra-server` — including a commit that only exists on an unmerged branch — while you're iterating.
- **Once the project's branch is merged into its own `main`:** the submodule pointer must point to a commit that is on `nra-client`'s (or `nra-server`'s) `main` branch. A project's `main` must never end up pinning `client/shared`/`server/shared` to a commit that lives only on some other branch of the shared repo.

Before merging the project's branch into its `main`:
1. Confirm the shared-repo commit you depend on is actually merged into `nra-client`'s/`nra-server`'s `main` (check via the GitHub MCP tools, or ask the user to merge the shared PR first if it isn't).
2. Re-point the submodule to that `main` commit:
   ```bash
   cd /workspaces/<project>/client/shared   # or server/shared
   git fetch origin main
   git checkout main && git pull origin main
   ```
3. Re-stage and re-commit the pointer (steps 3 and 5 above) so the project's PR carries a `main`-pinned commit before it merges.

This rule is identical for both submodules — there is no client/server exception.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `git submodule status` shows a `-` prefix | Submodule not initialized — run `git submodule update --init --recursive` first |
| `git submodule status` shows a `+` prefix | Checked-out commit differs from what the parent repo has committed — someone bumped the working tree without staging/committing the gitlink, or checked out a different commit locally |
| Project's tests pass locally but another NRA project breaks | Expected — each project bumps its shared pointer independently and on its own schedule; the other project simply hasn't picked up this commit yet |
| A project's `main` points to a shared commit that isn't on the shared repo's `main` | The main-branch rule above was skipped — re-point to a real `main` commit of the shared repo and push a follow-up fix immediately |
| Nothing in `CONSUMER_CHANGES.md` applies, but something breaks at runtime anyway | The shared repo's doc is missing an entry for a commit in the gap — check `git log`/`git diff` for that commit directly, apply the fix, and flag the missing row |
