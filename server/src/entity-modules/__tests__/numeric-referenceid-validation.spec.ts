import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { Grade } from 'src/db/entities/Grade.entity';
import { Student } from 'src/db/entities/Student.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { LessonSchedule } from 'src/db/entities/LessonSchedule.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { KlassType } from 'src/db/entities/KlassType.entity';

/**
 * Mirrors the CRUD validation pipeline (@dataui/crud ValidationPipe +
 * validateBulk): plainToInstance applies the @Transform/@NumberType
 * coercion, class-validator then runs with the CREATE/UPDATE group.
 */
const validateAs = async (entity: any, body: any, group: CrudValidationGroups): Promise<ValidationError[]> => {
  const instance = plainToInstance(entity, body);
  return validate(instance, { groups: [group] });
};

const errorProps = (errors: ValidationError[]): string[] => errors.map((e) => e.property);

const errorsOnField = (errors: ValidationError[], field: string): boolean =>
  errors.some((e) => e.property === field && Boolean(e.constraints));

/**
 * Every numeric ReferenceId/int column that previously let a non-numeric
 * string through class-validator and crash at the MySQL INT column
 * (extension of PR #186 / PR #188 to the remaining entities).
 */
const numericFields: Array<{ entity: any; field: string }> = [
  { entity: Grade, field: 'studentReferenceId' },
  { entity: Grade, field: 'teacherReferenceId' },
  { entity: Grade, field: 'klassReferenceId' },
  { entity: Grade, field: 'lessonReferenceId' },
  { entity: Grade, field: 'reportGroupSessionId' },
  { entity: AttReport, field: 'reportGroupSessionId' },
  { entity: AttendanceCleanupRule, field: 'lessonReferenceId' },
  { entity: AttendanceCleanupRule, field: 'klassReferenceId' },
  { entity: StudentKlass, field: 'studentReferenceId' },
  { entity: StudentKlass, field: 'klassReferenceId' },
  { entity: KnownAbsence, field: 'studentReferenceId' },
  { entity: KnownAbsence, field: 'lessonReferenceId' },
  { entity: Lesson, field: 'teacherReferenceId' },
  { entity: LessonSchedule, field: 'teacherReferenceId' },
  { entity: Klass, field: 'teacherReferenceId' },
  { entity: KlassType, field: 'teacherReferenceId' },
  { entity: Student, field: 'year' },
];

describe('numeric validation on ReferenceId/int columns', () => {
  describe.each(numericFields)('$entity.name.$field', ({ entity, field }) => {
    it('rejects a non-numeric string on create', async () => {
      const errors = await validateAs(entity, { [field]: 'not-a-number' }, CrudValidationGroups.CREATE);
      expect(errorsOnField(errors, field)).toBe(true);
    });

    it('rejects a non-numeric string on update', async () => {
      const errors = await validateAs(entity, { [field]: 'not-a-number' }, CrudValidationGroups.UPDATE);
      expect(errorsOnField(errors, field)).toBe(true);
    });

    it('accepts a valid integer on create and update', async () => {
      const createErrors = await validateAs(entity, { [field]: 42 }, CrudValidationGroups.CREATE);
      expect(errorsOnField(createErrors, field)).toBe(false);
      const updateErrors = await validateAs(entity, { [field]: 42 }, CrudValidationGroups.UPDATE);
      expect(errorsOnField(updateErrors, field)).toBe(false);
    });

    it('accepts a numeric string (coerced by NumberType) on create', async () => {
      const errors = await validateAs(entity, { [field]: '42' }, CrudValidationGroups.CREATE);
      expect(errorsOnField(errors, field)).toBe(false);
    });

    it('passes on a partial update that omits the field', async () => {
      const errors = await validateAs(entity, {}, CrudValidationGroups.UPDATE);
      expect(errorsOnField(errors, field)).toBe(false);
    });
  });

  describe('Grade create with only valid integers', () => {
    it('passes validation cleanly', async () => {
      const body = {
        userId: 1,
        reportDate: '2026-09-09',
        studentReferenceId: 5,
        teacherReferenceId: 6,
        klassReferenceId: 7,
        lessonReferenceId: 8,
        reportGroupSessionId: 9,
        grade: 90,
      };
      const errors = await validateAs(Grade, body, CrudValidationGroups.CREATE);
      expect(errorProps(errors)).toEqual([]);
    });
  });

  describe('Student create', () => {
    it('passes without year (year stays optional)', async () => {
      const body = { userId: 1, tz: '1234567890', name: 'test' };
      const errors = await validateAs(Student, body, CrudValidationGroups.CREATE);
      expect(errorProps(errors)).toEqual([]);
    });

    it('passes with a valid year integer', async () => {
      const body = { userId: 1, tz: '1234567890', name: 'test', year: 2026 };
      const errors = await validateAs(Student, body, CrudValidationGroups.CREATE);
      expect(errorProps(errors)).toEqual([]);
    });

    it('rejects a non-numeric year', async () => {
      const body = { userId: 1, tz: '1234567890', name: 'test', year: 'not-a-number' };
      const errors = await validateAs(Student, body, CrudValidationGroups.CREATE);
      expect(errorProps(errors)).toEqual(['year']);
    });
  });

  describe('sibling-bypass regression: referenceId validated whenever present', () => {
    it('Grade: rejects garbage studentReferenceId even when studentTz is also supplied', async () => {
      const body = { studentTz: '1234567890', studentReferenceId: 'garbage', reportDate: '2026-09-16' };
      const errors = await validateAs(Grade, body, CrudValidationGroups.CREATE);
      expect(errorsOnField(errors, 'studentReferenceId')).toBe(true);
    });

    it('AttReport: rejects garbage studentReferenceId even when studentTz is also supplied', async () => {
      const body = { studentTz: '1234567890', studentReferenceId: 'garbage', reportDate: '2026-09-16' };
      const errors = await validateAs(AttReport, body, CrudValidationGroups.CREATE);
      expect(errorsOnField(errors, 'studentReferenceId')).toBe(true);
    });
  });
});
