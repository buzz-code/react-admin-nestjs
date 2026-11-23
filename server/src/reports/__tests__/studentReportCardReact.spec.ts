import { DataSource } from 'typeorm';
import { Student } from 'src/db/entities/Student.entity';
import { getReportData } from '../studentReportCardReact';

describe('studentReportCardReact getReportData', () => {
  it('scopes the student lookup to the caller and returns null when not found', async () => {
    const repos = new Map<any, any>();
    const getRepository = jest.fn((entity) => {
      if (!repos.has(entity)) {
        repos.set(entity, {
          findOneBy: jest.fn().mockResolvedValue(null),
          find: jest.fn().mockResolvedValue([]),
          findBy: jest.fn().mockResolvedValue([]),
        });
      }
      return repos.get(entity);
    });
    const dataSource = { getRepository } as unknown as DataSource;

    const result = await getReportData({ userId: 1, studentId: 99, year: 5785 } as any, dataSource);

    expect(result).toBeNull();
    expect(repos.get(Student).findOneBy).toHaveBeenCalledWith({ id: 99, userId: 1 });
  });
});
