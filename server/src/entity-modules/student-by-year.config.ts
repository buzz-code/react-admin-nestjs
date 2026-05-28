import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { ParsedRequestParams } from '@dataui/crud-request';
import { StudentByYear } from 'src/db/view-entities/StudentByYear.entity';
import { FindOptionsWhere, In, Not, IsNull } from 'typeorm';
import { IHeader } from '@shared/utils/exporter/types';
import { AttReportWithReportMonth } from 'src/db/view-entities/AttReportWithReportMonth.entity';
import { getReportDateFilter } from '@shared/utils/entity/filters.util';
import { ReportMonth, ReportMonthSemester } from 'src/db/entities/ReportMonth.entity';
import { KnownAbsenceWithReportMonth } from 'src/db/view-entities/KnownAbsenceWithReportMonth.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { formatPercent } from '@shared/utils/formatting/formatter.util';
import { roundAllNumericProperties } from '@shared/utils/reportData.util';
import { getAsNumberArray } from '@shared/utils/queryParam.util';
import { ABSENCE_THRESHOLDS } from 'src/utils/absenceThresholds';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: StudentByYear,
    service: StudentByYearService,
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'name', label: 'שם התלמידה' },
          { value: 'tz', label: 'תז התלמידה' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
  };
}

interface IStudentAttendancePivot extends StudentByYear {
  total?: number;
  totalLessons?: number;
  totalKnownAbsences?: number;
  unApprovedAbsences?: number;
  absencePercentage?: string;
  totalAbsencePercentage?: string;
  absenceRatio?: number;
  totalAbsenceRatio?: number;
}

/** Extends the pivot with an index signature for dynamic klass columns (e.g. `klass_42`). */
interface IDynamicStudentPivot extends IStudentAttendancePivot {
  [key: string]: any;
}
class StudentByYearService<T extends Entity | StudentByYear> extends BaseEntityService<T> {
  protected async populatePivotData(
    pivotName: string,
    list: T[],
    extra: any,
    filter: ParsedRequestParams<any>['filter'],
  ) {
    switch (pivotName) {
      case 'StudentAttendance':
        return this.populateStudentAttendance(list, extra, filter);
      case 'StudentAttendanceByKlass':
        return this.populateStudentAttendanceByKlass(list, extra, filter);
    }
  }

  private async populateStudentAttendance(
    list: T[],
    extra: any,
    filter: ParsedRequestParams<any>['filter'],
  ): Promise<void> {
    const data = list as StudentByYear[];
    const studentMap: Record<number, IStudentAttendancePivot> = data.reduce((a, b) => ({ ...a, [b.id]: b }), {});
    const klassReferenceIdFilter = filter.find((item) => item.field === 'klassReferenceIds');
    const klassTypeReferenceIdFilter = filter.find((item) => item.field === 'klassTypeReferenceIds');
    const klassReferenceIds = getAsNumberArray(extra.klassReferenceIds) || klassReferenceIdFilter?.value;
    const klassTypeReferenceIds = getAsNumberArray(extra.klassTypeReferenceIds) || klassTypeReferenceIdFilter?.value;
    const lessonIds = getAsNumberArray(extra?.lessonIds);
    const excludedLessonIds = getAsNumberArray(extra?.excludedLessonIds);

    const headers = {
      // add student tz and name to the headers
    };

    // Note: year is now a single number, not an array

    const baseWhere = {
      ...this.buildBaseWhere(data, extra, filter),
      klassReferenceId: Utils.getInFilter(klassReferenceIds),
      klass: Utils.getKlassFilter(klassTypeReferenceIds),
      lessonReferenceId: Utils.getInFilter(lessonIds),
    };

    const pivotData = await this.dataSource.getRepository(AttReportWithReportMonth).find({
      where: Utils.applyExcludedLessons<AttReportWithReportMonth>(baseWhere, excludedLessonIds),
      relations: {
        klass: true,
        lesson: true,
        reportMonth: true,
      },
    });

    pivotData.forEach((item) => {
      // if (item.absCount === 0) {
      //     return;
      // }
      const key = `${item.lessonReferenceId}`;
      headers[key] ??= { value: key, label: `${item.lesson?.name}` };
      studentMap[item.studentReferenceId][key] ??= 0;
      studentMap[item.studentReferenceId][key] += item.absCount;
      studentMap[item.studentReferenceId].total ??= 0;
      studentMap[item.studentReferenceId].total += item.absCount;
      studentMap[item.studentReferenceId].totalLessons ??= 0;
      studentMap[item.studentReferenceId].totalLessons += item.howManyLessons;
    });

    const totalAbsencesData = await this.dataSource.getRepository(KnownAbsenceWithReportMonth).find({
      where: Utils.applyExcludedLessons<KnownAbsenceWithReportMonth>(
        { ...baseWhere, isApproved: true },
        excludedLessonIds,
        true,
      ),
      relations: {
        klass: true,
        reportMonth: true,
      },
    });

    totalAbsencesData.forEach((item) => {
      studentMap[item.studentReferenceId].totalKnownAbsences ??= 0;
      studentMap[item.studentReferenceId].totalKnownAbsences += item.absnceCount;
    });

    Object.values(studentMap).forEach((student) => {
      const unApprovedAbsences = (student.total ?? 0) - (student.totalKnownAbsences ?? 0);
      const totalLessons = student.totalLessons ?? 1;
      student.unApprovedAbsences = unApprovedAbsences;
      student.absencePercentage = formatPercent(unApprovedAbsences / totalLessons, 2);
      student.totalAbsencePercentage = formatPercent((student.total ?? 0) / totalLessons, 2);

      roundAllNumericProperties(student);
    });

    headers['total'] = {
      value: 'total',
      label: 'סה"כ',
    };
    headers['totalKnownAbsences'] = {
      value: 'totalKnownAbsences',
      label: 'חיסורים מאושרים',
    };
    headers['unApprovedAbsences'] = {
      value: 'unApprovedAbsences',
      label: 'חיסורים לא מאושרים',
    };
    headers['totalLessons'] = {
      value: 'totalLessons',
      label: 'סה"כ שיעורים',
    };
    headers['absencePercentage'] = {
      value: 'absencePercentage',
      label: 'אחוז חיסורים',
    };
    headers['totalAbsencePercentage'] = {
      value: 'totalAbsencePercentage',
      label: 'אחוז חיסורים כולל',
    };

    (data[0] as any).headers = Object.values(headers);
  }

  private async populateStudentAttendanceByKlass(
    list: T[],
    extra: any,
    filter: ParsedRequestParams<any>['filter'],
  ): Promise<void> {
    const selectedKlassIds = getAsNumberArray(extra.klassReferenceIds);
    // No klasses selected → return without setting headers; getExportHeaders handles undefined via ?? []
    if (!selectedKlassIds?.length) return;

    const data = list as StudentByYear[];
    const studentMap: Record<number, IDynamicStudentPivot> = data.reduce(
      (a, b) => ({ ...a, [b.id]: b }),
      {},
    );
    const klassTypeReferenceIds = getAsNumberArray(extra.klassTypeReferenceIds);
    const excludedLessonIds = getAsNumberArray(extra?.excludedLessonIds);

    const baseWhere: FindOptionsWhere<AttReportWithReportMonth> = {
      ...this.buildBaseWhere(data, extra, filter),
      klassReferenceId: In(selectedKlassIds),
      klass: Utils.getKlassFilter(klassTypeReferenceIds),
    };

    const [attData, knownAbsData] = await Promise.all([
      this.dataSource.getRepository(AttReportWithReportMonth).find({
        where: Utils.applyExcludedLessons<AttReportWithReportMonth>(baseWhere, excludedLessonIds),
        relations: { klass: true, reportMonth: true },
      }),
      this.dataSource.getRepository(KnownAbsenceWithReportMonth).find({
        where: Utils.applyExcludedLessons<KnownAbsenceWithReportMonth>(
          { ...baseWhere, isApproved: true } as FindOptionsWhere<KnownAbsenceWithReportMonth>,
          excludedLessonIds,
          true,
        ),
        relations: { klass: true, reportMonth: true },
      }),
    ]);

    const headers: Record<string, { value: string; label: string; numFmt?: string; thresholds?: any }> = {};
    const rawAbs: Record<number, Record<string, number>> = {};
    const rawLessons: Record<number, Record<string, number>> = {};
    const rawKnownAbs: Record<number, Record<string, number>> = {};

    // Pre-populate headers for every selected klass so columns always appear
    const selectedKlasses = await this.dataSource.getRepository(Klass).find({
      where: { id: In(selectedKlassIds) },
    });
    const klassNameMap: Record<number, string> = Object.fromEntries(
      selectedKlasses.map((k) => [k.id, k.name]),
    );
    selectedKlassIds.forEach((kid) => {
      const key = `klass_${kid}`;
      headers[key] = {
        value: key,
        label: klassNameMap[kid] ?? String(kid),
        numFmt: '0.00%',
        thresholds: ABSENCE_THRESHOLDS,
      };
    });

    attData.forEach((item) => {
      const key = `klass_${item.klassReferenceId}`;
      const sid = item.studentReferenceId;
      rawAbs[sid] ??= {};
      rawLessons[sid] ??= {};
      rawAbs[sid][key] = (rawAbs[sid][key] ?? 0) + item.absCount;
      rawLessons[sid][key] = (rawLessons[sid][key] ?? 0) + item.howManyLessons;
    });

    knownAbsData.forEach((item) => {
      const key = `klass_${item.klassReferenceId}`;
      const sid = item.studentReferenceId;
      rawKnownAbs[sid] ??= {};
      rawKnownAbs[sid][key] = (rawKnownAbs[sid][key] ?? 0) + item.absnceCount;
    });

    Object.values(studentMap).forEach((student) => {
      const sid = student.id;
      let totalAbs = 0;
      let totalLessons = 0;

      Object.keys(headers).forEach((key) => {
        const abs = rawAbs[sid]?.[key] ?? 0;
        const known = rawKnownAbs[sid]?.[key] ?? 0;
        const lessons = rawLessons[sid]?.[key] ?? 0;
        const unapproved = abs - known;
        student[key] = Utils.safeRatio(unapproved, lessons);
        totalAbs += abs;
        totalLessons += lessons;
      });

      const totalKnownAbs = Object.values(rawKnownAbs[sid] ?? {}).reduce((a, b) => a + b, 0);
      const unApproved = totalAbs - totalKnownAbs;

      student.total = totalAbs;
      student.totalLessons = totalLessons;
      student.totalKnownAbsences = totalKnownAbs;
      student.unApprovedAbsences = unApproved;
      student.absenceRatio = Utils.safeRatio(unApproved, totalLessons);
      student.totalAbsenceRatio = Utils.safeRatio(totalAbs, totalLessons);
    });

    const summaryHeaders = [
      { value: 'total', label: 'סה"כ חיסורים' },
      { value: 'totalKnownAbsences', label: 'חיסורים מאושרים' },
      { value: 'unApprovedAbsences', label: 'חיסורים לא מאושרים' },
      { value: 'totalLessons', label: 'סה"כ שיעורים' },
      { value: 'absenceRatio', label: 'אחוז חיסורים', numFmt: '0.00%', thresholds: ABSENCE_THRESHOLDS },
      { value: 'totalAbsenceRatio', label: 'אחוז חיסורים כולל', numFmt: '0.00%', thresholds: ABSENCE_THRESHOLDS },
    ];

    (data[0] as any).headers = [...Object.values(headers), ...summaryHeaders];
  }

  private buildBaseWhere(
    data: StudentByYear[],
    extra: any,
    filter: ParsedRequestParams<any>['filter'],
  ): FindOptionsWhere<AttReportWithReportMonth> {
    const yearFilter = filter.find((item) => item.field === 'year');
    return {
      userId: data[0].userId,
      studentReferenceId: In(data.map((item) => item.id)),
      year: yearFilter?.value,
      reportDate: getReportDateFilter(extra?.fromDate, extra?.toDate),
      reportMonth: Utils.getReportMonthFilter(extra?.reportMonthReferenceId, extra?.semester),
    };
  }
}

export const Utils = {
  getReportMonthFilter(id: number, semester: ReportMonthSemester): FindOptionsWhere<ReportMonth> {
    const filter = { id, semester };
    for (const key in filter) {
      if (!filter[key]) {
        delete filter[key];
      }
    }
    if (Object.keys(filter).length > 0) {
      return filter;
    }
  },
  getInFilter(value: any) {
    if (value) {
      return Array.isArray(value) ? In(value) : value;
    }
  },
  getKlassFilter(klassTypeReferenceId: any): FindOptionsWhere<Klass> {
    const filter = Utils.getInFilter(klassTypeReferenceId);
    if (filter) {
      return { klassTypeReferenceId: filter };
    }
  },
  applyExcludedLessons<T>(
    where: FindOptionsWhere<T>,
    excludedLessonIds: number[],
    includeNull = false,
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    if (!excludedLessonIds?.length) return where;
    const withExclusion: FindOptionsWhere<T> = { ...where, lessonReferenceId: Not(In(excludedLessonIds)) };
    if (includeNull) {
      return [withExclusion, { ...where, lessonReferenceId: IsNull() }];
    }
    return withExclusion;
  },
  safeRatio(numerator: number, denominator: number): number {
    return denominator > 0 ? numerator / denominator : 0;
  },
};

export default getConfig();
