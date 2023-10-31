import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { ParsedRequestParams } from '@dataui/crud-request';
import { StudentByYear } from "src/db/view-entities/StudentByYear.entity";
import { FindOptionsWhere, In } from "typeorm";
import { IHeader } from "@shared/utils/exporter/types";
import { AttReportWithReportMonth } from "src/db/view-entities/AttReportWithReportMonth.entity";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { ReportMonth, ReportMonthSemester } from "src/db/entities/ReportMonth.entity";

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

        switch (pivotName) {
            case 'StudentAttendance': {
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
                            lessonReferenceId: extra?.lessonId,
                            year: yearFilter?.value,
                            reportDate: getReportDateFilter(extra?.fromDate, extra?.toDate),
                            reportMonth: Utils.getReportMonthFilter(extra?.reportMonthReferenceId, extra?.semester),
                        },
                        relations: {
                            lesson: true,
                            reportMonth: true,
                        }
                    });

                const headers = {};

                pivotData.forEach(item => {
                    // if (item.absCount === 0) {
                    //     return;
                    // }
                    const key = `${item.lessonReferenceId}`;
                    if (studentMap[item.studentReferenceId][key] === undefined) {
                        studentMap[item.studentReferenceId][key] = 0;

                        if (!headers[key]) {
                            headers[key] = {
                                value: key,
                                label: `${item.lesson?.name}`
                            };
                        }
                    }
                    studentMap[item.studentReferenceId][key] += item.absCount;
                    studentMap[item.studentReferenceId].total = (studentMap[item.studentReferenceId].total || 0) + item.absCount;
                });

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
};

export default getConfig();