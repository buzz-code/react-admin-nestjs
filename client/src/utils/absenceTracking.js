// Pure helpers for the absence tracking page (src/pivots/AbsenceTrackingList.jsx).
// The page reads the existing StudentAttendance pivot; these turn its rows into per-student stats.

// A student this many unapproved absences (or fewer) away from the threshold counts as "near".
export const NEAR_THRESHOLD_ABSENCES = 3;

export const DEFAULT_THRESHOLD_PERCENT = 20;

const PIVOT_SUMMARY_KEYS = new Set([
    'total',
    'totalKnownAbsences',
    'unApprovedAbsences',
    'totalLessons',
    'absencePercentage',
    'totalAbsencePercentage',
]);

// Every page of the pivot carries its own headers on its first row; merge them into one lesson map.
export function getLessonHeaders(pages) {
    const lessons = new Map();
    pages.forEach((rows) => {
        (rows?.[0]?.headers ?? []).forEach((header) => {
            if (!PIVOT_SUMMARY_KEYS.has(header.value) && !lessons.has(header.value)) {
                const label = header.label && header.label !== 'undefined' ? header.label : 'ללא שיעור';
                lessons.set(header.value, label);
            }
        });
    });
    return lessons;
}

// How many more unapproved absences before reaching the threshold; 0 or less means at/over it.
export function getThresholdStatus(unapproved, lessons, thresholdRatio) {
    const allowed = Math.ceil(thresholdRatio * lessons - 1e-9);
    const left = allowed - unapproved;
    if (left <= 0) return { key: 'over', left };
    if (left <= NEAR_THRESHOLD_ABSENCES) return { key: 'near', left };
    return { key: 'ok', left };
}

export function getStudentStats(row, lessonHeaders, thresholdRatio) {
    const lessons = Number(row.totalLessons) || 0;
    const abs = Number(row.total) || 0;
    const approved = Number(row.totalKnownAbsences) || 0;
    const unapproved = Math.max(0, abs - approved);
    const subjects = [...lessonHeaders.entries()]
        .map(([key, name]) => ({ key, name, abs: Number(row[key]) || 0 }))
        .filter((subject) => subject.abs > 0)
        .sort((a, b) => b.abs - a.abs);
    return {
        id: row.id,
        name: row.name,
        tz: row.tz,
        hasReports: lessons > 0,
        lessons,
        abs,
        approved,
        unapproved,
        ratio: lessons ? unapproved / lessons : 0,
        subjects,
        status: lessons ? getThresholdStatus(unapproved, lessons, thresholdRatio) : { key: 'ok', left: 0 },
    };
}

const STATUS_ORDER = { over: 0, near: 1, ok: 2 };

// One group per base class, worst class first; students inside sorted by absence ratio, worst first.
export function groupByKlass(students, baseKlassByStudent, noKlassLabel) {
    const groups = new Map();
    students.forEach((student) => {
        const name = baseKlassByStudent[student.id] || noKlassLabel;
        if (!groups.has(name)) groups.set(name, { name, students: [] });
        groups.get(name).students.push(student);
    });
    const result = [...groups.values()].map((group) => {
        group.students.sort((a, b) => b.ratio - a.ratio || STATUS_ORDER[a.status.key] - STATUS_ORDER[b.status.key]);
        group.over = group.students.filter((s) => s.status.key === 'over').length;
        group.near = group.students.filter((s) => s.status.key === 'near').length;
        group.lessons = group.students.reduce((sum, s) => sum + s.lessons, 0);
        group.unapproved = group.students.reduce((sum, s) => sum + s.unapproved, 0);
        group.ratio = group.lessons ? group.unapproved / group.lessons : 0;
        return group;
    });
    return result.sort((a, b) => {
        if (a.name === noKlassLabel) return 1;
        if (b.name === noKlassLabel) return -1;
        return b.over - a.over || b.near - a.near || a.name.localeCompare(b.name, 'he');
    });
}

// The subject behind an unusually large share of the class's absences, if there is one.
export function getTopSubject(students, minShare = 0.25, minAbsences = 5) {
    const bySubject = new Map();
    let total = 0;
    students.forEach((student) =>
        student.subjects.forEach((subject) => {
            bySubject.set(subject.name, (bySubject.get(subject.name) ?? 0) + subject.abs);
            total += subject.abs;
        }),
    );
    if (bySubject.size < 2 || !total) return null;
    const [name, abs] = [...bySubject.entries()].sort((a, b) => b[1] - a[1])[0];
    const share = abs / total;
    return abs >= minAbsences && share >= minShare ? { name, abs, share } : null;
}

// Per-subject lessons/absences and the list of absence dates, from one student's att_report rows.
export function summarizeStudentReports(reports, lessonHeaders) {
    const bySubject = new Map();
    const absences = [];
    reports.forEach((report) => {
        const key = String(report.lessonReferenceId);
        const name = lessonHeaders.get(key) ?? 'ללא שיעור';
        if (!bySubject.has(key)) bySubject.set(key, { key, name, lessons: 0, abs: 0 });
        const subject = bySubject.get(key);
        subject.lessons += Number(report.howManyLessons) || 0;
        subject.abs += Number(report.absCount) || 0;
        if (Number(report.absCount) > 0) {
            absences.push({ id: report.id, date: report.reportDate, subject: name, count: Number(report.absCount) });
        }
    });
    const subjects = [...bySubject.values()]
        .map((subject) => ({ ...subject, ratio: subject.lessons ? subject.abs / subject.lessons : 0 }))
        .sort((a, b) => b.ratio - a.ratio);
    absences.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return { subjects, absences };
}

// Date range for the drill-down: the report's own dates, narrowed by the chosen report month.
export function getDetailDateRange(extra = {}, reportMonth) {
    const pickLater = (a, b) => (!a ? b : !b ? a : a > b ? a : b);
    const pickEarlier = (a, b) => (!a ? b : !b ? a : a < b ? a : b);
    const toDay = (value) => (value ? String(value).slice(0, 10) : undefined);
    return {
        from: pickLater(toDay(extra.fromDate), toDay(reportMonth?.startDate)),
        to: pickEarlier(toDay(extra.toDate), toDay(reportMonth?.endDate)),
    };
}

export const formatPercent = (ratio) => `${(ratio * 100).toFixed(1)}%`;
