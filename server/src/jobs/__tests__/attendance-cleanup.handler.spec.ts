import { Job } from '@shared/entities/Job.entity';
import { getDataSource } from '@shared/utils/entity/foreignKey.util';
import { AttendanceCleanupHandler } from '../attendance-cleanup.handler';

jest.mock('@shared/utils/entity/foreignKey.util');

describe('AttendanceCleanupHandler', () => {
  const handler = new AttendanceCleanupHandler();
  let deleteMock: jest.Mock;
  let destroyMock: jest.Mock;

  beforeEach(() => {
    deleteMock = jest.fn().mockResolvedValue({ affected: 3 });
    destroyMock = jest.fn().mockResolvedValue(undefined);
    (getDataSource as jest.Mock).mockResolvedValue({
      getRepository: () => ({ delete: deleteMock }),
      destroy: destroyMock,
    });
  });

  it('throws when the payload is missing required fields', async () => {
    const job = { userId: 1, payload: { lessonReferenceId: 2 } } as unknown as Job;
    await expect(handler.handle(job)).rejects.toThrow(/klassReferenceId/);
  });

  it('throws when targetWeekday is out of range', async () => {
    const job = { userId: 1, payload: { klassReferenceId: 1, lessonReferenceId: 2, targetWeekday: 9 } } as unknown as Job;
    await expect(handler.handle(job)).rejects.toThrow(/0-6/);
  });

  it('deletes attendance outside the kept klass for the requested lesson/dates and reports the count', async () => {
    const job = {
      userId: 1,
      payload: { klassReferenceId: 10, lessonReferenceId: 20, targetWeekday: 4, lookbackWeeks: 2 },
    } as unknown as Job;

    const result = await handler.handle(job);

    expect(deleteMock).toHaveBeenCalledTimes(1);
    const criteria = deleteMock.mock.calls[0][0];
    expect(criteria.userId).toBe(1);
    expect(criteria.lessonReferenceId).toBe(20);
    expect(criteria.klassReferenceId.type).toBe('not');
    expect(criteria.klassReferenceId.value).toBe(10);
    expect(criteria.reportDate.value).toHaveLength(2);
    expect(destroyMock).toHaveBeenCalled();
    expect(result.deleted).toBe(3);
    expect(result.summary).toContain('3');
  });

  it('clamps lookbackWeeks to at least 1 and caps runaway values', async () => {
    const job = {
      userId: 1,
      payload: { klassReferenceId: 10, lessonReferenceId: 20, targetWeekday: 0, lookbackWeeks: 999 },
    } as unknown as Job;

    await handler.handle(job);

    const criteria = deleteMock.mock.calls[0][0];
    expect(criteria.reportDate.value).toHaveLength(52);
  });
});
