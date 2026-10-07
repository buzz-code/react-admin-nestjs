---
name: find-missing-translations
description: Use when auditing an NRA project's client for untranslated fields, or when asked to "find missing translations", "check for untranslated fields", or after adding/editing entity filters and inputs in domainTranslations.js.
---

# Skill: Find (and Fix) Missing Translations

> **Use this skill when:** you need to check whether every field used by a project's entities has a Hebrew translation, or a user reports a raw English/camelCase field name showing up in the UI instead of Hebrew text.

---

## Context

React-Admin resolves every field/filter label via `resources.<resourceName>.fields.<source>` in `client/src/domainTranslations.js`. **A missing key never throws or fails a build** — react-admin just falls back to rendering the raw `source` string (e.g. `school:$cont` or `klassTypeReferenceId`) instead of Hebrew text. This only surfaces by eyeballing the UI, which is easy to miss — especially for filter fields, where the translation key must include any ReactAdmin operator suffix (`:$cont`, `:$gte`, `:$lte`, `:$isnull`, ...) verbatim, e.g. `'school:$cont': 'בית ספר'`, separately from the plain `school: 'בית ספר'` entry used by the column header.

`scripts/find-missing-translations.js` (in this repo) statically scans a project's `client/src/entities/*.jsx` files for every `source="..."` usage and cross-checks it against `domainTranslations.js`, skipping:
- fields that get `generalResourceFieldsTranslation`'s common keys (`id`, `key`, `name`, `userId`, `createdAt`, `updatedAt`, `year`, `name:$cont`, ...) for free
- fields with an explicit `label="..."` prop on the same tag (react-admin uses that literal string instead of doing a translation lookup)
- fields nested directly inside `<ReferenceField reference="...">...</ReferenceField>` (they render under the ReferenceField's own column header, not their own)

It is a heuristic, not a full JS/JSX parser — see Limitations below.

## Steps

### 1. Make sure `client/shared` is initialized

The script reads `client/shared/providers/i18nProvider.js` for `generalResourceFieldsTranslation`.

```bash
cd $WORKSPACES_ROOT/<project>
git submodule update --init client/shared
```

### 2. Run the scanner

```bash
node $WORKSPACES_ROOT/multi-repo-codespace/scripts/find-missing-translations.js $WORKSPACES_ROOT/<project>/client
```

Exit code is `0` when nothing is found, `1` when it reports findings — usable in a pre-commit check or CI step.

Output looks like:
```
Found 2 missing translation(s):

  [price] "code"  (src/entities/price.jsx)
  [price] "description"  (src/entities/price.jsx)
```

### 3. Verify each finding before fixing

The script can't see `label=` props that were written on a later line than the `source=` attribute in an unusual way, or dynamic `source={...}` expressions — read the flagged line yourself before editing. Genuine findings are usually one of:
- a `TextInput`/`SelectInput`/`ReferenceInputFilter` filter with an operator suffix (`:$cont`, `:$gte`, ...) and no `label=` prop
- a `TextField`/`NumberField`/... column in `Datagrid` with no `label=` prop and no matching `fields.<source>` entry
- a brand-new entity field added to `Datagrid`/`Inputs` without a matching `domainTranslations.js` entry

### 4. Fix by adding the missing key(s)

In `client/src/domainTranslations.js`, under `resources.<resourceName>.fields`, add the field using the **exact** `source` string reported (operator suffix included where present):

```js
teacher: {
    fields: {
        ...generalResourceFieldsTranslation,
        school: 'בית ספר',
        'school:$cont': 'בית ספר',   // filter variant needs its own key
    },
},
```

### 5. Re-run the scanner to confirm zero findings, then run the client test suite

```bash
node $WORKSPACES_ROOT/multi-repo-codespace/scripts/find-missing-translations.js $WORKSPACES_ROOT/<project>/client
cd $WORKSPACES_ROOT/<project>/client && yarn test
```

## Limitations

- Static regex/brace-depth parsing, not a real JS/JSX parser — dynamically constructed `source={someVar}` expressions aren't checked (can't be, statically).
- Only checks `client/src/entities/*.jsx` files wired into `App.jsx` via `<Resource name="x" {...importedVar} />` — custom pages/pivots (e.g. `src/pivots/*`) aren't scanned.
- Resources rendered via a shared helper (e.g. `{CommonPhoneResources({ permissions })}` rather than an explicit `<Resource {...x}>` import) are skipped — their translations live in `client/shared`, not the project's `domainTranslations.js`.
- A field can still look "translated" here but read oddly in the UI if the Hebrew string itself is wrong/inconsistent — this only proves a key *exists*, not that its value is correct.

## Reference

Found and fixed via this skill (2026-07-16, `teacher-report-nra`):
- `teacher.jsx`'s `school:$cont` filter had no translation key → showed literally as `school:$cont` in the "add filter" menu.
- `price.jsx`'s `code` and `description` fields (Datagrid columns, inputs, and the `code` filter) had no translation entries at all.
