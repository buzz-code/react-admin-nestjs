import { Student } from 'src/db/entities/Student.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { buildKnownAbsences, findAbsencesByStudentDates, toDateStr } from '../approveAbsencesByStudentDates.util';

function makeDataSource({ student = null, klass = null, reports = [], approved = [] }: any) {
  const repos = new Map<any, any>([
    [Student, { findOne: jest.fn().mockResolvedValue(student) }],
    [Klass, { findOne: jest.fn().mockResolvedValue(klass) }],
    [AttReport, { find: jest.fn().mockResolvedValue(reports) }],
    [KnownAbsence, { find: jest.fn().mockResolvedValue(approved) }],
  ]);
  return { dataSource: { getRepository: (entity: any) => repos.get(entity) } as any, repos };
}

const student = { id: 7, userId: 3, name: 'רחל' };

describe('toDateStr', () => {
  it('keeps YYYY-MM-DD and normalizes dates', () => {
    expect(toDateStr('2026-10-18')).toBe('2026-10-18');
    expect(toDateStr(new Date(2026, 9, 18))).toBe('2026-10-18');
    expect(toDateStr('not a date')).toBeNull();
    expect(toDateStr(undefined)).toBeNull();
  });
});

describe('findAbsencesByStudentDates', () => {
  it('returns the student absences in range, skipping already approved lesson+date', async () => {
    const reports = [
      { id: 1, userId: 3, studentReferenceId: 7, lessonReferenceId: 10, reportDate: '2026-10-18', absCount: 1 },
      { id: 2, userId: 3, studentReferenceId: 7, lessonReferenceId: 11, reportDate: '2026-10-18', absCount: 2 },
    ];
    const approved = [{ lessonReferenceId: 10, reportDate: '2026-10-18' }];
    const { dataSource, repos } = makeDataSource({ student, reports, approved });

    const [result] = await findAbsencesByStudentDates(dataSource, 3, [{ studentTz: 12345678, fromDate: '2026-10-18' }]);

    expect(result.error).toBeUndefined();
    expect(result.studentName).toBe('רחל');
    expect(result.reports.map((r) => r.id)).toEqual([2]);
    expect(result.alreadyApprovedCount).toBe(1);
    const studentWhere = repos.get(Student).findOne.mock.calls[0][0].where;
    expect(studentWhere.userId).toBe(3);
    expect(studentWhere.tz.value).toEqual(['12345678', '012345678']);
    expect(repos.get(Klass).findOne).not.toHaveBeenCalled();
  });

  it('filters by klass when given', async () => {
    const { dataSource, repos } = makeDataSource({ student, klass: { id: 20, name: 'י1' } });

    const [result] = await findAbsencesByStudentDates(dataSource, 3, [
      { studentReferenceId: 7, klassId: '5', fromDate: '2026-10-18', toDate: '2026-10-20' },
    ]);

    expect(result.klassName).toBe('י1');
    expect(repos.get(AttReport).find.mock.calls[0][0].where.klassReferenceId).toBe(20);
    expect(result.error).toBe('לא נמצאו חיסורים בתאריכים אלו');
  });

  it('looks up the klass by id when klassReferenceId is given', async () => {
    const { dataSource, repos } = makeDataSource({ student, klass: { id: 21, name: 'י2' } });

    await findAbsencesByStudentDates(dataSource, 3, [
      { studentReferenceId: 7, klassReferenceId: 21, fromDate: '2026-10-18' },
    ]);

    expect(repos.get(Klass).findOne.mock.calls[0][0].where).toEqual({ userId: 3, id: 21 });
    expect(repos.get(AttReport).find.mock.calls[0][0].where.klassReferenceId).toBe(21);
  });

  it('reports row errors', async () => {
    const { dataSource } = makeDataSource({ student: null });
    const results = await findAbsencesByStudentDates(dataSource, 3, [
      { studentTz: '1', fromDate: '' },
      { studentTz: '1', fromDate: '2026-10-20', toDate: '2026-10-18' },
      { studentTz: '1', fromDate: '2026-10-18' },
    ]);
    expect(results.map((r) => r.error)).toEqual([
      'תאריך חסר או לא תקין',
      'תאריך הסיום לפני תאריך ההתחלה',
      'תלמידה לא נמצאה במערכת',
    ]);
  });

  it('errors when the klass is not found', async () => {
    const { dataSource } = makeDataSource({ student, klass: null });
    const [result] = await findAbsencesByStudentDates(dataSource, 3, [
      { studentReferenceId: 7, klassId: 99, fromDate: '2026-10-18' },
    ]);
    expect(result.error).toBe('כיתה לא נמצאה במערכת');
  });
});

describe('buildKnownAbsences', () => {
  it('creates one approved known absence per report', () => {
    const report = {
      userId: 3,
      studentReferenceId: 7,
      klassReferenceId: 20,
      lessonReferenceId: 10,
      reportDate: '2026-10-18',
      absCount: 2,
      year: 5787,
    } as any;
    const result = buildKnownAbsences(
      [{ index: 0, row: { fromDate: '2026-10-18' }, reports: [report], alreadyApprovedCount: 0 }],
      { reason: 'חתונת אח' },
    );
    expect(result).toEqual([
      {
        userId: 3,
        studentReferenceId: 7,
        klassReferenceId: 20,
        lessonReferenceId: 10,
        reportDate: '2026-10-18',
        absnceCount: 2,
        reason: 'חתונת אח',
        senderName: null,
        comment: null,
        isApproved: true,
        year: 5787,
      },
    ]);
  });
});
