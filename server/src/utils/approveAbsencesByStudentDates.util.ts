import { Between, DataSource, In, MoreThan } from 'typeorm';
import { getHebrewYearByGregorianDate } from '@shared/utils/entity/year.util';
import { Student } from 'src/db/entities/Student.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';

export interface StudentDatesRow {
  studentTz?: string | number;
  studentReferenceId?: number;
  klassId?: string | number;
  klassReferenceId?: number;
  fromDate: string;
  toDate?: string;
}

export interface StudentDatesMatch {
  index: number;
  row: StudentDatesRow;
  studentName?: string;
  klassName?: string;
  reports: AttReport[];
  alreadyApprovedCount: number;
  error?: string;
}

export interface KnownAbsenceExtraFields {
  reason?: string;
  senderName?: string;
  comment?: string;
}

// Normalizes a date (Date, ISO string, 'YYYY-MM-DD' or Israeli 'DD/MM/YYYY') to 'YYYY-MM-DD', or null when invalid.
export function toDateStr(value: Date | string | undefined | null): string | null {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const dayFirst = typeof value === 'string' && value.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  const date = dayFirst ? new Date(Number(dayFirst[3]), Number(dayFirst[2]) - 1, Number(dayFirst[1])) : new Date(value);
  if (isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * For each row (student + date range, optional klass), finds the student's
 * att_reports with absences in that range, leaving out the ones that already
 * have an approved known absence for the same lesson and date.
 * userId undefined means admin: the student is looked up across all users.
 */
export async function findAbsencesByStudentDates(
  dataSource: DataSource,
  userId: number | undefined,
  rows: StudentDatesRow[],
): Promise<StudentDatesMatch[]> {
  const results: StudentDatesMatch[] = [];
  for (const [index, row] of rows.entries()) {
    results.push(await findRowAbsences(dataSource, userId, row, index));
  }
  return results;
}

async function findRowAbsences(
  dataSource: DataSource,
  userId: number | undefined,
  row: StudentDatesRow,
  index: number,
): Promise<StudentDatesMatch> {
  const result: StudentDatesMatch = { index, row, reports: [], alreadyApprovedCount: 0 };

  const fromDate = toDateStr(row.fromDate);
  const toDate = toDateStr(row.toDate) ?? fromDate;
  if (!fromDate || !toDate) {
    return { ...result, error: 'תאריך חסר או לא תקין' };
  }
  if (toDate < fromDate) {
    return { ...result, error: 'תאריך הסיום לפני תאריך ההתחלה' };
  }

  const student = await findStudent(dataSource, userId, row);
  if (!student) {
    return { ...result, error: 'תלמידה לא נמצאה במערכת' };
  }
  result.studentName = student.name;

  let klassReferenceId: number | undefined;
  const hasKlassKey = row.klassId !== undefined && row.klassId !== null && String(row.klassId).trim() !== '';
  if (row.klassReferenceId || hasKlassKey) {
    const klass = await dataSource.getRepository(Klass).findOne({
      where: row.klassReferenceId
        ? { userId: student.userId, id: Number(row.klassReferenceId) }
        : {
            userId: student.userId,
            key: Number(row.klassId),
            year: getHebrewYearByGregorianDate(new Date(fromDate)),
          },
    });
    if (!klass) {
      return { ...result, error: 'כיתה לא נמצאה במערכת' };
    }
    klassReferenceId = klass.id;
    result.klassName = klass.name;
  }

  const reportDate = Between(fromDate, toDate) as any;
  const reports = await dataSource.getRepository(AttReport).find({
    where: {
      userId: student.userId,
      studentReferenceId: student.id,
      reportDate,
      absCount: MoreThan(0),
      ...(klassReferenceId ? { klassReferenceId } : {}),
    },
    relations: { lesson: true },
    order: { reportDate: 'ASC' },
  });
  const approved = await dataSource.getRepository(KnownAbsence).find({
    where: { userId: student.userId, studentReferenceId: student.id, reportDate, isApproved: true },
  });
  const approvedKeys = new Set(approved.map((item) => `${item.lessonReferenceId}_${toDateStr(item.reportDate)}`));

  result.reports = reports.filter(
    (report) => !approvedKeys.has(`${report.lessonReferenceId}_${toDateStr(report.reportDate)}`),
  );
  result.alreadyApprovedCount = reports.length - result.reports.length;
  if (reports.length === 0) {
    result.error = 'לא נמצאו חיסורים בתאריכים אלו';
  }
  return result;
}

function findStudent(dataSource: DataSource, userId: number | undefined, row: StudentDatesRow): Promise<Student> {
  const userFilter = userId ? { userId } : {};
  if (row.studentReferenceId) {
    return dataSource.getRepository(Student).findOne({ where: { id: Number(row.studentReferenceId), ...userFilter } });
  }
  const tz = String(row.studentTz ?? '').trim();
  if (!tz) return Promise.resolve(null);
  // Excel drops leading zeros from ids, so match both the raw and the 9-digit padded value.
  return dataSource.getRepository(Student).findOne({ where: { tz: In([tz, tz.padStart(9, '0')]), ...userFilter } });
}

export function buildKnownAbsences(
  matches: StudentDatesMatch[],
  extra: KnownAbsenceExtraFields,
): Array<Partial<KnownAbsence>> {
  return matches.flatMap((match) =>
    match.reports.map((report) => ({
      userId: report.userId,
      studentReferenceId: report.studentReferenceId,
      klassReferenceId: report.klassReferenceId,
      lessonReferenceId: report.lessonReferenceId,
      reportDate: report.reportDate,
      absnceCount: Math.round(report.absCount),
      reason: extra.reason || null,
      senderName: extra.senderName || null,
      comment: extra.comment || null,
      isApproved: true,
      year: report.year,
    })),
  );
}
