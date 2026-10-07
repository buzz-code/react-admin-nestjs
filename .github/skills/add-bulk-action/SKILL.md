---
name: add-bulk-action
description: Use when adding a new bulk action (a button that runs an operation on the rows selected in a list/datagrid) or modifying an existing one, in any NRA project.
---

# Skill: Add or Modify a Bulk Action

> **Use this skill when:** asked to add a new bulk action to an entity's list, or to change what an existing bulk action does.

---

## Context

Only the generic *plumbing* for bulk actions lives in the shared submodules and is reused by all four NRA projects:
- Client base components: `client/shared` (submodule `nra-client`) → `components/crudContainers/`
- Server base plumbing: `server/shared` (submodule `nra-server`) → `base-entity/`

A specific bulk action's wiring and business logic is **project-local by default** — it lives in that project's own `client/src/entities/<entity>.jsx` and `server/src/entity-modules/<entity>.config.ts`, not in the shared submodules. It only becomes shared (usable by other projects) if you deliberately extract it:
- Client: a reusable preset button component in `client/shared/components/crudContainers/` (like `BulkFixReferenceButton.jsx`), which other projects' entity files can then import.
- Server: a reusable util in `server/shared/utils/entity/` (like `fixReference.util.ts`), which other projects' service overrides can then call.

Don't extract to shared unless the action (or its logic) is genuinely reusable across projects — a one-off action just needs the project-local wiring below.

A bulk action has two halves that are linked by a single **name string**:
- **Client**: a button rendered in an entity's `Datagrid`, which calls `dataProvider.action(resource, name, params)`.
- **Server**: a `case` in that entity's `doAction()` override, matched on `req.parsed.extra.action === name`.

The request flow: button click → `POST /:resource/action?extra.action=<name>&extra.ids=<selectedIds>&...` → `BaseEntityController.doAction` → `<Entity>Service.doAction` → your `switch` case.

## Client-side building blocks (`client/shared/components/crudContainers/`)

| Component | Use for | Notes |
|---|---|---|
| `BulkActionButton.jsx` | A generic action, fire-and-forget or with a params form | Calls `dataProvider.action(resource, name, { 'extra.ids': selectedIds, ...formData })` |
| `BulkReportButton.jsx` | An action that downloads a generated file | Calls `dataProvider.execAndDownload(resource, 'report?...', ...)` instead |
| `BulkFixReferenceButton.jsx` | Thin preset over `BulkActionButton` for the `fixReferences` action | Copy this pattern for other one-off preset buttons |
| `BulkRequestButton.jsx` | Shared UI both of the above use | Renders a plain button, or (if you pass `children` inputs) a dialog to collect extra params first, caching last-used values |

Common props: `name` (must match the server-side `action` string), `label`, `icon`, `reloadOnEnd` (refresh the list after the mutation), `defaultRequestValues`, and `children` (react-admin `<Input>` elements) if the action needs user-supplied parameters.

## Steps: add a new bulk action

0. **Decide scope**: is this action specific to one project, or genuinely reusable across the four NRA apps? Default to project-local (steps 1-2 below); only add to `client/shared`/`server/shared` if reuse is the actual goal (see Context).
1. **Client** — in the entity file (`client/src/entities/<entity>.jsx`):
   - Import `BulkActionButton` (or `BulkReportButton`), or import a shared preset if one already fits (e.g. `BulkFixReferenceButton`).
   - Add an entry to that file's `additionalBulkButtons` array with a unique `key` and a `name` — pass `children` inputs if the action needs params.
   - Pass `additionalBulkButtons={additionalBulkButtons}` to `CommonDatagrid` (already wired if the file already has other bulk buttons).
   - If the action should be reusable across projects, build the preset in `client/shared/components/crudContainers/` instead (following `BulkFixReferenceButton.jsx`) and import it from there.
2. **Server** — in `server/src/entity-modules/<entity>.config.ts`:
   - Override `doAction(req, body)` on the entity's service class (extend `BaseEntityService`) if not already overridden.
   - Add a `case '<name>':` to the `switch (req.parsed.extra.action)` matching the client's `name`.
   - Read ids/params via `@shared/utils/queryParam.util` helpers (`getAsNumberArray`, `getAsDate`, `getAsBoolean`) off `req.parsed.extra`.
   - Do the work, then `return` a user-facing (Hebrew) result string. Fall through to `super.doAction(req, body)` for unmatched actions.
   - If the logic is genuinely reusable across projects, extract it into a util in `server/shared/utils/entity/` (following `fixReference.util.ts`) and call that from the `case`.
3. Restart the project (`bash scripts/start-project.sh <project>`) and verify: select rows in the entity's list, trigger the button, confirm the success/error notification and (if `reloadOnEnd`) the list refresh.

## Steps: modify an existing bulk action

1. Find the button by its `name`/`label` in `client/src/entities/<entity>.jsx`.
2. Find the matching `case '<name>':` in that entity's `doAction()` in `server/src/entity-modules/<entity>.config.ts`.
3. Change client-side params (add/remove `children` inputs) and/or server-side logic together — they share the `extra.*` param names.

## Reference example (`fixReferences`, on `Klass`)

- Client wiring: `client/src/entities/klass.jsx` — `additionalBulkButtons` array, `<BulkFixReferenceButton key="fixReferences" label="תיקון שיוך" />`
- Client preset: `client/shared/components/crudContainers/BulkFixReferenceButton.jsx`
- Server: `server/src/entity-modules/klass.config.ts` — `KlassService.doAction`, `case 'fixReferences'`
- Shared util: `server/shared/utils/entity/fixReference.util.ts`

Other examples worth reading: `klass.jsx` also has `klassAttendanceReport` (a `BulkReportButton` with a params dialog and file download), and `user.jsx` has `bulkUpdatePaid`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Button click does nothing / no network request | `name` prop missing, or button not included in `additionalBulkButtons` passed to `CommonDatagrid` |
| Server returns "done nothing" | No `case` matches `req.parsed.extra.action` — check the `name` strings match exactly on both sides |
| Params form fields come back `undefined` on the server | Field `source` name doesn't match what you read via `req.parsed.extra.<field>` |
| Selected rows don't clear after the action | `BulkActionButton`/`BulkReportButton` call `onUnselectItems()` on success — check your custom implementation does too if you wrote one from scratch |
