---
name: write-tests
description: Use when writing or fixing a unit test in any NRA project or shared repo, or when you need to run code/UI without a live backend — i.e. "mock the backend", "mock the dataProvider", "test this entity/config", "why won't this test render". Covers the client (Jest + jsdom, react-admin mocked) and server (Jest + ts-jest, TypeORM repo mocked) mock patterns so you don't re-derive them each time.
---

# Skill: Write Tests / Mock the Backend

> **Use this skill when:** adding or fixing a unit test, or exercising a component/config without a running server. Both sides mock their dependencies — there is no live DB or HTTP in unit tests.

---

## Where tests live & how to run

```bash
cd <project>/client && yarn test    # Jest + jsdom  (*.test.jsx / *.test.js)
cd <project>/server && yarn test    # Jest + ts-jest (*.spec.ts)
```

Or, no-Docker, from the workspace root:

```bash
bash scripts/run-client-tests.sh
bash scripts/run-server-tests.sh    # run bash setup-node-modules.sh first if modules missing
```

Tests colocate under `__tests__/` next to the code. Shared code is tested in its own repo (`nra-client`, `nra-server`), consumers test only their own project code.

---

## Client: mock react-admin + `@shared`, don't hit a backend

An entity file (`client/src/entities/<name>.jsx`) pulls in react-admin and heavy `@shared` components. Unit tests **stub those out** with `jest.mock` so the test renders in jsdom with no data provider and asserts on wiring (which fields, which resource, which props), not on real data flow.

Pattern (from `nra-client` `CommonEntity.test.jsx`):

```jsx
import { render, screen } from '@testing-library/react';

// Replace react-admin hooks with fixed return values
jest.mock('react-admin', () => ({
    usePermissions: () => ({ permissions: {} }),
    useResourceContext: () => 'payment_track',
}));

// Stub shared components to trivial DOM so you can assert props
jest.mock('@shared/components/crudContainers/CommonList', () => ({
    CommonList: ({ children }) => <div data-testid="common-list">{children}</div>,
}));

// require AFTER the mocks are declared
const { getResourceComponents } = require('../CommonEntity');
```

Rules:
- Declare every `jest.mock` **before** `require`-ing the unit under test (or use `import` knowing jest hoists `jest.mock`).
- Stub each `@shared/...` import the file uses — an unmocked shared component drags in the whole react-admin runtime and the test fails to render.
- Assert on **wiring**: `data-testid`, `data-resource`, presence of a field/button — not on fetched data.
- **Mock the dataProvider** only when the component calls it: `const dataProvider = { getList: jest.fn().mockResolvedValue({ data: [], total: 0 }), update: jest.fn() }` and pass it via react-admin's context/`AdminContext`. Most entity tests don't need this — they never fetch.

## Server: mock the TypeORM repository / DataSource

Entity-module config tests (`server/src/entity-modules/__tests__/<name>.config.spec.ts`) verify query builders, hooks, and report generators **without a database**. Mock the repo/`DataSource`; never connect to MySQL in a unit test (that's what `generate-migration`'s live-DB flow is for).

Pattern:

```ts
const mockRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQb),
    metadata: { columns: [], relations: [] },
};
const mockDataSource = { getRepository: jest.fn(() => mockRepo) } as any;
```

- Report generators are testable directly — construct with a fake data fn, e.g. `new ParamsToJsonReportGenerator(() => 'test')`, and assert `getFileBuffer(...)` output (see `report-generation` skill).
- For NestJS providers use `Test.createTestingModule({...}).overrideProvider(getRepositoryToken(Entity)).useValue(mockRepo)`.
- Yemot handlers have their own scenario harness — use the `yemot-integration` skill, not hand-rolled mocks.

## Success criteria

- New behavior → a test that fails before the change and passes after.
- `yarn test` green on both sides you touched.
- No test opens a socket, DB connection, or real HTTP — if it does, mock it.
