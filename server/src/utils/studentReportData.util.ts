import { calcPercents, getNumericValueOrNull, keepBetween } from "src/utils/reportData.util";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { FindOptionsWhere } from "typeorm";
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

export function getAttCount(lessonsCount: number, absCount: number) {
    return keepBetween(lessonsCount - absCount, 0, lessonsCount);
}

export function getAttPercents(lessonsCount: number, absCount: number) {
    return calcPercents(getAttCount(lessonsCount, absCount), lessonsCount);
}

export function getUnknownAbsCount(absCount: number, knownAbs: number) {
    return Math.max(0, (absCount ?? 0) - (knownAbs ?? 0));
}

export function getDisplayGrade(attPercents: number, absCount: number, grade: number, gradeNames: GradeName[], attGradeEffect: AttGradeEffect[]) {
    var gradeEffect = getGradeEffect(attGradeEffect, attPercents, absCount);
    var finalGrade = getFinalGrade(grade, gradeEffect);
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
