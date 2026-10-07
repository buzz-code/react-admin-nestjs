---
name: report-generation
description: Use when adding or changing a downloadable/exported file in any NRA project — a generic list export (Excel/PDF/JSON of the current grid), or a custom named report (a report card, bulk PDF, ZIP, or audio file triggered by a button) — or when fixing report fonts/headers. Covers the shared BaseReportGenerator family in server/shared (nra-server) utils/report and how a project wires a brand-new report type end to end.
---

# Skill: Add or Change a Report / Export

> **Use this skill when:** an entity needs a new export or report file, or you're modifying how one is produced (columns, layout, fonts, format). All report types derive from one shared base in `server/shared/utils/report/` (`nra-server`).

There are **two distinct mechanisms** — pick the right one before writing code:

| | Generic list export | Custom named report |
|---|---|---|
| What | Export the current grid's rows/columns as-is | A purpose-built file (report card, filtered bulk PDF, audio, ZIP) with its own params |
| Trigger | The entity's built-in `<ResourceExportButton>` (shown unless `exporter: false`) | A `<BulkReportButton>` you add explicitly |
| Server config | `exporter: { getExportHeaders, processReqForExport }` in the entity config | `reportsDict` + `getReportData()` override on the entity's `Service` class |
| Formats available | Excel / PDF / Json (via `getExportedFile`) | Any `CommonFileFormat` — Excel/Pdf/Json/Zip/Html/Mp3/Wav |

---

## The generator model (shared by both mechanisms)

`BaseReportGenerator<T, U>` (`report.generators.ts`) has two jobs:

```ts
new SomeReportGenerator(
    getReportName: (data: U) => string,       // filename (no extension)
    getReportData?: (params: T, ds: DataSource) => Promise<U>,   // fetch/shape data
)
```

- `getReportData` fetches/shapes rows from the `DataSource`. Omit it and params pass through unchanged.
- each concrete generator implements `getFileBuffer(data): Promise<Buffer>` — you rarely touch this; you pick a generator and supply the two functions above.
- `fileFormat: CommonFileFormat` (`types.ts`) drives extension/MIME: `Excel, Pdf, Json, Zip, Html, Mp3, Wav`.

### Pick a generator (all in `utils/report/`)

| Need | Generator |
|---|---|
| Excel spreadsheet | `DataToExcelReportGenerator` / `GenericDataToExcelReportGenerator` |
| Single PDF from HTML markup | `MarkupToPdfReportGenerator` / `SimpleMarkupToPdfReportGenerator` |
| PDF from an EJS template | `EjsToPdfReportGenerator` |
| PDF from a React component | `ReactToPdfReportGenerator` |
| Many records → one merged PDF | `BulkToPdfReportGenerator` |
| Many files → one ZIP | `BulkToZipReportGenerator` |
| Audio file | `BufferToAudioReportGenerator` (set format Mp3/Wav) |
| Raw JSON (debugging/params echo) | `ParamsToJsonReportGenerator` |

Excel helpers: `getIntegerDataValidation`, `getDateDataValidation` for cell validation. Only write a **new** generator subclass if none of these fit the output shape — that's a shared-repo change (see "Shared vs project" below).

---

## A. Generic list export (Excel/PDF/Json of the grid as shown)

Already wired for every entity by default. To customize headers/columns, add to the entity config in `server/src/entity-modules/<name>.config.ts`:

```ts
exporter: {
    processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = { student: { eager: true }, klass: { eager: true } };  // eager-load what headers need
        return innerFunc(req);
    },
    getExportHeaders(): IHeader[] {
        return [
            { value: 'student.tz', label: 'תז' },
            { value: 'student.name', label: 'שם התלמידה' },
        ];
    },
},
```

Set `exporter: false` to hide the export button entirely. Nothing needed client-side — `ResourceExportButton` (in `CommonListActions.jsx`) is automatic.

## B. Custom named report (the common "add a new report type" case)

Use this when the export isn't just the grid — it needs its own params (date range, filters), a specific layout, or a non-Excel format.

### 1. Server: add the generator + route it in `getReportData`

In `server/src/entity-modules/<name>.config.ts`, override `getReportData` on the entity's `Service` class:

```ts
class StudentKlassService<T extends Entity | StudentKlass> extends BaseEntityService<T> {
  reportsDict = {
    studentReportCard: new BulkToPdfReportGenerator(studentReportCard),   // studentReportCard = a template/render function, see step 2
  };

  async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
    if (req.parsed.extra.report in this.reportsDict) {
      const generator = this.reportsDict[req.parsed.extra.report];
      const ids = getAsNumberArray(req.parsed.extra.ids);
      // ...load/shape whatever this report needs from `ids` and other req.parsed.extra params...
      return { generator, params: /* whatever getReportData on the generator expects */ };
    }
    return super.getReportData(req);   // falls through to the generic exporter-as-JSON default
  }
}
```

The dict key (`studentReportCard`) is the **report name** — it must match the client button's `name` prop exactly (see step 3). `req.parsed.extra` carries whatever query params the client sent (`ids`, plus any form fields from the button's dialog).

### 2. Server: write the template/content function

For PDF generators this is usually a separate file, e.g. `server/src/reports/studentReportCard.tsx`, exporting the React component or EJS/markup that `BulkToPdfReportGenerator`/`ReactToPdfReportGenerator` renders per record. Keep this project-local — it's specific data/layout, not shared plumbing.

For Excel/Zip/audio, the equivalent is whatever `getReportData` function you pass into the generator's constructor, shaping the data into what `getFileBuffer` expects.

### 3. Client: add the trigger button

This half — the `<BulkReportButton name="studentReportCard" .../>` on the entity's list, with its param-collection dialog — is bulk-action wiring. Follow the **`add-bulk-action`** skill's `BulkReportButton` section; the `name` prop there must equal the `reportsDict` key from step 1.

### 4. Wire the route

Nothing extra to add — `BaseEntityController.getReportData` already calls `service.getReportData(req)` → `generateCommonFileResponse(generator, params, dataSource)` for every entity. Steps 1–3 are the only wiring needed.

---

## Fonts & assets (PDF)

PDF generators embed fonts. History: fonts were self-hosted, then reverted to Google Fonts with a 10s timeout + fallback. When touching report styling, don't reintroduce a hard dependency on a font fetch without a fallback — a slow/blocked font host must not hang report generation. Repeating page images (report-card header/footer on every page) use the shared `RepeatingPageImage` component — reuse it, don't re-solve per project.

## Shared vs project

A generic new generator/format, or a change to `BaseReportGenerator`/`report.util.ts`, belongs in `nra-server` (`utils/report/`) — that's a shared change: use the `shared-changes-workflow` skill and record a `CONSUMER_CHANGES.md` row if apps must wire it in. A report that's specific to one project's data (a particular report card, a particular Excel layout, its `reportsDict` entry) stays in that project's `entity-modules/` and `reports/` — using the shared generators, not duplicating them.

## Test it

Generators are unit-testable with no DB — construct with a fake data fn and assert `getFileBuffer`. See `write-tests`. Example: `new ParamsToJsonReportGenerator(() => 'test')`.
