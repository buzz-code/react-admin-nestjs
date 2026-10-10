---
name: yemot-integration
description: Use when working on Yemot (Israeli IVR phone) call flows in any NRA project — adding or changing a phone menu/report flow, editing the per-project YemotHandlerService, fixing call/hangup/upload/download behavior, or writing IVR scenario tests. Covers the shared v2 handler base and scenario test harness in server/shared (nra-server) utils/yemot.
---

# Skill: Work on a Yemot IVR Flow

> **Use this skill when:** touching phone call logic — the IVR menus a caller hears, report-by-phone flows, call tracking, file upload/download to Yemot, or their tests.

---

## Architecture

Shared code lives in `server/shared/utils/yemot/` (`nra-server`); each project subclasses it.

- **v2 (current) — subclass `BaseYemotHandlerService`.** Each project defines `server/src/yemot-handler.service.ts` extending it and overriding `processCall()`. Inside, `this.call`, `this.user`, `this.logger` are available; branch on `hasPermission(this.user, '<key>')` to route to the right flow. See `react-admin-nestjs/server/src/yemot-handler.service.ts`.
- The shared router (`v2/yemot-router.service.ts`) and call tracker (`v2/yemot-call-tracking.service.ts`) own call lifecycle: active-call map, step saving, hangup handling, `getUserByDidPhone()`.
- **v1 (legacy, unused) — do not use.** `yemot.module.ts`, `yemot.service.ts`, `chain.interface.ts`, `yemot.util.ts`, `yemot.exception.ts` and the `YemotProcessor`/`YemotRequest`/`YemotResponse` classes in `yemot.interface.ts` are the old chain-based flow. No project wires them; only `FormatString` from `yemot.interface.ts` is still imported. New phone code goes through v2 only.
- **Permissions:** phone flows are gated by permission keys (e.g. `seminarAttendanceYemot`, `yemotSimulator`). Adding/gating a flow → also use `manage-permissions`.

## Common tasks

**Add/change a flow:** edit the project's `YemotHandlerService.processCall()` (and its private `process*Call()` helpers). Ask the user (via `this.read/send` helpers on the base) for input, validate, persist. Keep flow-specific logic in the project; only truly shared IVR mechanics go in `nra-server`.

**Menu texts** live in DB (`YemotCall`/yemot-texts) and are updated via migrations — see the `UpdateYemotTexts*` migrations in `react-admin-nestjs/server/src/migrations/`. Use `generate-migration` for schema/text changes.

**File upload/download to Yemot:** paths must carry the `ivr2:` scheme prefix (a past bug shipped without it). `uploadFile`/`downloadFile`/`deleteFile` live in `utils/phone/yemot-api.service.ts` — reuse them, mind the auth and path prefix.

## Test with the scenario harness (no live phone)

`nra-server` ships an IVR test harness — import from `@shared/utils/yemot/testing`. Build a scenario with the fluent builder, run it against your handler; the runner seeds an in-memory DataSource, so no real Yemot and no real DB.

```ts
import { YemotScenarioBuilder, YemotScenarioRunner } from '@shared/utils/yemot/testing';

const scenario = new YemotScenarioBuilder('Happy path')
    .seed('User', [{ id: 1, phoneNumber: '...' }])
    .systemAsks(/enter.*id/i)
    .userResponds('123456789')
    .systemAsksConfirmation(/is this correct/i)
    .userConfirms(true)
    .systemHangsUp(/success/i)
    .build();

await new YemotScenarioRunner(YemotHandlerService).run(scenario);
```

Builder verbs: `.seed(entity, rows)`, `.systemSends()`, `.systemAsks(matcher)`, `.userResponds(input)`, `.systemAsksConfirmation(matcher)`, `.userConfirms(bool)`, `.systemHangsUp(matcher)`, `.build()`. Matchers are string or RegExp. Assert the flow reaches the expected hangup. See `write-tests` for the general test setup.

## Shared vs project

Changes to `BaseYemotHandlerService`, the router, the util, or the testing harness are shared (`nra-server`) → `shared-changes-workflow` + a `CONSUMER_CHANGES.md` row if apps must adapt. A project's own `YemotHandlerService` and its flows stay in that project.
