import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { IHeader } from "@shared/utils/exporter/types";
import { getPercentsFormatter } from "@shared/utils/formatting/formatter.util";
import { AbsCountEffectByUser } from "@shared/view-entities/AbsCountEffectByUser.entity";
import { GradeEffectByUser } from "@shared/view-entities/GradeEffectByUser.entity";
import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { GradeName } from "src/db/entities/GradeName.entity";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { AttReportAndGrade } from "src/db/view-entities/AttReportAndGrade.entity";
import { StudentPercentReport } from "src/db/view-entities/StudentPercentReport.entity";
import { calcAvg, calcSum, getAttPercents, getDisplayGrade, getNumericValueOrNull, getUniqueValues, getUnknownAbsCount, roundFractional } from "src/utils/reportData";
import { DataSource, In } from "typeorm";

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

interface StudentPercentReportWithDates extends StudentPercentReport {
    approvedAbsCount?: number;
    attGradeEffect?: number;
    finalGrade?: string;
    estimation?: string;
    comments?: string;
}
class StudentPercentReportService<T extends Entity | StudentPercentReport> extends BaseEntityService<T> {
    protected async populatePivotData(pivotName: string, list: T[], extra: any, filter: any, auth: any) {
        const data = list as StudentPercentReport[];
        const sprIds = data.map(item => item.id);
        const sprMap: Record<string, StudentPercentReportWithDates> = data.reduce((a, b) => ({ ...a, [b.id]: b }), {});

        switch (pivotName) {
            case 'PercentReportWithDates': {
                const pivotData = await this.dataSource
                    .getRepository(AttReportAndGrade)
                    .find({
                        where: sprIds.map(id => {
                            const [studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, userId, year] = id.split('_');
                            return ({
                                studentReferenceId: getNumericValueOrNull(studentReferenceId),
                                teacherReferenceId: getNumericValueOrNull(teacherReferenceId),
                                klassReferenceId: getNumericValueOrNull(klassReferenceId),
                                lessonReferenceId: getNumericValueOrNull(lessonReferenceId),
                                userId: getNumericValueOrNull(userId),
                                year: getNumericValueOrNull(year),
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
                                userId: getNumericValueOrNull(userId),
                                studentReferenceId: getNumericValueOrNull(studentReferenceId),
                                reportDate: getReportDateFilter(extra?.fromDate, extra?.toDate),
                                year: getNumericValueOrNull(year),
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
                    val.lessonsCount = calcSum(arr, item => item.howManyLessons);
                    val.absCount = calcSum(arr, item => item.absCount);
                    const knownAbsArr = totalAbsencesDataMap[[val.studentReferenceId, val.klassReferenceId, val.lessonReferenceId, val.userId, val.year].map(String).join('_')] ?? [];
                    val.approvedAbsCount = calcSum(knownAbsArr, item => item.absnceCount);
                    const unapprovedAbsCount = getUnknownAbsCount(val.absCount, val.approvedAbsCount);
                    val.attPercents = getAttPercents(val.lessonsCount, unapprovedAbsCount) / 100;
                    val.absPercents = 1 - val.attPercents;
                    val.gradeAvg = roundFractional(calcAvg(arr, item => item.grade) / 100);
                    const grades = arr.filter(item => item.type === 'grade');
                    val.estimation = getUniqueValues(grades, item => item.estimation).join(', ');
                    val.comments = getUniqueValues(grades, item => item.comments).join(', ');
                });

                const [absCountEffectsMap, gradeEffectsMap] = await getAbsGradeEffect(Object.values(sprMap), this.dataSource);
                const gradeNames = await this.dataSource.getRepository(GradeName)
                    .find({ where: { userId: getUserIdFromUser(auth) }, order: { key: 'DESC' } });

                Object.values(sprMap).forEach(item => {
                    item.attGradeEffect = gradeEffectsMap[getGradeEffectId(item)] ?? absCountEffectsMap[getAbsCountEffectId(item)];
                    const demoAttGradeEffects = [{ percents: 0, effect: item.attGradeEffect }] as AttGradeEffect[];
                    item.finalGrade = getDisplayGrade(item.attPercents * 100, item.absCount, item.gradeAvg * 100, gradeNames, demoAttGradeEffects);
                });

                const headers = {};
                headers['attGradeEffect'] = { value: 'attGradeEffect', label: 'קשר נוכחות ציון' };
                headers['finalGrade'] = { value: 'finalGrade', label: 'ציון סופי' };
                headers['estimation'] = { value: 'estimation', label: 'הערכה' };
                headers['comments'] = { value: 'comments', label: 'הערה' };
                (data[0] as any).headers = Object.values(headers);
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

async function getAbsGradeEffect(values: StudentPercentReportWithDates[], dataSource: DataSource) {
    const uniqueAbsCountEffectIds = getUniqueValues(values, getAbsCountEffectId);
    const uniqueGradeEffectIds = getUniqueValues(values, getGradeEffectId);

    const [absCountEffectsMap, gradeEffectsMap] = await Promise.all([
        fetchAttGradeEffect(dataSource, AbsCountEffectByUser, uniqueAbsCountEffectIds),
        fetchAttGradeEffect(dataSource, GradeEffectByUser, uniqueGradeEffectIds),
    ]);

    return [absCountEffectsMap, gradeEffectsMap];
}

function getAbsCountEffectId(item: StudentPercentReportWithDates): string {
    return `${item.userId}_${getUnknownAbsCount(item.absCount, item.approvedAbsCount)}`;
}

function getGradeEffectId(item: StudentPercentReportWithDates): string {
    return `${item.userId}_${Math.floor(item.attPercents * 100)}`;
}

function fetchAttGradeEffect(dataSource: DataSource, viewEntity: any, ids: string[]): Promise<Record<string, number>> {
    return dataSource
        .getRepository(viewEntity)
        .find({
            where: {
                id: In(ids),
            },
            select: ['id', 'effect'],
        })
        .then(arr => Object.fromEntries(arr.map(item => [item.id, item.effect])));
}

export default getConfig();