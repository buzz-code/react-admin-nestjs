import { DataSource, In } from 'typeorm';
import { ReportGroupSession } from 'src/db/entities/ReportGroupSession.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Grade } from 'src/db/entities/Grade.entity';
import reportGroupSessionsSummary from '../reportGroupSessionsSummary';

describe('reportGroupSessionsSummary getReportData', () => {
  it('loads attendance and grades only for the sessions found for the caller', async () => {
    const sessionRepo = { find: jest.fn().mockResolvedValue([{ id: 1, sessionDate: '2024-01-01', reportGroup: {} }]) };
    const attRepo = { find: jest.fn().mockResolvedValue([]) };
    const gradeRepo = { find: jest.fn().mockResolvedValue([]) };
    const dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === ReportGroupSession) return sessionRepo;
        if (entity === AttReport) return attRepo;
        if (entity === Grade) return gradeRepo;
      }),
    } as unknown as DataSource;

    await reportGroupSessionsSummary.getReportData({ userId: 1, sessionIds: [1, 99] }, dataSource);

    expect(sessionRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { id: In([1, 99]), userId: 1 } }));
    expect(attRepo.find).toHaveBeenCalledWith({ where: { reportGroupSessionId: In([1]) } });
    expect(gradeRepo.find).toHaveBeenCalledWith({ where: { reportGroupSessionId: In([1]) } });
  });
});
