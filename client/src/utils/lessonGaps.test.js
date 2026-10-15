import { getDayPeriods, withLessonGaps } from './lessonGaps';

// 2026-10-14 is a Wednesday (weekday 3); Israel is UTC+3 on that date.
const lessonTimes = [
    {
        days: [0, 1, 2, 3, 4],
        periods: [
            { start: '08:00', end: '08:45' },
            { start: '08:45', end: '09:30' },
            { start: '09:45', end: '10:30' },
            { start: '10:30', end: '11:15' },
            { start: '11:15', end: '12:00' },
        ],
    },
    { days: [5], periods: [{ start: '08:00', end: '08:45' }] },
];

const lesson = (id, reportHour, reportDate = '2026-10-14') => ({ id, reportDate, reportHour });

describe('getDayPeriods', () => {
    it('picks the group of the weekday and numbers lessons by start time', () => {
        const periods = getDayPeriods([{ days: ['3'], periods: [{ start: '09:00', end: '09:45' }, { start: '08:00', end: '08:45' }] }], '2026-10-14');
        expect(periods.map((period) => [period.number, period.start])).toEqual([[1, '08:00'], [2, '09:00']]);
    });

    it('returns no lessons for a day without a group', () => {
        expect(getDayPeriods(lessonTimes, '2026-10-17')).toEqual([]);
    });
});

describe('withLessonGaps', () => {
    it('returns the lessons unchanged when no lesson times are set', () => {
        const lessons = [lesson(1, '2026-10-14T05:10:00Z'), lesson(2, '2026-10-14T08:00:00Z')];
        expect(withLessonGaps(lessons, [])).toBe(lessons);
        expect(withLessonGaps(lessons, undefined)).toBe(lessons);
    });

    it('adds an empty slot for each unreported lesson between reported ones', () => {
        // 08:10 is lesson 1, 11:20 is lesson 5: lessons 2-4 were skipped.
        const result = withLessonGaps([lesson(1, '2026-10-14T05:10:00Z'), lesson(2, '2026-10-14T08:20:00Z')], lessonTimes);
        expect(result.map((row) => (row.isGap ? `gap${row.period.number}` : row.id))).toEqual([1, 'gap2', 'gap3', 'gap4', 2]);
    });

    it('counts a report in the break for the lesson before it', () => {
        // 09:35 is the break after lesson 2, 09:50 is lesson 3: nothing skipped.
        const result = withLessonGaps([lesson(1, '2026-10-14T05:50:00Z'), lesson(2, '2026-10-14T06:35:00Z'), lesson(3, '2026-10-14T06:50:00Z')], lessonTimes);
        expect(result.some((row) => row.isGap)).toBe(false);
    });

    it('adds nothing before the first or after the last report of the day', () => {
        const result = withLessonGaps([lesson(1, '2026-10-14T06:50:00Z')], lessonTimes);
        expect(result).toEqual([lesson(1, '2026-10-14T06:50:00Z')]);
    });

    it('does not add a slot between two reports of the same lesson', () => {
        const result = withLessonGaps([lesson(1, '2026-10-14T05:10:00Z'), lesson(2, '2026-10-14T05:30:00Z')], lessonTimes);
        expect(result.some((row) => row.isGap)).toBe(false);
    });

    it('ignores reports entered on another day than their report date', () => {
        // Report for the 13th entered on the 14th at 11:20 must not open a gap on either day.
        const result = withLessonGaps([
            lesson(1, '2026-10-13T05:10:00Z', '2026-10-13'),
            lesson(2, '2026-10-14T05:10:00Z'),
            lesson(3, '2026-10-14T08:20:00Z', '2026-10-13'),
        ], lessonTimes);
        expect(result.some((row) => row.isGap)).toBe(false);
    });

    it('tracks each date separately', () => {
        const result = withLessonGaps([
            lesson(1, '2026-10-13T05:10:00Z', '2026-10-13'),
            lesson(2, '2026-10-14T05:10:00Z'),
            lesson(3, '2026-10-14T06:50:00Z'),
        ], lessonTimes);
        expect(result.map((row) => (row.isGap ? `gap${row.period.number}` : row.id))).toEqual([1, 2, 'gap2', 3]);
    });

    it('accepts report dates serialized as full timestamps', () => {
        const result = withLessonGaps([lesson(1, '2026-10-14T05:10:00Z', '2026-10-14T00:00:00.000Z'), lesson(2, '2026-10-14T06:50:00Z', '2026-10-14T00:00:00.000Z')], lessonTimes);
        expect(result.filter((row) => row.isGap).map((row) => row.period.number)).toEqual([2]);
    });

    it('places a report entered late by the time it was entered', () => {
        // Lesson 1 at 08:10, lesson 3 at 09:55, then lesson 2 reported late at 10:20 counts as lesson 3.
        const result = withLessonGaps([lesson(1, '2026-10-14T05:10:00Z'), lesson(2, '2026-10-14T06:55:00Z'), lesson(3, '2026-10-14T07:20:00Z')], lessonTimes);
        expect(result.map((row) => (row.isGap ? `gap${row.period.number}` : row.id))).toEqual([1, 'gap2', 2, 3]);
    });

    it('ignores malformed lesson times', () => {
        const lessons = [lesson(1, '2026-10-14T05:10:00Z'), lesson(2, '2026-10-14T08:20:00Z')];
        expect(withLessonGaps(lessons, 'bad')).toBe(lessons);
        expect(withLessonGaps(lessons, [{ days: '3', periods: 'x' }, null])).toEqual(lessons);
    });
});
