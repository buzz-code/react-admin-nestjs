import { StudentKlassReport } from 'src/db/view-entities/StudentKlassReport.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../student-klass-report.config';

createEntityConfigTests('StudentKlassReportConfig', config, {
  entity: StudentKlassReport,
  expectedJoins: {
    student: { eager: false },
  },
  expectedExportJoins: {
    student: { eager: true },
  },
  expectedExportHeaders: {
    count: 10,
    first: { value: 'student.tz', label: 'תז' },
  },
});

jest.mock('src/reports/reportGenerator');

describe('StudentKlassReportService getReportData', () => {
  it('passes only the student ids the caller can access', async () => {
    const { generateStudentReportCard } = jest.requireMock('src/reports/reportGenerator');
    const Service = config.service as any;
    const service = new Service(
      {
        manager: { connection: { options: { type: 'mysql' } } },
        metadata: { columns: [], relations: [], connection: { options: { type: 'mysql' } } },
      },
      {},
    );
    service.getSelectedIds = jest.fn().mockResolvedValue([1]);
    const req = { auth: { id: 7 }, parsed: { extra: { report: 'studentReportCardReact', ids: '1,99' } } };

    await service.getReportData(req);

    expect(service.getSelectedIds).toHaveBeenCalledWith(req);
    expect(generateStudentReportCard).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ ids: '1' }),
      expect.anything(),
    );
  });
});
