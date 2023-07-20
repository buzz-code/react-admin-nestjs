import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { AttReportAndGrade } from "src/db/view-entities/AttReportAndGrade.entity";
import { StudentPercentReport } from "src/db/view-entities/StudentPercentReport.entity";
import { Between, FindOperator, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

const getPercentsFormatter = (value: string) =>
    row =>
        row[value] && !isNaN(row[value]) ? `${Number(row[value]) * 100}%` : null;

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentPercentReport,
        query: {
            join: {
                student: {},
                teacher: {},
                lesson: {},
                klass: {
                    eager: true,
                },
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'teacher.name', label: 'שם המורה' },
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'klass.name', label: 'כיתה' },
                    { value: 'lesson.name', label: 'שיעור' },
                    { value: 'lessonsCount', label: 'מספר שיעורים' },
                    { value: getPercentsFormatter('absPercents'), label: 'אחוז חיסור' },
                    { value: getPercentsFormatter('attPercents'), label: 'אחוז נוכחות' },
                    { value: getPercentsFormatter('gradeAvg'), label: 'ציון ממוצע' },
                ];
            }
        },
        service: StudentPercentReportService,
    }
}

class StudentPercentReportService<T extends Entity | StudentPercentReport> extends BaseEntityService<T> {
    protected async populatePivotData(pivotName: string, list: T[], extra: any) {
        const data = list as StudentPercentReport[];
        const sprIds = data.map(item => item.id);
        const sprMap: Record<string, StudentPercentReport> = data.reduce((a, b) => ({ ...a, [b.id]: b }), {});

        switch (pivotName) {
            case 'PercentReportWithDates': {
                const reportDate = Utils.getReportDateFilter(extra?.fromDate, extra?.toDate);
                const pivotData = await this.dataSource
                    .getRepository(AttReportAndGrade)
                    .find({
                        where: sprIds.map(id => {
                            const [studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId] = id.split('_');
                            return ({
                                studentReferenceId: Utils.getNumericValueOrNull(studentReferenceId),
                                teacherReferenceId: Utils.getNumericValueOrNull(teacherReferenceId),
                                klassReferenceId: Utils.getNumericValueOrNull(klassReferenceId),
                                lessonReferenceId: Utils.getNumericValueOrNull(lessonReferenceId),
                                reportDate,
                            });
                        })
                    });

                const pivotDataMap: Record<string, AttReportAndGrade[]> = {};
                pivotData.forEach(item => {
                    const id = [item.studentReferenceId, item.teacherReferenceId, item.klassReferenceId, item.lessonReferenceId].map(String).join('_');
                    pivotDataMap[id] ??= [];
                    pivotDataMap[id].push(item);
                });

                Object.entries(sprMap).forEach(([key, val]) => {
                    const arr = pivotDataMap[key] ?? [];
                    val.lessonsCount = Utils.calcSum(arr, item => item.howManyLessons);
                    const absCount = Utils.calcSum(arr, item => item.absCount);
                    val.absPercents = Utils.roundFractional(absCount / (val.lessonsCount || 1));
                    val.attPercents = 1 - val.absPercents;
                    val.gradeAvg = Utils.calcAvg(arr, item => item.grade);
                });
            }
        }
    }

    // reportsDict = {
    //     studentReportCard: new BulkToPdfReportGenerator(studentReportCard),
    // };
    // async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
    //     if (req.parsed.extra.report in this.reportsDict) {
    //         const generator = this.reportsDict[req.parsed.extra.report];
    //         const params = req.parsed.extra.ids
    //             .toString()
    //             .split(',')
    //             .map(id => ({ userId: req.auth.id, studentId: id }));
    //         return {
    //             generator,
    //             params,
    //         };
    //     }
    //     return super.getReportData(req);
    // }
}

const Utils = {
    getReportDateFilter(fromDate: Date, toDate: Date): FindOperator<any> {
        if (fromDate && toDate) {
            return Between(fromDate, toDate);
        }
        if (fromDate) {
            return MoreThanOrEqual(fromDate);
        }
        if (toDate) {
            return LessThanOrEqual(toDate);
        }
    },
    getNumericValueOrNull(val: string): number {
        return val === 'null' ? null : Number(val);
    },
    calcSum<T>(arr: T[], getValue: (item: T) => number): number {
        return arr.reduce((val, item) => val + (getValue(item) ?? 0), 0);
    },
    calcAvg<T>(arr: T[], getValue: (item: T) => number): number {
        let total = 0, count = 0;
        for (const item of arr) {
            const val = getValue(item);
            if (val !== null && val !== undefined) {
                total += val;
                count++;
            }
        }
        return total / (count || 1);
    },
    roundFractional(val: number): number {
        return +val.toFixed(4);
    },
}

export default getConfig();