const mockDestroy = jest.fn();
const mockGetRepository = jest.fn();

// Only getDataSource is mocked (to avoid a real DB connection); IsUniqueCombination
// (key uniqueness during validation) and fillFields run for real against it.
jest.mock('@shared/utils/entity/foreignKey.util', () => ({
  ...jest.requireActual('@shared/utils/entity/foreignKey.util'),
  getDataSource: jest.fn().mockResolvedValue({
    getRepository: (...args: any[]) => mockGetRepository(...args),
    destroy: mockDestroy,
  }),
}));

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';

// A row exactly as the client parses it from the lessons bulk-upload Excel:
// numeric cells arrive as numbers, empty cells are omitted, dates as 'YYYY-MM-DD'.
const excelRow = {
  key: 71101,
  name: 'השקפה ואקטואליה כיתה י"ג1',
  klasses: 71100,
  teacherId: 21617840,
  startDate: '2026-09-01',
  endDate: '2027-08-31',
  displayName: 'השקפה ואקטואליה',
};

describe('Lesson bulk upload', () => {
  beforeEach(() => {
    mockGetRepository.mockReset();
    mockDestroy.mockReset();
  });

  it('transforms the numeric Excel teacherId into a digits string (IsDigitsOnly)', () => {
    const lesson = plainToInstance(Lesson, excelRow);
    expect(lesson.teacherId).toBe('21617840');
  });

  it('passes CREATE validation for a row parsed from the bulk-upload Excel', async () => {
    mockGetRepository.mockImplementation((entity: any) => {
      if (entity.name === 'Lesson') return { countBy: jest.fn().mockResolvedValue(0) };
      throw new Error(`unexpected repo for ${entity?.name}`);
    });

    const lesson = plainToInstance(Lesson, excelRow);
    const errors = await validate(lesson, { groups: [CrudValidationGroups.CREATE] });
    expect(errors).toEqual([]);
  });

  it('fillFields resolves klass/teacher references and defaults the year', async () => {
    mockGetRepository.mockImplementation((entity: any) => {
      if (entity.name === 'Klass') return { find: jest.fn().mockResolvedValue([{ id: 55 }]) };
      if (entity.name === 'Teacher') return { findOne: jest.fn().mockResolvedValue({ id: 77 }) };
      throw new Error(`unexpected repo for ${entity?.name}`);
    });

    const lesson = plainToInstance(Lesson, excelRow) as Lesson;
    await lesson.fillFields();

    expect(lesson.klassReferenceIds).toEqual([55]);
    expect(lesson.teacherReferenceId).toBe(77);
    expect(lesson.year).toBe(getCurrentHebrewYear());
    expect(lesson.startDate).toEqual(new Date('2026-09-01'));
  });
});