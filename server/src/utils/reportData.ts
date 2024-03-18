import { DataSource, In } from "typeorm";

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

export function fetchAttGradeEffect(dataSource: DataSource, viewEntity: any, ids: string[]): Promise<Record<string, number>> {
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

export function calcAffectedGradeAvg(gradeAvg: number, attGradeEffect: number): number {
    const newGrade = gradeAvg * 100;
    if (newGrade >= 0 && newGrade <= 100) {
        return newGrade + (attGradeEffect ?? 0);
    }
    return newGrade;
}

export function limitGrade(grade: number): number {
    return Math.min(1, Math.max(0, grade));
}
