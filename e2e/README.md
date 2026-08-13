# Browser E2E (Playwright)

Real-browser tests, driving the actual client + server + a real database — not
mocks, not jsdom. Deliberately narrow: three flows chosen for what only a real
browser + server + database can catch, not for breadth (the jsdom-based
`entities.test.js` smoke tests already cover every resource page cheaply —
see "What this catches that jsdom smoke tests don't" below). Wired into CI
as the `e2e-tests` job in `.github/workflows/run-tests.yml`, which stands up
a real MySQL service container, runs migrations, boots server + client, then
runs this suite against them.

## Why Playwright

This environment ships a pre-installed Chromium under `$PLAYWRIGHT_BROWSERS_PATH`
(`/opt/pw-browsers`), so there's no browser download step. `playwright.config.ts`
points `launchOptions.executablePath` at `/opt/pw-browsers/chromium` (a stable
symlink to the current versioned build) directly, rather than relying on
`@playwright/test`'s own revision-matched download, which avoids a network
fetch that may not even be reachable in a sandboxed environment. Override with
`PLAYWRIGHT_CHROMIUM_PATH` if your environment installs it elsewhere.

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

All three specs share `tests/helpers.ts`'s `registerTestUser()` — registers a
fresh user via the API (same pattern as `server/test/*-crud.e2e-spec.ts`, not
seeded DB fixtures — the checkpoint dump's password hashes aren't real bcrypt
hashes of any known password) — and `loginThroughUi()`, which logs that user
in through the actual UI form.

- `tests/login-dashboard.spec.ts` — confirms the dashboard loads after login
  (sidebar renders, no leftover login form, no error page).
- `tests/crud-roundtrip.spec.ts` — creates, edits, and deletes a `klass_type`
  through the real UI, checking after each step that the change actually
  round-tripped through the server and database (not just that the request
  didn't throw). `klass_type` is used because, as a non-admin user, it only
  needs two plain fields (no reference-picker dropdown to drive).
- `tests/export-download.spec.ts` — downloads a real Excel export and checks
  the file is non-empty. Exporting is gated on the user's `isPaid` flag, which
  nothing in the app itself can set for a fresh registration, so
  `tests/helpers.ts`'s `markUserAsPaid()` reaches directly into the database —
  setup for the flow under test, same reasoning as `registerTestUser()`
  reaching around the UI via the API.

## What this catches that jsdom smoke tests don't

Real browser rendering, real CORS/cookie/auth wiring end to end, an actual
multi-page flow (form submit → redirect → authenticated data fetch →
render), a create/edit/delete that really persists through the server and
database instead of a mocked `dataProvider`, and a real server-generated
file (the export test) — none of which a jsdom test with a mocked
`dataProvider` can exercise, since there's no real server or file on the
other end of the call. `entities.test.js`'s smoke tests are cheaper and
catch a different, much larger class of bug (any resource crashing on
mount) across every resource in the app — see that file's comments for the
trade-off between the two.
