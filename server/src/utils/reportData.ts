import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { GradeName } from "src/db/entities/GradeName.entity";

export function getNumericValueOrNull(val: string): number {
    return val === 'null' ? null : Number(val);
}

export function calcSum<T>(arr: T[], getValue: (item: T) => number): number {
    return arr.reduce((val, item) => val + (getValue(item) ?? 0), 0);
}

export function calcAvg<T>(arr: T[], getValue: (item: T) => number): number {
    let total = 0, count = 0;
    for (const item of arr) {
        const val = getValue(item);
        if (val !== null && val !== undefined) {
            total += val;
            count++;
        }
    }
    return total / (count || 1);
}

export function roundFractional(val: number): number {
    return +val.toFixed(4);
}

export function getUniqueValues<T, S>(arr: T[], getValue: (item: T) => S): S[] {
    return [...new Set(arr.map(getValue).filter(Boolean))];
}

export function getAttPercents(lessonsCount: number, unKnownAbs: number) {
    const count = lessonsCount ?? 1;
    return Math.round(((count - unKnownAbs) / count) * 100);
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
    var finalGrade = isOriginalGrade ? grade : Math.min(100, Math.max(0, grade + gradeEffect));
    return finalGrade;
}

function getGradeName(gradeNames: GradeName[], finalGrade: number) {
    return gradeNames?.find(item => item.key <= finalGrade)?.name || null;
}

function getGradeEffect(attGradeEffect: AttGradeEffect[], attPercents: number, absCount: number) {
    return attGradeEffect?.find(item => item.percents <= attPercents || item.count >= absCount)?.effect ?? 0;
}
