import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { ParsedRequestParams } from '@dataui/crud-request';
import { StudentByYear } from "src/db/view-entities/StudentByYear.entity";
import { FindOptionsWhere, In } from "typeorm";
import { IHeader } from "@shared/utils/exporter/types";
import { AttReportWithReportMonth } from "src/db/view-entities/AttReportWithReportMonth.entity";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { ReportMonth, ReportMonthSemester } from "src/db/entities/ReportMonth.entity";
import { KnownAbsenceWithReportMonth } from "src/db/view-entities/KnownAbsenceWithReportMonth.entity";
import { Klass } from "src/db/entities/Klass.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentByYear,
        service: StudentByYearService,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'tz', label: 'תעודת זהות' },
                    { value: 'name', label: 'שם' },
                    { value: 'year', label: 'שנה' },
                ];
            },
        }
    }
}

class StudentByYearService<T extends Entity | StudentByYear> extends BaseEntityService<T> {
    protected async populatePivotData(pivotName: string, list: T[], extra: any, filter: ParsedRequestParams<any>['filter']) {
        const data = list as StudentByYear[];
        const studentIds = data.map(item => item.id);
        const studentMap = data.reduce((a, b) => ({ ...a, [b.id]: b }), {});
        const yearFilter = filter.find(item => item.field === 'year');
        const klassReferenceIdFilter = filter.find(item => item.field === 'klassReferenceIds');
        const klassTypeReferenceIdFilter = filter.find(item => item.field === 'klassTypeReferenceIds');

        switch (pivotName) {
            case 'StudentAttendance': {
                const headers = {};

                if (yearFilter?.value) {
                    data.forEach(item => item.year = [yearFilter.value]);
                }

                const pivotData = await this.dataSource
                    .getRepository(AttReportWithReportMonth)
                    .find({
                        where: {
                            userId: data[0].userId,
                            studentReferenceId: In(studentIds),
                            klassReferenceId: klassReferenceIdFilter?.value,
                            klass: Utils.getKlassFilter(extra.isCheckKlassType, klassTypeReferenceIdFilter?.value),
                            lessonReferenceId: extra?.lessonId,
                            year: yearFilter?.value,
                            reportDate: getReportDateFilter(extra?.fromDate, extra?.toDate),
                            reportMonth: Utils.getReportMonthFilter(extra?.reportMonthReferenceId, extra?.semester),
                        },
                        relations: {
                            klass: true,
                            lesson: true,
                            reportMonth: true,
                        }
                    });

                pivotData.forEach(item => {
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

                const totalAbsencesData = await this.dataSource
                    .getRepository(KnownAbsenceWithReportMonth)
                    .find({
                        where: {
                            isApproved: true,
                            userId: data[0].userId,
                            studentReferenceId: In(studentIds),
                            klassReferenceId: klassReferenceIdFilter?.value,
                            klass: Utils.getKlassFilter(extra.isCheckKlassType, klassTypeReferenceIdFilter?.value),
                            reportDate: getReportDateFilter(extra?.fromDate, extra?.toDate),
                            reportMonth: Utils.getReportMonthFilter(extra?.reportMonthReferenceId, extra?.semester),
                        },
                        relations: {
                            klass: true,
                            reportMonth: true,
                        }
                    });

                totalAbsencesData.forEach(item => {
                    studentMap[item.studentReferenceId].totalKnownAbsences ??= 0;
                    studentMap[item.studentReferenceId].totalKnownAbsences += item.absnceCount;
                });

                headers['total'] = {
                    value: 'total',
                    label: 'סה"כ'
                };
                headers['totalKnownAbsences'] = {
                    value: 'totalKnownAbsences',
                    label: 'סה"כ חיסורים מאושרים'
                };
                headers['totalLessons'] = {
                    value: 'totalLessons',
                    label: 'סה"כ שיעורים'
                };

                (data[0] as any).headers = Object.values(headers);
            }
        }
    }
}

const Utils = {
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
    getKlassFilter(isCheckKlassType: Boolean, klassTypeReferenceId: number): FindOptionsWhere<Klass> {
        if (isCheckKlassType && klassTypeReferenceId) {
            return { klassTypeReferenceId };
        }
    }
};

export default getConfig();