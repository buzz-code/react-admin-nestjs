---
name: manage-entity
description: Use when creating a brand-new CRUD entity (a full resource — table, API, and UI screens) or editing/removing fields on an existing one, in any NRA project.
---

# Skill: Create or Edit an Entity

> **Use this skill when:** adding a new CRUD resource from scratch (e.g. "add a `subject` entity"), or adding/removing/renaming a field on an existing one.

---

## Context

An "entity" spans two independent stacks glued together by **name agreement**, not by a shared registry:

- **Server** (NestJS + TypeORM + `@dataui/crud`): a TypeORM entity class → an auto-generated migration → a per-entity config → registration in one central module. `@dataui/crud` builds the REST controller from the entity class itself — there is **no separate DTO**; `class-validator` decorators live directly on the entity's columns.
- **Client** (React-Admin): a `client/src/entities/<name>.jsx` file (List/Create/Edit) built via a shared factory → a `<Resource>` in `App.jsx` → Hebrew translations.

Everything here is **project-local** (`server/src`, `client/src`) unless the entity is genuinely shared by all four apps (User, Page, PaymentTrack, etc. — those configs live in `server/shared/entities/configs/` and `client/shared/entities/`). **Never edit `client/shared` or `server/shared` directly** for a one-app entity — those are separate submodule repos (`nra-client`, `nra-server`).

The load-bearing convention is **name consistency end-to-end**: entity class name (`Klass`) → REST path / client resource `name` (`klass`, auto-derived via `snakeCase()`) → i18n key `resources.klass` → `registerEntityNameMap({ klass: ... })` key. A mismatch anywhere doesn't throw — it silently 404s or shows an untranslated key instead of Hebrew text.

## Building blocks

| File | Layer | Purpose |
|---|---|---|
| `server/src/db/entities/<Name>.entity.ts` | server, project-local | TypeORM entity class: columns, validation, relations, `@BeforeInsert`/`@BeforeUpdate` hooks |
| `server/src/migrations/<timestamp>-<Name>.ts` | server, project-local | Raw-SQL `up`/`down` migration matching the entity's columns |
| `server/src/entity-modules/<name>.config.ts` | server, project-local | `BaseEntityModuleOptions` — query joins, `crudAuth`, custom `service` (for `doAction`/`getReportData` overrides), `exporter` |
| `server/src/entities.module.ts` | server, project-local | Central registry: imports every config, wraps it in `BaseEntityModule.register(...)`, and `registerEntityNameMap({...})` for audit-log/import display names |
| `client/src/entities/<name>.jsx` | client, project-local | `Datagrid`, `Inputs`, `Representation`, filters — passed to the shared `getResourceComponents()` factory |
| `client/src/App.jsx` | client, project-local | `<Resource name="..." {...entity} icon={...} options={{ menuGroup: '...' }} />` |
| `client/src/domainTranslations.js` | client, project-local | Hebrew `resources.<name>.name` / `.fields.<field>` |
| `server/shared/base-entity/base-entity.module.ts` | server, shared | Turns a config into a full `@Crud()` controller — don't edit, just consume |
| `client/shared/components/crudContainers/CommonEntity.jsx` | client, shared | `getResourceComponents()` factory — builds List/Edit/Create and injects `isAdmin` |
| `client/shared/providers/i18nProvider.js` | client, shared | `generalResourceFieldsTranslation` — generic fallback for `id`, `key`, `name`, `userId`, `createdAt`, `updatedAt`, `year`; spread this first in every entity's `fields` |

## Steps: create a new entity

0. **Decide scope**: is this entity used only by this app, or genuinely needed by all four? Default to project-local. Only touch `client/shared`/`server/shared` if it's meant to be reused (that's a separate PR against the `nra-client`/`nra-server` repos).
1. **TypeORM entity** — create `server/src/db/entities/<Name>.entity.ts`:
   - `implements IHasUserId` (from `@shared/base-entity/interface`) and add a `@Column('int', { name: 'user_id' }) userId: number;` unless the entity is intentionally not user-scoped — `BaseEntityService` checks for `userId` to auto-filter by owner.
   - Use `CreatedAtColumn()`/`UpdatedAtColumn()` from `@shared/utils/entity/column-types.util` (not raw `@CreateDateColumn()` — these are DB-agnostic for MySQL prod / SQLite test).
   - Put `class-validator` decorators directly on columns, split by `CrudValidationGroups.CREATE`/`.UPDATE` (see `Klass.entity.ts` or the simpler `KlassType.entity.ts`) — use the Hebrew-messaged wrappers in `@shared/utils/validation/class-validator-he` (`IsNotEmpty`, `IsNumber`, `MaxLength`, `IsUniqueCombination`).
   - For a foreign key entered by the user as a natural key (not the numeric id), follow the `key`/`referenceId` dual-column pattern (`teacherId` + `teacherReferenceId`, resolved in a `@BeforeInsert`/`@BeforeUpdate` hook via `findOneAndAssignReferenceId`) — only needed if you want Excel-import-friendly natural keys; a plain `@ManyToOne` FK column is fine for a simple new entity.
2. **Migration** — from `server/`, run `npm run typeorm:generate -- src/migrations/<Name>` (diffs entities vs DB and writes the SQL) rather than hand-writing it. Confirm the generated file's `up()` matches the columns you expect; `down()` should `DROP TABLE`. Migrations auto-apply on server container start (`docker-entrypoint.sh` runs `typeorm:run:js`) — just commit the file and restart the server.
3. **Server config** — create `server/src/entity-modules/<name>.config.ts`. Minimal shape:
   ```ts
   function getConfig(): BaseEntityModuleOptions {
     return {
       entity: <Name>,
       exporter: { getExportHeaders: () => [{ value: 'key', label: 'מזהה' }, { value: 'name', label: 'שם' }] },
     };
   }
   export default getConfig();
   ```
   Add `query.join` for eager relations, `crudAuth: CrudAuthWithPermissionsFilter(...)` if it needs gating (see `manage-permissions` skill), or a custom `service extends BaseEntityService` if it needs bulk actions (`add-bulk-action` skill) or a custom report.
4. **Register it** — in `server/src/entities.module.ts`: import the config, add `BaseEntityModule.register(<name>Config)` to the `imports` array, and add an entry to `registerEntityNameMap({ ... })` keyed by the snake_case resource name (Hebrew display name for audit logs/import UI).
5. **Client entity file** — create `client/src/entities/<name>.jsx`. Define `Datagrid`, `Inputs`, `Representation = CommonRepresentation`, optional `filters`/`filterDefaultValues`/`importer`, and end with:
   ```jsx
   export default getResourceComponents({ Datagrid, Inputs, Representation, filters, filterDefaultValues });
   ```
   Gate admin-only columns/inputs with the auto-injected `isAdmin` prop (`{isAdmin && <TextField source="id" />}`). For a trivial admin-only/read-model resource you can skip this file and use `resourceEntityGuesser` directly in `App.jsx` instead.
6. **Register the resource** — in `client/src/App.jsx`: `import <name> from 'src/entities/<name>';` and add `<Resource name="<snake_case_name>" {...<name>} icon={<SomeIcon/>} options={{ menuGroup: '<group>' }} />`. The `name` string **must** equal the server's `snakeCase(<Name>)` path. Pick an existing `menuGroup` from that project's `client/src/GeneralLayout.jsx` `menuGroups` list, or it'll render as an ungrouped top-level item.
7. **Translations** — in `client/src/domainTranslations.js`, add under `resources`:
   ```js
   <name>: {
     name: '<Hebrew singular> |||| <Hebrew plural>',
     fields: { ...generalResourceFieldsTranslation, <field>: '<Hebrew label>', ... },
   },
   ```
   Always spread `generalResourceFieldsTranslation` first so common fields (`id`, `key`, `userId`, `createdAt`, `updatedAt`, `year`) get Hebrew for free.
8. **Permissions**, if this entity should be gated to certain users — see the `manage-permissions` skill in full (add a key, wire `crudAuth` server-side, gate the `<Resource>` client-side).
9. **Verify**: restart the project (`bash scripts/start-project.sh <project>`), log in, confirm the resource appears in the menu with Hebrew labels, and exercise Create/List/Edit. Optionally add `server/src/entity-modules/__tests__/<name>.config.spec.ts` asserting the config's `entity`/`query.join`/exporter — the established pattern for other entities.

## Steps: edit an existing entity (add/remove/rename a field)

1. **Add a column**: add the property + decorators to `server/src/db/entities/<Name>.entity.ts`, then run `npm run typeorm:generate -- src/migrations/Add<Field>To<Name>` from `server/` to generate the matching migration (don't hand-write the SQL). Add the field to `Datagrid`/`Inputs` in `client/src/entities/<name>.jsx`, and a translation key in `domainTranslations.js` under that resource's `fields` — a missing translation doesn't error, it just shows the raw field key in the UI.
2. **Remove a column**: reverse of the above — delete from the entity class, generate a migration (`DROP COLUMN`), remove the field from `Datagrid`/`Inputs` and from `exporter.getExportHeaders`/`importer.fields` if referenced, and drop the now-unused translation key.
3. **Rename a column**: TypeORM's diff will generate a `DROP`+`ADD` by default, which loses data — hand-edit the generated migration to use `RENAME COLUMN` (or `CHANGE`) instead, and update every reference to the old name across entity, config (`exporter`/`query.join`), client jsx, and translations.
4. Restart the project and verify the changed field on List, Create, and Edit screens.

## Reference example (`Klass` / `klass`)

- Migration: `server/src/migrations/1682968919553-addPageTable.ts` (different entity, but the canonical raw-SQL `up`/`down` shape)
- Entity: `server/src/db/entities/Klass.entity.ts` — full pattern (validation groups, `key`/`referenceId` FK resolution, indexes). `server/src/db/entities/KlassType.entity.ts` is the simpler version without the extra reference.
- Config: `server/src/entity-modules/klass.config.ts` — custom `KlassService` with `doAction`/`getReportData` overrides, `query.join`, `exporter`. `server/src/entity-modules/klass-type.config.ts` is the minimal version.
- Registration: `server/src/entities.module.ts` — `BaseEntityModule.register(klassConfig)` + `registerEntityNameMap({ klass: 'כיתות', ... })`
- Client: `client/src/entities/klass.jsx` — `Datagrid`/`Inputs`/`Representation`/`filters`/`importer`, ends with `getResourceComponents(entity)`
- App wiring: `client/src/App.jsx` — `<Resource name="klass" {...klass} options={{ menuGroup: 'data' }} icon={SupervisedUserCircleIcon} />`
- Translations: `client/src/domainTranslations.js` — `resources.klass`

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| New resource 404s on the client | `<Resource name="...">` doesn't match `snakeCase(<EntityClassName>)` from the server config |
| Server starts fine but the resource 500s on every request | Entity class exists but no migration was generated/applied — table doesn't exist yet (see `debug-project-issues` skill) |
| Field/resource shows the raw key (e.g. `klassTypeReferenceId`) instead of Hebrew | Missing entry under `resources.<name>.fields` (or `resources.<name>.name`) in `domainTranslations.js` — doesn't error, just falls back silently |
| New resource doesn't show in the sidebar menu | `options={{ menuGroup: '<group> }}` group name isn't in that project's `GeneralLayout.jsx` `menuGroups` — falls back to an ungrouped top-level item, not hidden |
| `typeorm:generate` produces `DROP COLUMN` + `ADD COLUMN` for what you meant as a rename | TypeORM diffs by column identity, not intent — hand-edit the migration to `RENAME COLUMN`/`CHANGE` to avoid a data loss on deploy |
| User-scoping (`userId` auto-filter) doesn't apply to the new entity | Forgot `implements IHasUserId` and/or the `userId` column — `BaseEntityService` checks for it by name |
| Changes made directly in `client/shared`/`server/shared` don't show up, or break other projects | Those are separate submodule repos — entity work belongs in `client/src`/`server/src` unless the entity is intentionally shared across all four apps |
