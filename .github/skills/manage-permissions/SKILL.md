---
name: manage-permissions
description: Use when adding a new permission, or changing who can see/do something (a resource, menu item, field, or action), in any NRA project.
---

# Skill: Manage Permissions

> **Use this skill when:** adding a new permission key, or restricting/exposing a resource, menu item, field, or action to certain users.

---

## Context

There is **no role table and no server-side `@Roles()` guard**. Every NRA project uses the same model: each `User` row has a free-form JSON `permissions` column (e.g. `{ admin: true, showUsersData: true, teacherView: true }`). "Admin" is just the key `admin: true` — not a separate tier. Both sides check permissions with small helper functions rather than a central role→resource table.

Permission **keys** come in two tiers, mirroring the shared/local split used for bulk actions:
- **Shared keys** — used by resources/features common to all four apps (user management, pages, payment tracks). Defined identically in `client/shared/config/permissionsConfig.js` and `server/shared/utils/permissionsUtil.ts` (`admin`, `manager`, `showUsersData`, `editPagesData`, `editPaymentTracksData`, `genericImageUpload`, `uploadedFiles`, `phoneCampaign`). Keep both files in sync — they must use the exact same key names.
- **Project-local keys** — specific to one app's domain (e.g. `teacherView`, `lessonSignature`). Defined client-side in that project's `client/src/utils/appPermissions.js`; there's no equivalent server-side file — server code just checks the string literal directly (`hasPermission(auth, 'lessonSignature')`). Keys can be dotted for nested checks (e.g. `inLessonReport.withLate`).

Enforcement is split by side:
- **Server**: `JwtAuthGuard` (`server/shared/auth/jwt-auth.guard.ts`) only checks the JWT is valid — it does not check permissions. Actual permission enforcement is a **data filter**, not a route guard, via `@dataui/crud`'s `CrudAuth`: `server/shared/auth/crud-auth.filter.ts` exposes `CrudAuthFilter` (default: admin sees everything, others see only their own rows) and `CrudAuthWithPermissionsFilter(fn)` (admin, or `fn(permissions)` truthy, sees everything; otherwise sees **no rows** — lacking a permission returns an empty list, not a 403). `server/shared/base-entity/base-entity.module.ts` wires `@CrudAuth(options.crudAuth ?? CrudAuthFilter)` onto every entity automatically.
- **Client**: `authProvider.getPermissions()` (`client/shared/providers/authProvider.js`) returns the user's `permissions` object, which react-admin injects as the `permissions` argument into the render-prop function passed to `<Admin>` in that project's `client/src/App.jsx`. `CommonEntity.jsx` (the factory most entity files use) also auto-injects an `isAdmin` prop into the entity's `Datagrid`/inputs, so field-level gating in entity files is usually just `{isAdmin && <TextField .../>}`. `Menu.jsx` filters menu items the same way.

## Building blocks

| File | Layer | Purpose |
|---|---|---|
| `server/shared/utils/permissionsUtil.ts` | server, shared | `permissionKeys` map, `hasPermission(auth, key)` (dotted keys), `isAdmin(auth)` |
| `server/shared/auth/crud-auth.filter.ts` | server, shared | `CrudAuthFilter`, `CrudAuthWithPermissionsFilter(fn)` — the actual enforcement |
| `server/shared/base-entity/base-entity.module.ts` | server, shared | Applies `crudAuth` to every entity's controller automatically |
| `server/src/entity-modules/*.config.ts` | server, project-local | Sets a specific entity's `crudAuth`, or calls `hasPermission`/`isAdmin` inline for finer checks |
| `client/shared/config/permissionsConfig.js` | client, shared | Shared `permissionKeys` |
| `client/shared/utils/permissionsUtil.js` | client, shared | `useHasPermission(key)`, `useIsAdmin()`, and derived helpers (`isManager`, `isShowUsersData`, ...) |
| `client/src/utils/appPermissions.js` | client, project-local | Project-specific keys + matching `isX`/`useIsX` helpers |
| `client/src/App.jsx` | client, project-local | Top-level `(permissions) => <Resource>...` tree — gates whole resources |
| `client/shared/components/layout/Menu.jsx` | client, shared | Filters menu items by `{ isAdmin, permissions }` |
| `client/shared/components/common-entities/user.jsx` | client, shared | The "role editor" — a `BooleanInput` checkbox per permission key on the User edit screen |

## Steps: add a new permission

0. **Decide scope**: does this gate something used by all four apps (shared), or only this app's own feature (project-local)? Default to project-local; only touch the shared files if the resource/feature itself is shared.
1. **Define the key**:
   - Shared: add the key to `permissionKeys` in **both** `client/shared/config/permissionsConfig.js` and `server/shared/utils/permissionsUtil.ts`, with the exact same name.
   - Project-local: add the key to `client/src/utils/appPermissions.js` only. Server code references it as a plain string via `hasPermission(auth, 'yourKey')` — no server file to add it to.
2. **Add a helper** (optional, but matches existing style): next to the key, add `isYourKey`/`useIsYourKey` in the same file as step 1.
3. **Wire enforcement**:
   - Server, whole-resource: set `crudAuth: CrudAuthWithPermissionsFilter(permissions => permissions.yourKey)` in the entity's `*.config.ts`.
   - Server, finer-grained: call `hasPermission(req.auth, 'yourKey')` or `isAdmin(req.auth)` inside the service/controller logic (e.g. inside a `doAction` case — see `add-bulk-action` skill).
   - Client, whole-resource: gate the `<Resource>` in `client/src/App.jsx` on the permission.
   - Client, field/section: use the hook from step 2 inside the entity file (`client/src/entities/<entity>.jsx`), or the auto-injected `isAdmin` prop from `CommonEntity.jsx` if it's an admin-only check.
   - Menu items for a gated resource update automatically via `Menu.jsx` — no extra wiring needed unless it's a custom (non-resource) menu entry.
4. **Make it assignable**: add a `<BooleanInput source="permissions.yourKey">` to the checkbox list in `client/shared/components/common-entities/user.jsx` so an admin can grant it from the User edit screen.
5. **Verify**: restart the project, log in as admin, toggle the new checkbox on a test user, then log in as that user and confirm the resource/field/menu item appears or disappears as expected.

## Reference examples

- Shared, whole-resource: `showUsersData` gates the `user` and `payment_track` resources — see `client/shared/components/app/CommonAdminResources.jsx` and `server/shared/entities/configs/user.config.ts` (`crudAuth: CrudAuthWithPermissionsFilter(permissions => permissions.showUsersData)`).
- Project-local, fine-grained: `lessonSignature` controls a single field, not a whole resource — see `shouldShowTopic` in `server/src/entity-modules/att-report.config.ts` (`isAdmin(req.auth) || hasPermission(req.auth, 'lessonSignature')`) and the matching `useIsLessonSignature` check in `client/src/entities/att-report.jsx`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Toggled the checkbox but the user still can't/can see the resource | Permissions are cached client-side from `getIdentity()`/the JWT payload — the user needs to log out and back in |
| Resource returns an empty list instead of an error for a user lacking permission | Expected — `CrudAuthWithPermissionsFilter` denies via `NO_DATA_FILTER` (empty result), not a 403 |
| New checkbox doesn't appear on the User edit screen | Forgot to add the `BooleanInput` in `client/shared/components/common-entities/user.jsx` |
| Shared key works on the client but not the server (or vice versa) | Key name mismatch — `permissionKeys` must be spelled identically in `client/shared/config/permissionsConfig.js` and `server/shared/utils/permissionsUtil.ts` |
