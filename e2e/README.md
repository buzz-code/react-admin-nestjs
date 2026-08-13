# Browser E2E (Playwright) — pilot

Real-browser tests, driving the actual client + server + a real database — not
mocks, not jsdom. This is a pilot covering one flow (login → dashboard) to
prove the pattern before deciding whether/how far to extend it. Not wired
into CI yet — that's a separate decision (see the repo's `TEST_COVERAGE_TODO.md`
in `multi-repo-codespace`, Phase 6).

## Why Playwright

This environment ships a pre-installed Chromium at `$PLAYWRIGHT_BROWSERS_PATH`
(`/opt/pw-browsers`), so there's no browser download step. `playwright.config.ts`
points `launchOptions.executablePath` at it directly rather than relying on
`@playwright/test`'s own revision-matched download, which avoids a network
fetch that may not even be reachable in a sandboxed environment.

## Prerequisites: a live stack

Playwright needs the client and server actually running against a real
database — see the `run-without-docker` skill (`multi-repo-codespace/.github/skills/`)
for the full walkthrough if you don't have Docker. Short version:

```bash
# 1. MySQL, once
apt-get install -y mysql-server-8.0 && service mysql start
mysql -u root -e "
  CREATE DATABASE mysql_database CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
  CREATE USER 'mysql_user'@'localhost' IDENTIFIED BY 'mysql_password';
  GRANT ALL PRIVILEGES ON mysql_database.* TO 'mysql_user'@'localhost';
  GRANT SYSTEM_USER ON *.* TO 'mysql_user'@'localhost';
  FLUSH PRIVILEGES;
"

# 2. Load the schema checkpoint + remaining migrations (fast path — see
#    run-without-docker for the full-replay alternative)
mysql -u root mysql_database < db/data.sql
cd server && NODE_ENV=development yarn typeorm:run

# 3. Start server and client — NODE_ENV=development is required, not optional:
#    server/shared/utils/bootstrap.util.ts only allows the browser's
#    localhost origin through CORS when NODE_ENV === 'development'. Without
#    it every request from the client to the API fails as a silent CORS
#    error in the browser (curl/supertest calls don't hit this — they don't
#    send an Origin header — so this is easy to miss when smoke-testing the
#    API directly).
NODE_ENV=development MYSQL_HOST=localhost MYSQL_PORT=3306 \
  MYSQL_USER=mysql_user MYSQL_PASSWORD=mysql_password MYSQL_DATABASE=mysql_database \
  JWT_SECRET=jwt_secret PORT=3001 yarn start:dev   # server, separate shell

cd client && yarn start   # client, separate shell — picks 3000, falls back if taken
```

Default API URL resolution in the client (`constantsProvider.js`) is
`http://<hostname>:<client-port + 1>`, so client on 3000 + server on 3001
just works with no extra client-side config.

## Running

```bash
cd e2e
yarn install
yarn test                                   # against http://localhost:3000
E2E_BASE_URL=... E2E_API_URL=... yarn test  # against a different stack
```

## What's covered

- `tests/login-dashboard.spec.ts` — registers a fresh user via the API (same
  pattern as `server/test/*-crud.e2e-spec.ts`, not seeded DB fixtures — the
  checkpoint dump's password hashes aren't real bcrypt hashes of any known
  password), logs in through the actual UI form, and confirms the dashboard
  loads (sidebar renders, no leftover login form, no error page).

## What this catches that jsdom smoke tests don't

Real browser rendering, real CORS/cookie/auth wiring end to end, and an
actual multi-page flow (form submit → redirect → authenticated data fetch →
render) against a live server and database. The jsdom-based `entities.test.js`
smoke tests (client, mocked `dataProvider`) are cheaper and catch a different,
larger class of bug (any resource crashing on mount) — see that file's
comments for the trade-off between the two.
