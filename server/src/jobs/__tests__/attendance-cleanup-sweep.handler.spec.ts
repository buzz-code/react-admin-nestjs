import { In, Not } from 'typeorm';
import { AttendanceCleanupSweepHandler, getTargetDates } from '../attendance-cleanup-sweep.handler';
import { Job } from '@shared/entities/Job.entity';

describe('getTargetDates', () => {
  it('returns today when today is the target weekday', () => {
    // 2026-08-22 is a Saturday (day 6)
    const now = new Date(2026, 7, 22);
    const dates = getTargetDates(6, 1, now);
    expect(dates).toHaveLength(1);
    expect(dates[0].toISOString().slice(0, 10)).toBe('2026-08-22');
  });

  it('walks back to the most recent occurrence of the weekday', () => {
    // 2026-08-22 is Saturday; the most recent Thursday (4) before/on it is 2026-08-20
    const now = new Date(2026, 7, 22);
    const dates = getTargetDates(4, 1, now);
    expect(dates[0].toISOString().slice(0, 10)).toBe('2026-08-20');
  });

  it('returns weeksBack dates, most recent first, 7 days apart', () => {
    const now = new Date(2026, 7, 22);
    const dates = getTargetDates(4, 3, now);
    expect(dates.map((d) => d.toISOString().slice(0, 10))).toEqual(['2026-08-20', '2026-08-13', '2026-08-06']);
  });
});

describe('AttendanceCleanupSweepHandler', () => {
  function makeDataSource(overrides: Partial<Record<string, any>> = {}) {
    const repos: Record<string, any> = {
      AttendanceCleanupRule: { find: jest.fn().mockResolvedValue([]) },
      Lesson: { findOne: jest.fn() },
      Klass: { findOne: jest.fn() },
      AttReport: { delete: jest.fn().mockResolvedValue({ affected: 0 }) },
      ...overrides,
    };
    return {
      getRepository: (entity: any) => repos[entity.name],
      repos,
    } as any;
  }

  it('returns zero-work summary when there are no active rules', async () => {
    const dataSource = makeDataSource();
    const handler = new AttendanceCleanupSweepHandler(dataSource);
    const result = await handler.handle({ userId: 1, payload: {} } as unknown as Job);
    expect(result.rulesProcessed).toBe(0);
    expect(result.totalDeleted).toBe(0);
  });

  it('scopes to payload.ruleIds when provided (run-now path)', async () => {
    const dataSource = makeDataSource();
    const handler = new AttendanceCleanupSweepHandler(dataSource);
    await handler.handle({ userId: 1, payload: { ruleIds: [5, 6] } } as unknown as Job);
    expect(dataSource.repos.AttendanceCleanupRule.find).toHaveBeenCalledWith({
      where: { userId: 1, id: In([5, 6]) },
    });
  });

  it('deletes att_reports for every klass except the preserved one, across weeksBack dates', async () => {
    const dataSource = makeDataSource({
      AttendanceCleanupRule: {
        find: jest.fn().mockResolvedValue([
          { id: 1, userId: 1, name: 'תפילה', lessonId: 5, klassId: 3, dayOfWeek: 4, weeksBack: 2, active: true },
        ]),
      },
      Lesson: { findOne: jest.fn().mockResolvedValue({ id: 105 }) },
      Klass: { findOne: jest.fn().mockResolvedValue({ id: 103 }) },
      AttReport: { delete: jest.fn().mockResolvedValue({ affected: 7 }) },
    });
    const handler = new AttendanceCleanupSweepHandler(dataSource);

    const result = await handler.handle({ userId: 1, payload: {} } as unknown as Job);

    expect(dataSource.repos.AttReport.delete).toHaveBeenCalledTimes(2); // weeksBack: 2
    const [firstCallArgs] = dataSource.repos.AttReport.delete.mock.calls[0];
    expect(firstCallArgs).toMatchObject({ userId: 1, lessonReferenceId: 105 });
    expect(firstCallArgs.klassReferenceId).toEqual(Not(103));
    expect(result.totalDeleted).toBe(14); // 7 + 7
    expect(result.rulesProcessed).toBe(1);
  });

  it('skips a date when the lesson or klass cannot be resolved for that year, without deleting', async () => {
    const dataSource = makeDataSource({
      AttendanceCleanupRule: {
        find: jest.fn().mockResolvedValue([
          { id: 2, userId: 1, name: null, lessonId: 5, klassId: 3, dayOfWeek: 4, weeksBack: 1, active: true },
        ]),
      },
      Lesson: { findOne: jest.fn().mockResolvedValue(undefined) },
      Klass: { findOne: jest.fn().mockResolvedValue(undefined) },
    });
    const handler = new AttendanceCleanupSweepHandler(dataSource);

    const result = await handler.handle({ userId: 1, payload: {} } as unknown as Job);

    expect(dataSource.repos.AttReport.delete).not.toHaveBeenCalled();
    expect(result.totalDeleted).toBe(0);
    expect(result.perRule[0]).toContain('דולג');
  });
});
