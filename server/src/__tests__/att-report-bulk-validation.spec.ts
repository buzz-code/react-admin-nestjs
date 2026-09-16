import { validateBulk } from '@shared/base-entity/base-entity.util';
import { AttReport } from 'src/db/entities/AttReport.entity';

describe('AttReport bulk validation', () => {
  const REPORT_DATE = '2026-09-16';

  it('rejects non-numeric studentReferenceId even when studentTz is also supplied', async () => {
    await expect(
      validateBulk([{ studentTz: '1234567892', studentReferenceId: 'garbage', reportDate: REPORT_DATE }], AttReport),
    ).rejects.toThrow();
  });

  it('rejects non-numeric teacherReferenceId even when teacherId is also supplied', async () => {
    await expect(
      validateBulk([{ teacherId: '1234567892', teacherReferenceId: 'garbage', reportDate: REPORT_DATE }], AttReport),
    ).rejects.toThrow();
  });

  it('rejects non-numeric klassReferenceId even when klassId is also supplied', async () => {
    await expect(
      validateBulk([{ klassId: 7, klassReferenceId: 'garbage', reportDate: REPORT_DATE }], AttReport),
    ).rejects.toThrow();
  });

  it('rejects non-numeric lessonReferenceId even when lessonId is also supplied', async () => {
    await expect(
      validateBulk([{ lessonId: 7, lessonReferenceId: 'garbage', reportDate: REPORT_DATE }], AttReport),
    ).rejects.toThrow();
  });

  it('rejects non-numeric referenceIds when supplied without the tz/id sibling', async () => {
    await expect(
      validateBulk(
        [
          { studentReferenceId: 'כל', reportDate: REPORT_DATE },
          { klassReferenceId: 'not-a-number', reportDate: REPORT_DATE },
        ],
        AttReport,
      ),
    ).rejects.toThrow();
  });

  it('accepts valid numeric referenceIds, even alongside tz/id siblings', async () => {
    await expect(
      validateBulk(
        [
          {
            studentReferenceId: 123,
            teacherReferenceId: 456,
            klassReferenceId: 45,
            lessonReferenceId: 78,
            studentTz: '1234567892',
            teacherId: '1234567892',
            klassId: 7,
            lessonId: 8,
            reportDate: REPORT_DATE,
          },
        ],
        AttReport,
      ),
    ).resolves.toBeUndefined();
  });

  it('accepts tz/id-based payload without referenceIds', async () => {
    await expect(
      validateBulk(
        [{ studentTz: '1234567892', teacherId: '1234567892', klassId: 7, lessonId: 8, reportDate: REPORT_DATE }],
        AttReport,
      ),
    ).resolves.toBeUndefined();
  });
});
