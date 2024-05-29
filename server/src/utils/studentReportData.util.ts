import { calcAvg, calcPercents, calcSum, getNumericValueOrNull, keepBetween, roundFractional } from "src/utils/reportData.util";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { FindOptionsWhere, FindOperator, In } from "typeorm";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { AttReportAndGrade } from "src/db/view-entities/AttReportAndGrade.entity";
import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { GradeName } from "src/db/entities/GradeName.entity";

interface ISprIdData {
    studentReferenceId: string;
    teacherReferenceId: string;
    klassReferenceId: string;
    lessonReferenceId: string;
    userId: string;
    year: string;
}
function breakSprId(id: string): ISprIdData {
    const [studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, userId, year] = id.split('_');
    return {
        studentReferenceId,
        teacherReferenceId,
        klassReferenceId,
        lessonReferenceId,
        userId,
        year,
    };
}

export function getReportDataFilterBySprAndDates(ids: string[], startDate: Date, endDate: Date): FindOptionsWhere<AttReportAndGrade>[] {
    return ids.map(id => {
        const { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, userId, year } = breakSprId(id);
        return ({
            studentReferenceId: getNumericValueOrNull(studentReferenceId),
            teacherReferenceId: getNumericValueOrNull(teacherReferenceId),
            klassReferenceId: getNumericValueOrNull(klassReferenceId),
            lessonReferenceId: getNumericValueOrNull(lessonReferenceId),
            userId: getNumericValueOrNull(userId),
            year: getNumericValueOrNull(year),
            reportDate: getReportDateFilter(startDate, endDate),
        });
    });
}

export function getKnownAbsenceFilterBySprAndDates(ids: string[], startDate: Date, endDate: Date): FindOptionsWhere<KnownAbsence>[] {
    return ids.map(id => {
        const { studentReferenceId, userId, year } = breakSprId(id);
        return {
            isApproved: true,
            userId: getNumericValueOrNull(userId),
            studentReferenceId: getNumericValueOrNull(studentReferenceId),
            reportDate: getReportDateFilter(startDate, endDate),
            year: getNumericValueOrNull(year),
        };
    });
}

export function getReportsFilterForReportCard(studentId: number, year: number, reportDateFilter: FindOperator<any>, globalLessonIdsStr: string): FindOptionsWhere<AttReportAndGrade>[] {
    const commonFilter = { studentReferenceId: studentId, year };
    const globalLessonIds = globalLessonIdsStr.split(',').filter(item => item != 'undefined');

    if (reportDateFilter && globalLessonIds.length) {
        return [
            { ...commonFilter, reportDate: reportDateFilter },
            { ...commonFilter, lessonReferenceId: In(globalLessonIds) },
        ];
    } else if (reportDateFilter) {
        return [{ ...commonFilter, reportDate: reportDateFilter }];
    } else if (globalLessonIds.length) {
        return [{ ...commonFilter, lessonReferenceId: In(globalLessonIds) }];
    } else {
        return [{ ...commonFilter }];
    }
}

interface IStudentReportData {
    lessonsCount: number;
    absCount: number;
    attPercents: number;
    absPercents: number;
    gradeAvg: number;
    lastGrade: number;
}
export function calcReportsData(data: AttReportAndGrade[], totalAbsencesData: { absnceCount: number }[]): IStudentReportData {
    const lessonsCount = calcSum(data, item => item.howManyLessons);
    const absCount = calcSum(data, item => item.absCount);
    const approvedAbsCount = calcSum(totalAbsencesData, item => item.absnceCount);
    const unapprovedAbsCount = getUnknownAbsCount(absCount, approvedAbsCount);
    const attPercents = getAttPercents(lessonsCount, unapprovedAbsCount) / 100;
    const absPercents = 1 - attPercents;
    const gradeAvg = roundFractional(calcAvg(data, item => item.grade) / 100);
    const lastGrade = (data.filter(item => item.type === 'grade').pop()?.grade ?? 0) / 100;

    return {
        lessonsCount,
        absCount,
        attPercents,
        absPercents,
        gradeAvg,
        lastGrade,
    };
}

export function getAttCount(lessonsCount: number, absCount: number) {
    return keepBetween(lessonsCount - absCount, 0, lessonsCount);
}

export function getAttPercents(lessonsCount: number, absCount: number) {
    return calcPercents(getAttCount(lessonsCount, absCount), lessonsCount);
}

export function getUnknownAbsCount(absCount: number, knownAbs: number) {
    return Math.max(0, (absCount ?? 0) - (knownAbs ?? 0));
}

export function getDisplayGrade(lessonsCount: number, absCount: number, grade: number, gradeNames: GradeName[], attGradeEffect: AttGradeEffect[]) {
    let gradeEffect = 0;
    if (lessonsCount) {
        const attPercents = getAttPercents(lessonsCount, absCount);
        gradeEffect = getGradeEffect(attGradeEffect, attPercents, absCount);
    }
    var finalGrade = getFinalGrade(grade * 100, gradeEffect);
    var matchingGradeName = getGradeName(gradeNames, finalGrade);
    var displayGrade = matchingGradeName ?? (Math.round(finalGrade) + '%');
    return displayGrade;
}

function getFinalGrade(grade: number, gradeEffect: any) {
    var isOriginalGrade = grade > 100 || grade == 0;
    var finalGrade = isOriginalGrade ? grade : keepBetween(grade + gradeEffect, 0, 100);
    return finalGrade;
}

function getGradeName(gradeNames: GradeName[], finalGrade: number) {
    return gradeNames?.find(item => item.key <= finalGrade)?.name || null;
}

function getGradeEffect(attGradeEffect: AttGradeEffect[], attPercents: number, absCount: number) {
    return attGradeEffect?.find(item => item.percents <= attPercents || item.count >= absCount)?.effect ?? 0;
}
