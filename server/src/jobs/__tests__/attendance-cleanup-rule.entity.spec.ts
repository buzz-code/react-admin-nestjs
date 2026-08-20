const mockDestroy = jest.fn();
const mockGetRepository = jest.fn();

// Only getDataSource is mocked (to avoid a real DB connection); findOneAndAssignKey
// runs for real against the mocked dataSource, so this also covers the entity's
// wiring into that shared helper (itself separately unit-tested in nra-server).
jest.mock('@shared/utils/entity/foreignKey.util', () => ({
  ...jest.requireActual('@shared/utils/entity/foreignKey.util'),
  getDataSource: jest.fn().mockResolvedValue({
    getRepository: (...args: any[]) => mockGetRepository(...args),
    destroy: mockDestroy,
  }),
}));

import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';

describe('AttendanceCleanupRule.fillFields', () => {
  beforeEach(() => {
    mockGetRepository.mockReset();
    mockDestroy.mockReset();
  });

  it('resolves lessonId/klassId (the stable key) DOWN from the picked lessonReferenceId/klassReferenceId', async () => {
    mockGetRepository.mockImplementation((entity: any) => {
      if (entity.name === 'Lesson') return { findOne: jest.fn().mockResolvedValue({ key: 5 }) };
      if (entity.name === 'Klass') return { findOne: jest.fn().mockResolvedValue({ key: 3 }) };
      throw new Error(`unexpected repo for ${entity?.name}`);
    });

    const rule = new AttendanceCleanupRule();
    rule.userId = 1;
    rule.lessonReferenceId = 105;
    rule.klassReferenceId = 103;

    await rule.fillFields();

    expect(rule.lessonId).toBe(5);
    expect(rule.klassId).toBe(3);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('leaves lessonId/klassId unset when no reference was picked', async () => {
    mockGetRepository.mockImplementation(() => ({ findOne: jest.fn() }));

    const rule = new AttendanceCleanupRule();
    rule.userId = 1;

    await rule.fillFields();

    expect(rule.lessonId).toBeUndefined();
    expect(rule.klassId).toBeUndefined();
  });

  it('keeps the previous key when the picked reference no longer resolves', async () => {
    mockGetRepository.mockImplementation(() => ({ findOne: jest.fn().mockResolvedValue(undefined) }));

    const rule = new AttendanceCleanupRule();
    rule.userId = 1;
    rule.lessonReferenceId = 105;
    rule.lessonId = 9;

    await rule.fillFields();

    expect(rule.lessonId).toBe(9);
  });
});
