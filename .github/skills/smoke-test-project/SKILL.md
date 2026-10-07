---
name: smoke-test-project
description: Use when you need to verify that all API endpoints of a running NRA project are healthy, or when asked to "test", "check endpoints", or "run smoke tests" on a project.
---

# Skill: Smoke Test a Project

> **Use this skill when:** you need to verify that all API endpoints of a running NRA project are healthy, or when asked to "test", "check endpoints", or "run smoke tests" on a project.

---

## Context

Each project's server has a `helpers/endpoints.env` file listing all registered entity endpoints. The shared runner script logs into the backend and calls every endpoint with the authenticated cookie.

**Prerequisite:** The project must be running. Use the `run-one-project` skill first if needed.

---

## Server Port Reference

| Project | Server Port |
|---------|-------------|
| `react-admin-nestjs` | 3001 |
| `event-management-nra` | 3011 |
| `teacher-report-nra` | 3021 |
| `student-report-nra` | 3031 |
| `dnd-management-nra` | 3041 |
| `form-call` | 3051 |

---

## Steps

### 1. Navigate to the project's server directory

```bash
cd /workspaces/<project-name>/server
```

### 2. Load the endpoint list and run the smoke test

```bash
set -a && . helpers/endpoints.env && set +a
BACKEND_URL=http://localhost:<SERVER_PORT> \
  sh shared/utils/testing/test-all-endpoints-runner.sh
```

**Example for `teacher-report-nra`:**
```bash
cd /workspaces/teacher-report-nra/server
set -a && . helpers/endpoints.env && set +a
BACKEND_URL=http://localhost:3021 \
  sh shared/utils/testing/test-all-endpoints-runner.sh
```

### 3. Read the results

The runner prints a line per endpoint:
```
✅ GET /user → 200
✅ GET /student → 200
❌ GET /report_period → 500
```

Exit code = number of failed endpoints (0 = all passed).

---

## Baseline (All Passing as of 2026-05-07)

| Project | Endpoints |
|---------|-----------|
| `react-admin-nestjs` | 44/44 |
| `event-management-nra` | 28/28 |
| `teacher-report-nra` | 30/30 |
| `student-report-nra` | 22/22 |

---

## Running Unit Tests (without a live server)

```bash
# Client (React/Jest)
cd /workspaces/<project-name>/client
yarn test --watchAll=false --passWithNoTests

# Server (NestJS/Jest)
cd /workspaces/<project-name>/server
yarn test
```

Or run all projects at once from the bootstrap repo:
```bash
bash /workspaces/multi-repo-codespace/scripts/run-client-tests.sh
bash /workspaces/multi-repo-codespace/scripts/run-server-tests.sh
```

---

## Quick Login Smoke Test

1. Open `http://localhost:<CLIENT_PORT>/login` in the browser
2. Sign in with `admin_user` / `admin_password`
3. Confirm the URL changes from `/login` to `/` (dashboard)

A 500 on the dashboard after login is a **data layer issue**, not an auth failure.

---

## Troubleshooting Smoke Tests

| Symptom | Cause | Action |
|---------|-------|--------|
| Login fails ("Login failed") | Server not ready or DB migration missing | Wait 30 s, rerun |
| Specific endpoint returns 500 | Missing migration, data issue | Check server logs, see debug skill |
| `helpers/endpoints.env` not found | Project not fully set up | Check that `server/shared` submodule is initialized |
| All endpoints fail | Server container crashed | `docker-compose logs server` |
