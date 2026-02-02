import { calcAvg, calcPercents, calcSum, getNumericValueOrNull, getUniqueValues, keepBetween, roundFractional } from "@shared/utils/reportData.util";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { FindOptionsWhere, FindOperator, In, Not, Any } from "typeorm";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { AttReportAndGrade } from "src/db/view-entities/AttReportAndGrade.entity";
import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { GradeName } from "src/db/entities/GradeName.entity";
import { AttendanceName } from "src/db/entities/AttendanceName.entity";
import { getAsArray } from "@shared/utils/queryParam.util";

interface ISprIdData {
    studentReferenceId: string;
    teacherReferenceId: string;
    klassReferenceId: string;
    lessonReferenceId: string;
    userId: string;
    year: string;
}
export function breakSprId(id: string): ISprIdData {
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

export function getKnownAbsenceFilterBySprAndDates(ids: string[], startDate: Date, endDate: Date): FindOptionsWhere<KnownAbsence> | FindOptionsWhere<KnownAbsence>[] {
    const filters = ids.map(id => {
        const { studentReferenceId, userId, year } = breakSprId(id);
        return {
            userId: getNumericValueOrNull(userId),
            studentReferenceId: getNumericValueOrNull(studentReferenceId),
            year: getNumericValueOrNull(year),
        };
    });

    const userIds = getUniqueValues(filters, item => item.userId);
    const studentIds = getUniqueValues(filters, item => item.studentReferenceId);
    const years = getUniqueValues(filters, item => item.year);

    if (userIds.length === 1 && years.length === 1) {
        return {
            isApproved: true,
            userId: userIds[0],
            studentReferenceId: In(studentIds),
            year: years[0],
            reportDate: getReportDateFilter(startDate, endDate),
        };
    }

    return filters.map(filter => ({
        isApproved: true,
        reportDate: getReportDateFilter(startDate, endDate),
        ...filter,
    }));
}

export function getReportsFilterForReportCard(studentId: number, year: number, reportDateFilter: FindOperator<any>, globalLessonIdsStr: string, denyLessonIdStr: string, klassIds?: number[]): FindOptionsWhere<AttReportAndGrade>[] {
    const denyLessonIds = getAsArray(denyLessonIdStr);
    const lessonFilter: FindOperator<number> = denyLessonIds?.length ? Not(In(denyLessonIds)) : undefined;
    const commonFilter: FindOptionsWhere<AttReportAndGrade> = { studentReferenceId: studentId, year, lessonReferenceId: lessonFilter };
    const globalLessonIds = getAsArray(globalLessonIdsStr);

    if (klassIds?.length) {
        commonFilter.klassReferenceId = In(klassIds);
    }

    if (reportDateFilter && globalLessonIds?.length) {
        return [
            { ...commonFilter, reportDate: reportDateFilter },
            { ...commonFilter, lessonReferenceId: In(globalLessonIds) },
        ];
    } else if (reportDateFilter) {
        return [{ ...commonFilter, reportDate: reportDateFilter }];
    } else if (globalLessonIds?.length) {
        return [{ ...commonFilter, lessonReferenceId: In(globalLessonIds) }];
    } else {
        return [{ ...commonFilter }];
    }
}

interface IStudentReportData {
    lessonsCount: number;
    absCount: number;
    approvedAbsCount: number;
    attPercents: number;
    absPercents: number;
    gradeAvg: number;
    lastGrade: number;
    maxGrade: number;
    estimatedAttPercents?: number;
    estimatedAbsPercents?: number;
}
export function calcReportsData(data: AttReportAndGrade[], totalAbsencesData: { absnceCount: number }[], estimatedLessonCount?: number): IStudentReportData {
    const lessonsCount = calcSum(data, item => item.howManyLessons);
    const absCount = calcSum(data, item => item.absCount);
    const approvedAbsCount = calcSum(totalAbsencesData, item => item.absnceCount);
    const unapprovedAbsCount = getUnknownAbsCount(absCount, approvedAbsCount);
    const attPercents = getAttPercents(lessonsCount, unapprovedAbsCount) / 100;
    const absPercents = 1 - attPercents;

    const grades = data.filter(item => item.type === 'grade');
    let gradeAvg = null, lastGrade = null, maxGrade = null;
    if (grades.length) {
        gradeAvg = roundFractional(calcAvg(grades, item => item.grade) / 100);
        lastGrade = (grades.at(-1)?.grade ?? 0) / 100;
        maxGrade = Math.max(...grades.map(item => item.grade)) / 100;
    }

    let estimatedAttPercents, estimatedAbsPercents;
    if (estimatedLessonCount) {
        estimatedAttPercents = getAttPercents(estimatedLessonCount, unapprovedAbsCount) / 100;
        estimatedAbsPercents = 1 - estimatedAttPercents;
    }

    return {
        lessonsCount,
        absCount,
        approvedAbsCount,
        attPercents,
        absPercents,
        gradeAvg,
        lastGrade,
        maxGrade,
        estimatedAttPercents,
        estimatedAbsPercents,
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

export function getRelevantGrade(isLastGrade: boolean, gradeAvg: number, lastGrade: number, maxGrade: number) {
    if (isLastGrade) {
        return lastGrade;
    }
    if (maxGrade > 1) {
        return maxGrade;
    }
    return gradeAvg;
}

export function getDisplayGrade(grade: number, gradeEffect: number = 0, gradeNames: GradeName[] = []) {
    // if (grade === 0) return '0%';
    if (!grade) return '';

    // ========== investigation ==========
    if (grade && typeof grade !== 'number') {
        console.warn('getDisplayGrade: grade is not a number', grade, typeof grade);
        grade = parseFloat(grade);
    }
    if (gradeEffect && typeof gradeEffect !== 'number') {
        console.warn('getDisplayGrade: gradeEffect is not a number', gradeEffect, typeof gradeEffect);
        gradeEffect = parseFloat(gradeEffect);
    }
    // ========== end of investigation ==========

    var finalGrade = getFinalGrade(grade * 100, gradeEffect);
    var matchingGradeName = getItemNameByKey(gradeNames, finalGrade);
    var displayGrade = matchingGradeName ?? (Math.round(finalGrade) + '%');
    return displayGrade;
}

export function getDisplayAttendance(attPercents: number, attendanceNames: AttendanceName[] = []) {
    if (attPercents === null || attPercents === undefined) return '';
    var finalAttPercents = Math.round(attPercents * 100);
    var matchingAttendanceName = getItemNameByKey(attendanceNames, finalAttPercents);
    var displayAttendance = matchingAttendanceName ?? (finalAttPercents + '%');
    return displayAttendance;
}

function getFinalGrade(grade: number, gradeEffect: number) {
    var isOriginalGrade = grade > 100 || grade == 0;
    var finalGrade = isOriginalGrade ? grade : keepBetween(grade + gradeEffect, 0, 100);
    return finalGrade;
}

function getItemNameByKey<T extends { key: number; name: string }>(items: T[], key: number) {
    return items?.find(item => item.key <= key)?.name || null;
}

export function getGradeEffect(attGradeEffect: AttGradeEffect[], attPercents: number, absCount: number) {
    const actualPercents = attPercents * 100;
    return attGradeEffect?.find(item => item.percents <= actualPercents || item.count >= absCount)?.effect ?? 0;
}

export function getDisplayable(entity?: { name: string, displayName?: string }) {
    return entity?.displayName || entity?.name;
}
