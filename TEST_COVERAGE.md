# Functional Test Coverage Report

_Assessed 2026-08-11. This is not a code/line coverage report. It asks a different question: for the things a real user does in this app — log in, open a list, fill a form, download a report, call in and report attendance by phone — is there an automated test that actually exercises that behavior?_

## TL;DR

- **Phone (Yemot IVR) attendance reporting is the best-tested feature in the app** — every call flow (transport confirmation, deadline cutoff, seminar attendance, manager report call) has a scenario test.
- **Report/export generation (Excel, PDF, "michlol" file) is well covered** at the data/business-logic level.
- ✅ **Client resource smoke tests and a Student CRUD e2e pilot have since been added** (see "What's genuinely covered").
- **The client (browser UI) still has thin functional coverage** — the new smoke test confirms every resource list page renders, but no create/edit form, or button click is ever exercised.
- Login/auth itself is tested in the shared `nra-server`/`nra-client` libraries this app depends on, so it's inherited "for free" — not a gap specific to this app.

## Coverage by area

| Area | Client (browser) | Server (API / business logic) | Verdict |
|---|---|---|---|
| Phone attendance reporting (Yemot) | n/a | Every call-flow branch scenario-tested (`yemot-handler.service.test.ts`) | ✅ Strong |
| Report/export generation (Excel, PDF, michlol file) | Not applicable (triggered server-side) | `reportGenerator.spec.ts`, `michlolPopulatedFile.spec.ts`, `teacherReportFile.spec.ts`, `studentReportData.util.spec.ts` | ✅ Strong |
| Entity business logic (custom export headers, computed fields, per-entity services) | — | 20 entity-config spec files exercise these, but against mocked repos, not a real DB/HTTP call | 🟡 Partial |
| Entity list pages render (all 24 entities) | ✅ `client/src/entities.test.js` (added) | — | ✅ Covered |
| Entity CRUD over real HTTP | — | ✅ Student: create/list/update/delete (`server/test/student-crud.e2e-spec.ts`, added); other 23 entities: none | 🟡 Partial (1 of 24) |
| Entity Create/Edit forms (fill + submit in a browser-level test) | None | — | 🔴 Gap |
| Login / permissions | Inherited from shared libraries (`nra-client`/`nra-server`) | Inherited from shared libraries | 🟢 Covered elsewhere, no action needed |

## What's genuinely covered

- **`server/src/yemot-handler.service.test.ts`** — this is a real functional test suite for the phone-based attendance flow teachers use daily: past-deadline hangups, transport confirmation happy/error paths, seminar attendance (with and without signature permission), "already reported today" guards, and the manager's daily report call. If this suite is green, the phone flow genuinely works.
- **`server/src/reports/__tests__/`** — Excel/PDF/michlol report generation is tested against realistic data, so a broken report layout or missing field would be caught.
- **`server/src/entity-modules/__tests__/*.config.spec.ts`** — covers custom business logic living in entity configs (e.g. `StudentConfig`'s report-type routing), but only at the service level with a mocked repository. It proves the logic is correct in isolation, not that the API endpoint built on top of it works end to end.
- **`client/src/entities.test.js`** (added) — wires the shared `createResourceTests` helper; renders every registered resource's list page and confirms it loads without crashing.
- **`server/test/student-crud.e2e-spec.ts`** (added) — real HTTP create/list/update/delete lifecycle for Student, against the in-memory test DB (not a mocked repo).

## What's not covered / at risk

1. **Create/Edit forms are still unverified.** The client smoke test confirms list pages render; no test fills in and submits a Create or Edit form for any of the 24 entities. A broken field or crashing form would only be caught by a human clicking through the app.
2. **CRUD e2e covers only 1 of 24 entities** (Student). The other 23 (Teacher, Klass, AttReport, Grade, Transportation, …) still have no HTTP-level test.
3. **Bulk actions and admin-only screens** (grade entry, report-group sessions, teacher salary report) have no test above the config/service layer — same gap as #1 and #2.

## Test inventory (what was reviewed)

- Server: `server/src/__tests__/entities.module.spec.ts`, `server/src/entity-modules/__tests__/*.config.spec.ts` (20 files), `server/src/reports/__tests__/*.spec.ts` (3 files), `server/src/utils/__tests__/studentReportData.util.spec.ts`, `server/src/yemot-handler.service.test.ts`, `server/test/app.e2e-spec.ts`, `server/test/student-crud.e2e-spec.ts` (added).
- Client: `client/src/App.test.js`, `client/src/entities.test.js` (added).
