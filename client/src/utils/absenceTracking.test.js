import {
    getDetailDateRange,
    getLessonHeaders,
    getStudentStats,
    getThresholdStatus,
    getTopSubject,
    groupByKlass,
    summarizeStudentReports,
} from './absenceTracking';

const headers = [
    { value: '11', label: 'אנגלית' },
    { value: 'null', label: 'undefined' },
    { value: 'total', label: 'סה"כ' },
    { value: 'totalLessons', label: 'סה"כ שיעורים' },
];

describe('getLessonHeaders', () => {
    it('merges lesson headers from every page and skips summary columns', () => {
        const pages = [[{ headers }], [{ headers: [{ value: '12', label: 'מתמטיקה' }] }], []];
        const lessons = getLessonHeaders(pages);
        expect([...lessons.entries()]).toEqual([
            ['11', 'אנגלית'],
            ['null', 'ללא שיעור'],
            ['12', 'מתמטיקה'],
        ]);
    });
});

describe('getThresholdStatus', () => {
    it('counts absences left until the threshold', () => {
        expect(getThresholdStatus(2, 50, 0.2)).toEqual({ key: 'ok', left: 8 });
        expect(getThresholdStatus(7, 50, 0.2)).toEqual({ key: 'near', left: 3 });
        expect(getThresholdStatus(10, 50, 0.2)).toEqual({ key: 'over', left: 0 });
        expect(getThresholdStatus(12, 50, 0.2)).toEqual({ key: 'over', left: -2 });
    });

    it('is not thrown off by floating point', () => {
        // 0.2 * 35 = 7.000000000000001
        expect(getThresholdStatus(7, 35, 0.2).key).toBe('over');
    });
});

describe('getStudentStats', () => {
    const lessons = getLessonHeaders([[{ headers }]]);

    it('uses unapproved absences for the ratio and lists subjects with absences', () => {
        const stats = getStudentStats(
            { id: 1, name: 'שרה', 11: 4, null: 0, total: 6, totalKnownAbsences: 2, totalLessons: 40 },
            lessons,
            0.2,
        );
        expect(stats).toMatchObject({ unapproved: 4, approved: 2, lessons: 40, ratio: 0.1, hasReports: true });
        expect(stats.subjects).toEqual([{ key: '11', name: 'אנגלית', abs: 4 }]);
        expect(stats.status).toEqual({ key: 'ok', left: 4 });
    });

    it('marks students without reports', () => {
        expect(getStudentStats({ id: 2, name: 'רחל' }, lessons, 0.2).hasReports).toBe(false);
    });
});

describe('groupByKlass', () => {
    const student = (id, ratio, key) => ({ id, ratio, lessons: 10, unapproved: ratio * 10, status: { key } });

    it('puts the class with most students over the threshold first and the no-class group last', () => {
        const groups = groupByKlass(
            [student(1, 0.1, 'ok'), student(2, 0.3, 'over'), student(3, 0.05, 'ok'), student(4, 0.5, 'over')],
            { 1: 'א1', 2: 'ב1', 4: 'ב1' },
            'ללא',
        );
        expect(groups.map((g) => g.name)).toEqual(['ב1', 'א1', 'ללא']);
        expect(groups[0].students.map((s) => s.id)).toEqual([4, 2]);
        expect(groups[0].over).toBe(2);
    });
});

describe('getTopSubject', () => {
    it('returns the subject behind a large share of absences', () => {
        const students = [
            { subjects: [{ name: 'אנגלית', abs: 6 }, { name: 'תנ"ך', abs: 1 }] },
            { subjects: [{ name: 'אנגלית', abs: 3 }, { name: 'תנ"ך', abs: 2 }] },
        ];
        expect(getTopSubject(students)).toEqual({ name: 'אנגלית', abs: 9, share: 0.75 });
    });

    it('returns nothing for a single subject or too few absences', () => {
        expect(getTopSubject([{ subjects: [{ name: 'אנגלית', abs: 9 }] }])).toBeNull();
        expect(getTopSubject([{ subjects: [{ name: 'אנגלית', abs: 2 }, { name: 'תנ"ך', abs: 1 }] }])).toBeNull();
    });
});

describe('summarizeStudentReports', () => {
    it('sums lessons and absences per subject and lists absence dates newest first', () => {
        const lessons = new Map([['11', 'אנגלית']]);
        const { subjects, absences } = summarizeStudentReports(
            [
                { id: 1, lessonReferenceId: 11, howManyLessons: 2, absCount: 1, reportDate: '2026-10-01' },
                { id: 2, lessonReferenceId: 11, howManyLessons: 2, absCount: 0, reportDate: '2026-10-03' },
                { id: 3, lessonReferenceId: 11, howManyLessons: 1, absCount: 1, reportDate: '2026-10-05' },
            ],
            lessons,
        );
        expect(subjects).toEqual([{ key: '11', name: 'אנגלית', lessons: 5, abs: 2, ratio: 0.4 }]);
        expect(absences.map((a) => a.id)).toEqual([3, 1]);
    });
});

describe('getDetailDateRange', () => {
    it('narrows the report dates by the report month', () => {
        expect(
            getDetailDateRange(
                { fromDate: '2026-10-10' },
                { startDate: '2026-10-01T00:00:00.000Z', endDate: '2026-10-31T00:00:00.000Z' },
            ),
        ).toEqual({ from: '2026-10-10', to: '2026-10-31' });
        expect(getDetailDateRange({}, undefined)).toEqual({ from: undefined, to: undefined });
    });
});
