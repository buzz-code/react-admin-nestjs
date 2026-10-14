const ISRAEL_TIMEZONE = 'Asia/Jerusalem';

const timeToMinutes = (time) => {
    const [hours, minutes] = String(time).split(':').map(Number);
    return hours * 60 + minutes;
};

// Date (YYYY-MM-DD) and minutes since midnight of a timestamp, in Israel time.
const getIsraelDateAndMinutes = (value) => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: ISRAEL_TIMEZONE,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        }).formatToParts(new Date(value)).map(({ type, value }) => [type, value])
    );
    return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
};

const toDateOnly = (value) => String(value).slice(0, 10);

const getWeekday = (dateOnly) => new Date(`${dateOnly}T00:00:00Z`).getUTCDay();

// The day's lessons from the lessonTimes setting, sorted by start time.
export function getDayPeriods(lessonTimes, dateOnly) {
    const weekday = getWeekday(dateOnly);
    const group = lessonTimes.find((item) => Array.isArray(item?.days) && item.days.map(Number).includes(weekday));
    return (Array.isArray(group?.periods) ? group.periods : [])
        .filter((period) => period?.start && period?.end)
        .map((period) => ({ start: period.start, end: period.end, startMinutes: timeToMinutes(period.start) }))
        .sort((a, b) => a.startMinutes - b.startMinutes)
        .map((period, index) => ({ ...period, number: index + 1 }));
}

// A report belongs to the last lesson that started at or before it (a report in the break counts for the lesson before).
// Reports entered on another day than their report date, or before the first lesson, belong to no lesson.
const getPeriodIndex = (row, periods) => {
    const { date, minutes } = getIsraelDateAndMinutes(row.reportHour);
    if (date !== toDateOnly(row.reportDate)) {
        return -1;
    }
    return periods.findLastIndex((period) => period.startMinutes <= minutes);
};

// The class's lessons with an empty slot ({ isGap: true, period, reportDate }) before each reported lesson
// that comes after one or more unreported lessons of the same day. Nothing is added after the last report of the day.
// A lesson is placed by the time it was reported, so a report entered late counts for the lesson it was entered in.
export function withLessonGaps(lessons, lessonTimes) {
    if (!Array.isArray(lessonTimes) || !lessonTimes.length) {
        return lessons;
    }
    const result = [];
    // Rows are sorted by report time, so a late entry for another date can come in between; track each date separately.
    const lastIndexByDate = new Map();
    lessons.forEach((row) => {
        const reportDate = toDateOnly(row.reportDate);
        const periods = getDayPeriods(lessonTimes, reportDate);
        const index = getPeriodIndex(row, periods);
        const lastIndex = lastIndexByDate.get(reportDate) ?? -1;
        if (index > lastIndex) {
            if (lastIndex >= 0) {
                periods.slice(lastIndex + 1, index).forEach((period) => {
                    result.push({ isGap: true, id: `gap_${reportDate}_${period.number}`, reportDate: row.reportDate, period });
                });
            }
            lastIndexByDate.set(reportDate, index);
        }
        result.push(row);
    });
    return result;
}
