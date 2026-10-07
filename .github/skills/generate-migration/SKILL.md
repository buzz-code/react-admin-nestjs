---
name: generate-migration
description: Use when you've changed a TypeORM entity in any NRA project and need to produce the matching migration file, or when asked to generate, verify, or check a database migration against a real database instead of hand-writing SQL. For just running/testing a project locally without Docker (no migration to generate), use run-without-docker instead.
---

# Skill: Generate a TypeORM Migration Against a Real Database

> **Use this skill when:** you've changed an entity in any NRA project's `server/src/db/entities/` and need a migration file. Never hand-write migration SQL — `yarn typeorm:generate` diffs your entity against a live database and writes the exact SQL, including view recreations. Hand-written migrations drift from what TypeORM actually produces and are easy to get subtly wrong (collations, index names, view SQL).

---

## MySQL ports per project

| Project | MySQL Port |
|---|---|
| `react-admin-nestjs` | 3306 |
| `event-management-nra` | 3316 |
| `teacher-report-nra` | 3326 |
| `student-report-nra` | 3336 |
| `dnd-management-nra` | 3346 |

## Option A — Docker (preferred, if available)

```bash
cd $WORKSPACES_ROOT/<project>
[[ ! -f .env ]] && cp .env.template .env
[[ ! -f docker-compose.override.yml ]] && cp docker-compose.override.yml.template docker-compose.override.yml
docker-compose up -d database
```

Use the credentials from `.env` and the port from the table above, then skip to **Step 3**.

## Option B — Local MySQL (when Docker isn't available, e.g. sandboxed remote sessions)

Use the `run-without-docker` skill's steps 1–3 to install MySQL, create the database/user, and point `server/.env` at it. Come back here once that's done.

---

## Step 3 (both options): Load the baseline schema

`db/data.sql` at the project root is a checkpoint dump — its `migrations` table is pre-populated up to *some earlier commit*, not current HEAD. Load it, then replay whatever migrations remain:

```bash
cd $WORKSPACES_ROOT/<project>
mysql -u root <dbname> < db/data.sql
```

If it errors on a `GRANT ... TO 'user'@'%'` line near the top of the file, strip those lines first — they're docker-init-specific and fail against a plain root-created database.

```bash
cd server
NODE_ENV=development yarn typeorm:run
```

You now have a real database at exactly current HEAD's schema.

## Step 4: Make your entity change, then generate

Always pass `-p` (pretty-print) so the generated SQL is readable instead of one long line:

```bash
NODE_ENV=development yarn typeorm:generate src/migrations/YourMigrationName -p
```

**Check the generated file for noise.** If an existing entity has an index/column with no explicit name, TypeORM may compute a different auto-generated hash name than what's actually stored in the DB, and your migration will include an unrelated rename alongside your real change. Strip anything not related to what you changed.

## Step 5: Verify zero diff

Use `--dr` (dry run) so nothing is written to disk — no throwaway file to clean up:

```bash
yarn typeorm:run                              # apply your new migration
yarn typeorm:generate src/migrations/check -p --dr   # must say "No changes in database schema were found"
```

If it's not empty, the migration is incomplete or something else has drifted — investigate before considering it done.

## Step 6: Sanity-check `down()`

```bash
yarn typeorm:cli -- migration:revert
yarn typeorm:run     # re-apply so the DB ends up in the final state
```
