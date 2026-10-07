---
name: debug-project-issues
description: Use when a project returns HTTP 500, containers fail to start, migrations are missing, or login/dashboard errors occur.
---

# Skill: Debug Project Issues

> **Use this skill when:** a project returns HTTP 500, containers fail to start, migrations are missing, or login/dashboard errors occur.

---

## Diagnostic Checklist

Work through these steps in order. Stop at the first step that reveals the problem.

### Step 1 — Check container status

```bash
cd /workspaces/<project-name>
docker-compose ps
```

All three services (`client`, `server`, `database`) should show `Up`. If any are `Exit` or `Restarting`, inspect their logs (Step 2).

### Step 2 — Read container logs

```bash
# Last 50 lines of server logs
docker-compose logs --tail=50 server

# Last 50 lines of database logs
docker-compose logs --tail=50 database

# Follow logs in real time
docker-compose logs -f server
```

Common log patterns:

| Log Message | Meaning |
|------------|---------|
| `TypeORM connection failed` | DB container not ready yet; wait 10 s and retry |
| `Migration ... not applied` | Run migrations (see Step 3) |
| `ECONNREFUSED` | Service trying to reach DB before it's ready |
| `Cannot read property ... of undefined` | Entity mapping issue in server code |

### Step 3 — Check migration status

Connect to the database:

```bash
# Replace port with the project's DB port (3306 / 3316 / 3326 / 3336 / 3346 / 3356)
docker exec -it <container-name>-database-dev \
  mysql -u root -proot <dbname> -e "SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 20;"
```

Container name prefix per project:
- `react-admin-nestjs` → `ran-database-dev`
- `event-management-nra` → `event-database-dev`
- `teacher-report-nra` → `teacher-database-dev`
- `student-report-nra` → `student-database-dev`
- `dnd-management-nra` → `dnd-database-dev`
- `form-call` → `form-call-database-dev`

If migrations are missing, trigger a re-run:

```bash
# The dev server command already runs migrations on start.
# Restart the server container to re-run them:
docker-compose restart server
docker-compose logs -f server  # watch for "Migrations applied"
```

### Step 4 — Run the endpoint smoke test to isolate failing routes

```bash
cd /workspaces/<project-name>/server
set -a && . helpers/endpoints.env && set +a
BACKEND_URL=http://localhost:<SERVER_PORT> \
  sh shared/utils/testing/test-all-endpoints-runner.sh
```

A 500 on a specific endpoint narrows the problem to that entity's resolver, service, or migration.

### Step 5 — Identify the error type

| Error | Category | Next action |
|-------|---------|------------|
| 401 on `/auth/login` | Auth | Check `ADMIN_USER`/`ADMIN_PASSWORD` env vars |
| 500 on `/auth/login` | DB issue | Check DB connection and migrations |
| 500 on entity endpoint | Data or mapping | Check entity definition and DB schema |
| 404 on entity endpoint | Route not registered | Check `entities.module.ts` |

---

## Restart a Single Container

```bash
cd /workspaces/<project-name>
docker-compose restart server   # restart server without losing DB state
```

## Full Reset (destroys database volumes)

```bash
cd /workspaces/<project-name>
docker-compose down -v          # -v removes named volumes (DB data)
docker-compose up -d client server database
```

Wait ~60 s for migrations to re-run from scratch.

---

## Login Smoke Test

1. Open `http://localhost:<CLIENT_PORT>/login`
2. Sign in: `admin_user` / `admin_password`
3. URL should leave `/login` and reach the dashboard

If login succeeds but the dashboard shows a 500, the problem is in the data layer, not auth.

---

## Common Issues and Fixes

### "No .env found"

```bash
cd /workspaces/<project-name>
cp .env.template .env
```

### "docker-compose.override.yml not found"

```bash
cd /workspaces/<project-name>
cp docker-compose.override.yml.template docker-compose.override.yml
```

### node_modules missing inside container

The volume mount path must match the actual `node_modules` location. Check `docker-compose.override.yml`:

```yaml
volumes:
  - ./client:/app
  - ./client/node_modules:/app/node_modules   # must point to real dir or valid symlink
```

If `node_modules` is a broken symlink, run `bash /workspaces/multi-repo-codespace/setup-node-modules.sh`.

### Submodule not initialized

```bash
cd /workspaces/<project-name>
git submodule update --init --recursive
```

---

## Escalation

If none of the above steps resolve the issue:
1. Note the exact error from `docker-compose logs server`
2. Note which endpoints fail in the smoke test
3. Check if the same endpoint fails in a freshly reset project (with `-v` down)
4. Compare the entity definition in `entities.module.ts` against the migration files in `server/src/migrations/`
