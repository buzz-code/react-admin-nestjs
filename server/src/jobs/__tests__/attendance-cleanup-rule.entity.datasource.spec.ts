import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';

// Unlike attendance-cleanup-rule.entity.spec.ts, getDataSource here is NOT mocked -
// this exercises the real TypeORM metadata build (against Jest's sqlite in-memory
// databaseConfig) so an entity closure that's missing a relation target (as happened
// in production - Klass#klassType) fails this test instead of only failing at runtime.
describe('AttendanceCleanupRule.fillFields (real DataSource)', () => {
  it('builds TypeORM metadata for the full entity set without throwing', async () => {
    const rule = new AttendanceCleanupRule();
    rule.userId = 1;

    await rule.fillFields();
  });
});
