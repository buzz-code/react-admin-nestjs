# Functional Test Coverage Report

_Assessed 2026-08-11. This is not a code/line coverage report. It asks a different question: for the things a real user does in this app — log in, open a list, fill a form, download a report, call in and report attendance by phone — is there an automated test that actually exercises that behavior?_

## TL;DR

- **Phone (Yemot IVR) attendance reporting is the best-tested feature in the app** — every call flow (transport confirmation, deadline cutoff, seminar attendance, manager report call) has a scenario test.
- **Report/export generation (Excel, PDF, "michlol" file) is well covered** at the data/business-logic level.
- **The client (browser UI) has effectively no functional coverage.** There's one smoke test that renders `<App/>` and checks *something* appeared on screen — no entity list, create form, edit form, or button click is ever exercised.
- **No test anywhere drives a real HTTP request through a real entity CRUD endpoint** (create/list/update/delete a student, teacher, class, etc.). The only HTTP-level ("e2e") test is a boilerplate "GET / returns Hello World" check.
- Login/auth itself is tested in the shared `nra-server`/`nra-client` libraries this app depends on, so it's inherited "for free" — not a gap specific to this app.

## Coverage by area

| Area | Client (browser) | Server (API / business logic) | Verdict |
|---|---|---|---|
| Phone attendance reporting (Yemot) | n/a | Every call-flow branch scenario-tested (`yemot-handler.service.test.ts`) | ✅ Strong |
| Report/export generation (Excel, PDF, michlol file) | Not applicable (triggered server-side) | `reportGenerator.spec.ts`, `michlolPopulatedFile.spec.ts`, `teacherReportFile.spec.ts`, `studentReportData.util.spec.ts` | ✅ Strong |
| Entity business logic (custom export headers, computed fields, per-entity services) | — | 20 entity-config spec files exercise these, but against mocked repos, not a real DB/HTTP call | 🟡 Partial |
| Entity CRUD screens (Student, Teacher, Klass, AttReport, Grade, …) — actually opening a list, submitting a create/edit form | None | None (no HTTP-level CRUD test for any entity) | 🔴 Gap |
| Login / permissions | Inherited from shared libraries (`nra-client`/`nra-server`) | Inherited from shared libraries | 🟢 Covered elsewhere, no action needed |

## What's genuinely covered

- **`server/src/yemot-handler.service.test.ts`** — this is a real functional test suite for the phone-based attendance flow teachers use daily: past-deadline hangups, transport confirmation happy/error paths, seminar attendance (with and without signature permission), "already reported today" guards, and the manager's daily report call. If this suite is green, the phone flow genuinely works.
- **`server/src/reports/__tests__/`** — Excel/PDF/michlol report generation is tested against realistic data, so a broken report layout or missing field would be caught.
- **`server/src/entity-modules/__tests__/*.config.spec.ts`** — covers custom business logic living in entity configs (e.g. `StudentConfig`'s report-type routing), but only at the service level with a mocked repository. It proves the logic is correct in isolation, not that the API endpoint built on top of it works end to end.

## What's not covered / at risk

1. **Client UI has one test in the whole app**: `client/src/App.test.js` renders `<App/>` and asserts *any* element exists. No List, Create, or Edit screen for any of the 24 client entities (Student, Teacher, Klass, AttReport, Grade, Transportation, …) is ever rendered in a test. A broken field, a crashing form, or a bad filter would only be caught by a human clicking through the app.
   - Note: the shared `nra-client` library ships a ready-made `createResourceTests` helper (a generic smoke test that renders every registered resource and confirms the page loads) — it exists but this app never calls it. Wiring it in would be the highest-value, lowest-effort fix here.
2. **No real HTTP CRUD test.** `server/test/app.e2e-spec.ts` only calls the shared `createSharedAppE2eTests`, which checks that the app boots on SQLite in-memory and `GET /` returns "Hello World!". No test creates a student via `POST /student`, lists teachers via `GET /teacher`, or checks that a filter/permission is enforced over real HTTP.
3. **Bulk actions and admin-only screens** (grade entry, report-group sessions, teacher salary report) have no test above the config/service layer — same gap as #1 and #2.

## Test inventory (what was reviewed)

- Server: `server/src/__tests__/entities.module.spec.ts`, `server/src/entity-modules/__tests__/*.config.spec.ts` (20 files), `server/src/reports/__tests__/*.spec.ts` (3 files), `server/src/utils/__tests__/studentReportData.util.spec.ts`, `server/src/yemot-handler.service.test.ts`, `server/test/app.e2e-spec.ts`.
- Client: `client/src/App.test.js` (only client test in the project).
