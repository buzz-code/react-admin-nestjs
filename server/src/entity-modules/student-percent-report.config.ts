import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { IHeader } from "@shared/utils/exporter/types";
import { getPercentsFormatter } from "@shared/utils/formatting/formatter.util";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { AttReportAndGrade } from "src/db/view-entities/AttReportAndGrade.entity";
import { StudentPercentReport } from "src/db/view-entities/StudentPercentReport.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentPercentReport,
        query: {
            join: {
                student: {},
                teacher: {},
                lesson: {},
                klass: { eager: true },
                studentBaseKlass: { eager: true },
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true },
                    studentBaseKlass: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'teacher.name', label: 'שם המורה' },
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'studentBaseKlass.klassName', label: 'כיתת בסיס' },
                    { value: 'klass.name', label: 'כיתה' },
                    { value: 'lesson.name', label: 'שיעור' },
                    { value: 'lessonsCount', label: 'מספר שיעורים' },
                    { value: 'absCount', label: 'מספר חיסורים' },
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
                const pivotData = await this.dataSource
                    .getRepository(AttReportAndGrade)
                    .find({
                        where: sprIds.map(id => {
                            const [studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, userId, year] = id.split('_');
                            return ({
                                studentReferenceId: Utils.getNumericValueOrNull(studentReferenceId),
                                teacherReferenceId: Utils.getNumericValueOrNull(teacherReferenceId),
                                klassReferenceId: Utils.getNumericValueOrNull(klassReferenceId),
                                lessonReferenceId: Utils.getNumericValueOrNull(lessonReferenceId),
                                userId: Utils.getNumericValueOrNull(userId),
                                year: Utils.getNumericValueOrNull(year),
                                reportDate: getReportDateFilter(extra?.fromDate, extra?.toDate),
                            });
                        })
                    });

                const pivotDataMap: Record<string, AttReportAndGrade[]> = {};
                pivotData.forEach(item => {
                    const id = [item.studentReferenceId, item.teacherReferenceId, item.klassReferenceId, item.lessonReferenceId, item.userId, item.year].map(String).join('_');
                    pivotDataMap[id] ??= [];
                    pivotDataMap[id].push(item);
                });

                const totalAbsencesData = await this.dataSource
                    .getRepository(KnownAbsence)
                    .find({
                        where: sprIds.map(id => {
                            const [studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, userId, year] = id.split('_');
                            return {
                                isApproved: true,
                                userId: Utils.getNumericValueOrNull(userId),
                                studentReferenceId: Utils.getNumericValueOrNull(studentReferenceId),
                                reportDate: getReportDateFilter(extra?.fromDate, extra?.toDate),
                                year: Utils.getNumericValueOrNull(year),
                            };
                        }),
                    });

                const totalAbsencesDataMap: Record<string, KnownAbsence[]> = {};
                totalAbsencesData.forEach(item => {
                    const id = [item.studentReferenceId, item.klassReferenceId, item.lessonReferenceId, item.userId, item.year].map(String).join('_');
                    totalAbsencesDataMap[id] ??= [];
                    totalAbsencesDataMap[id].push(item);
                });

                Object.entries(sprMap).forEach(([key, val]) => {
                    const arr = pivotDataMap[key] ?? [];
                    val.lessonsCount = Utils.calcSum(arr, item => item.howManyLessons);
                    val.absCount = Utils.calcSum(arr, item => item.absCount);
                    val.absPercents = Utils.roundFractional(val.absCount / (val.lessonsCount || 1));
                    val.attPercents = 1 - val.absPercents;
                    val.gradeAvg = Utils.calcAvg(arr, item => item.grade);
                    (val as any).gradeEffectId = `${val.userId}_${Math.floor(val.attPercents * 100)}`;
                    (val as any).absCountEffectId = `${val.userId}_${val.absCount}`;
                    const knownAbsArr = totalAbsencesDataMap[[val.studentReferenceId, val.klassReferenceId, val.lessonReferenceId, val.userId, val.year].map(String).join('_')] ?? [];
                    (val as any).approvedAbsCount = Utils.calcSum(knownAbsArr, item => item.absnceCount);
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