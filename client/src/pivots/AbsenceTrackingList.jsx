import { useMemo, useState } from 'react';
import {
    DateInput,
    NullableBooleanInput,
    RecordContextProvider,
    TextInput,
    useDataProvider,
    useGetOne,
    useListContext,
    usePermissions,
} from 'react-admin';
import { useQuery } from '@tanstack/react-query';
import { Box, ButtonBase, Card, CircularProgress, TextField as MuiTextField, Typography } from '@mui/material';
import { CommonList } from '@shared/components/crudContainers/CommonList';
import { EmptyPage } from '@shared/components/crudContainers/EmptyPage';
import {
    CommonReferenceInputFilter,
    filterByUserId,
    filterByUserIdAndYear,
} from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import { CommonYearInputFilter } from '@shared/components/fields/CommonYear';
import { ShowMatchingRecordsButton } from '@shared/components/fields/ShowMatchingRecordsButton';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { filterArrayByParams } from '@shared/utils/filtersUtil';
import { useIsAdmin } from '@shared/utils/permissionsUtil';
import { MAX_PAGE_SIZE } from '@shared/config/settings';
import {
    DEFAULT_THRESHOLD_PERCENT,
    NEAR_THRESHOLD_ABSENCES,
    formatPercent,
    getDetailDateRange,
    getLessonHeaders,
    getStudentStats,
    getTopSubject,
    groupByKlass,
    summarizeStudentReports,
} from 'src/utils/absenceTracking';

// Reuses the StudentAttendance pivot as is; this page only changes how its numbers are shown.
const RESOURCE = 'student_by_year/pivot?extra.pivot=StudentAttendance';
const STORE_KEY = 'absence-tracking';
const THRESHOLD_STORAGE_KEY = 'absenceTracking.thresholdPercent';
const NO_KLASS_LABEL = 'ללא כיתת אם';
// The drill-down reads one student's reports page by page; this caps it for very long ranges.
const MAX_DETAIL_PAGES = 10;

const filters = [
    adminUserFilter,
    <TextInput source="name:$cont" label="שם תלמידה" alwaysOn />,
    <CommonReferenceInputFilter
        source="klassReferenceIds:$cont"
        label="כיתה"
        reference="klass"
        dynamicFilter={filterByUserIdAndYear}
        alwaysOn
    />,
    <CommonReferenceInputFilter
        source="extra.reportMonthReferenceId"
        label="תקופת דיווח"
        reference="report_month"
        dynamicFilter={filterByUserId}
        alwaysOn
    />,
    <DateInput source="extra.fromDate" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="extra.toDate" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter
        source="klassTypeReferenceIds:$cont"
        label="סוג כיתה"
        reference="klass_type"
        dynamicFilter={filterByUserId}
    />,
    <NullableBooleanInput source="isActive" label="תלמידה פעילה" />,
    <CommonReferenceArrayInput
        source="extra.excludedLessonIds"
        reference="lesson"
        label="הסר מקצועות מהדוח"
        dynamicFilter={filterByUserIdAndYear}
    />,
    <CommonYearInputFilter />,
];

const filterDefaultValues = {
    year: defaultYearFilter.year,
    isActive: true,
    extra: {},
};

const STATUS_STYLES = {
    over: { pill: { bgcolor: '#fde7e6', color: '#a5221a', fontWeight: 'bold' }, bar: '#d93a2e', text: '#a5221a' },
    near: { pill: { bgcolor: '#fff1dc', color: '#9a4a00', fontWeight: 'bold' }, bar: '#e98a15', text: '#9a4a00' },
    ok: { pill: { color: 'text.secondary' }, bar: '#8fb7a3', text: 'text.secondary' },
};

const readStoredThreshold = () => {
    try {
        const stored = Number(localStorage.getItem(THRESHOLD_STORAGE_KEY));
        return stored > 0 && stored <= 100 ? stored : DEFAULT_THRESHOLD_PERCENT;
    } catch {
        return DEFAULT_THRESHOLD_PERCENT;
    }
};

const chunk = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
    return chunks;
};

// The list context holds page 1 (the data provider caps a page at MAX_PAGE_SIZE); fetch the rest.
const useAllPivotRows = () => {
    const dataProvider = useDataProvider();
    const { data, total, filterValues, sort, isPending } = useListContext();
    const pageCount = Math.ceil((total ?? 0) / MAX_PAGE_SIZE);
    const { data: restPages, isPending: restPending } = useQuery({
        queryKey: [RESOURCE, 'absence-tracking-pages', filterValues, sort, pageCount],
        enabled: !isPending && pageCount > 1,
        queryFn: () =>
            Promise.all(
                Array.from({ length: pageCount - 1 }, (_, i) =>
                    dataProvider
                        .getList(RESOURCE, {
                            pagination: { page: i + 2, perPage: MAX_PAGE_SIZE },
                            sort,
                            filter: filterValues,
                        })
                        .then((result) => result.data),
                ),
            ),
    });
    const pages = useMemo(() => [data ?? [], ...(restPages ?? [])], [data, restPages]);
    return { pages, isPending: isPending || (pageCount > 1 && restPending) };
};

const useBaseKlasses = (studentIds, year) => {
    const dataProvider = useDataProvider();
    const { data } = useQuery({
        queryKey: ['student_base_klass', 'absence-tracking', studentIds, year],
        enabled: studentIds.length > 0,
        queryFn: () =>
            Promise.all(
                chunk(studentIds, MAX_PAGE_SIZE).map((ids) =>
                    dataProvider
                        .getList('student_base_klass', {
                            pagination: { page: 1, perPage: MAX_PAGE_SIZE },
                            sort: { field: 'id', order: 'ASC' },
                            filter: { id: ids, ...(year && { year }) },
                        })
                        .then((result) => result.data),
                ),
            ).then((results) => Object.fromEntries(results.flat().map((row) => [row.id, row.klassName]))),
    });
    return data ?? {};
};

const ThresholdInput = ({ value, onChange }) => (
    <MuiTextField
        id="absence-tracking-threshold"
        type="number"
        size="small"
        label="סף חיסורים (%)"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ min: 1, max: 100, step: 1 }}
        helperText="חיסורים לא מאושרים מתוך כל השיעורים"
        sx={{ width: 220 }}
    />
);

const SummaryTiles = ({ students, noReportsCount, thresholdPercent, status, onStatusChange }) => {
    const over = students.filter((s) => s.status.key === 'over').length;
    const near = students.filter((s) => s.status.key === 'near').length;
    const lessons = students.reduce((sum, s) => sum + s.lessons, 0);
    const unapproved = students.reduce((sum, s) => sum + s.unapproved, 0);
    const approved = students.reduce((sum, s) => sum + s.approved, 0);
    const tiles = [
        {
            key: '',
            label: 'תלמידות בדוח',
            value: students.length,
            hint: noReportsCount ? `ועוד ${noReportsCount} בלי דיווחים בתקופה` : 'לחיצה מציגה את כולן',
        },
        { key: 'over', label: 'עברו את הסף', value: over, hint: `${thresholdPercent}% חיסורים לא מאושרים ומעלה`, color: STATUS_STYLES.over.text },
        { key: 'near', label: 'קרובות לסף', value: near, hint: `עוד 1–${NEAR_THRESHOLD_ABSENCES} חיסורים ויעברו`, color: STATUS_STYLES.near.text },
        {
            label: 'אחוז חיסור כללי',
            value: lessons ? formatPercent(unapproved / lessons) : '–',
            hint: `${unapproved} חיסורים לא מאושרים · ${approved} מאושרים`,
        },
    ];
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 2, mb: 2 }}>
            {tiles.map((tile) => {
                const clickable = tile.key !== undefined;
                const selected = clickable && status === tile.key;
                return (
                    <Card
                        key={tile.label}
                        variant="outlined"
                        component={clickable ? ButtonBase : 'div'}
                        onClick={clickable ? () => onStatusChange(status === tile.key ? '' : tile.key) : undefined}
                        aria-pressed={clickable ? selected : undefined}
                        sx={{
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            textAlign: 'start',
                            ...(selected && { borderColor: 'primary.main', boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}` }),
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">{tile.label}</Typography>
                        <Typography sx={{ fontSize: 30, fontWeight: 'bold', fontVariantNumeric: 'tabular-nums', color: tile.color }}>
                            {tile.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{tile.hint}</Typography>
                    </Card>
                );
            })}
        </Box>
    );
};

const leftText = ({ key, left }) => {
    if (key === 'over') return left === 0 ? 'הגיעה לסף' : `${-left} מעל הסף`;
    return left === 1 ? 'עוד חיסור אחד לסף' : `עוד ${left} חיסורים לסף`;
};

const ThresholdMeter = ({ student, thresholdRatio }) => {
    const style = STATUS_STYLES[student.status.key];
    const scaleMax = Math.max(0.4, thresholdRatio * 2);
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ minWidth: 56, textAlign: 'center', px: 1, borderRadius: 999, fontSize: 14, fontVariantNumeric: 'tabular-nums', ...style.pill }}>
                    {formatPercent(student.ratio)}
                </Box>
                <Typography variant="caption" sx={{ color: style.text, fontWeight: student.status.key === 'ok' ? 400 : 600, whiteSpace: 'nowrap' }}>
                    {leftText(student.status)}
                </Typography>
            </Box>
            <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: 'action.hover' }} aria-hidden>
                <Box sx={{ position: 'absolute', insetBlock: 0, insetInlineStart: 0, borderRadius: 3, bgcolor: style.bar, width: `${Math.min(100, (student.ratio / scaleMax) * 100)}%` }} />
                <Box sx={{ position: 'absolute', top: -3, bottom: -3, width: 2, bgcolor: 'text.primary', opacity: 0.5, insetInlineStart: `${(thresholdRatio / scaleMax) * 100}%` }} />
            </Box>
        </Box>
    );
};

const chipSx = {
    fontSize: 12.5,
    border: 1,
    borderColor: 'divider',
    borderRadius: 999,
    px: 1,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
};

const SubjectChips = ({ subjects }) => {
    if (!subjects.length) {
        return <Box component="span" sx={{ ...chipSx, color: 'text.secondary', borderStyle: 'dashed' }}>ללא חיסורים</Box>;
    }
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minWidth: 0 }}>
            {subjects.slice(0, 4).map((subject, index) => (
                <Box
                    component="span"
                    key={subject.key}
                    sx={{ ...chipSx, ...(index === 0 && subject.abs >= 3 && { borderColor: 'transparent', ...STATUS_STYLES.over.pill, fontWeight: 600 }) }}
                >
                    {subject.name} {subject.abs}
                </Box>
            ))}
            {subjects.length > 4 && (
                <Box component="span" sx={{ ...chipSx, color: 'text.secondary', borderStyle: 'dashed' }}>+{subjects.length - 4}</Box>
            )}
        </Box>
    );
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('he-IL') : '');

const StudentDetail = ({ student, lessonHeaders }) => {
    const dataProvider = useDataProvider();
    const { filterValues } = useListContext();
    const reportMonthId = filterValues?.extra?.reportMonthReferenceId;
    const { data: reportMonth, isPending: monthPending } = useGetOne('report_month', { id: reportMonthId }, { enabled: !!reportMonthId });
    const range = getDetailDateRange(filterValues?.extra, reportMonth);
    const filter = {
        studentReferenceId: student.id,
        ...(filterValues?.year && { year: filterValues.year }),
        ...(filterValues?.['klassReferenceIds:$cont'] && { klassReferenceId: filterValues['klassReferenceIds:$cont'] }),
        ...(range.from && { 'reportDate:$gte': range.from }),
        ...(range.to && { 'reportDate:$lte': range.to }),
    };
    const { data: reports, isPending } = useQuery({
        queryKey: ['att_report', 'absence-tracking-detail', filter],
        enabled: !reportMonthId || !monthPending,
        queryFn: async () => {
            const rows = [];
            for (let page = 1; page <= MAX_DETAIL_PAGES; page++) {
                const result = await dataProvider.getList('att_report', {
                    pagination: { page, perPage: MAX_PAGE_SIZE },
                    sort: { field: 'reportDate', order: 'DESC' },
                    filter,
                });
                rows.push(...result.data);
                if (rows.length >= result.total || !result.data.length) break;
            }
            return rows;
        },
    });

    if (isPending) {
        return <CircularProgress size={20} sx={{ m: 2 }} />;
    }
    const { subjects, absences } = summarizeStudentReports(reports ?? [], lessonHeaders);
    const cell = { py: 0.25, px: 0.75, borderBottom: 1, borderColor: 'divider', textAlign: 'start' };

    return (
        <Box sx={{ borderTop: 1, borderStyle: 'dashed', borderColor: 'divider', bgcolor: 'action.hover', px: 2, py: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(0, 1fr)' }, gap: 2 }}>
            <Box sx={{ minWidth: 0, overflowX: 'auto' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>פירוט לפי מקצוע</Typography>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, fontVariantNumeric: 'tabular-nums' }}>
                    <thead>
                        <tr>
                            {['מקצוע', 'שיעורים', 'חיסורים', 'אחוז'].map((label) => (
                                <Box component="th" key={label} sx={{ ...cell, color: 'text.secondary', fontWeight: 600 }}>{label}</Box>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subject) => (
                            <tr key={subject.key}>
                                <Box component="td" sx={cell}>{subject.name}</Box>
                                <Box component="td" sx={cell}>{subject.lessons}</Box>
                                <Box component="td" sx={cell}>{subject.abs}</Box>
                                <Box component="td" sx={cell}>{formatPercent(subject.ratio)}</Box>
                            </tr>
                        ))}
                    </tbody>
                </Box>
                <Typography variant="caption" color="text.secondary">כולל חיסורים מאושרים</Typography>
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>חיסורים אחרונים</Typography>
                {absences.length ? (
                    <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        {absences.slice(0, 10).map((absence) => (
                            <Typography component="li" variant="body2" key={absence.id}>
                                {formatDate(absence.date)} · {absence.subject}{absence.count > 1 ? ` (${absence.count})` : ''}
                            </Typography>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2">אין חיסורים בתקופה</Typography>
                )}
                <RecordContextProvider value={{ id: student.id }}>
                    <Box sx={{ mt: 1 }}>
                        <ShowMatchingRecordsButton resource="att_report" filter={filter} />
                    </Box>
                </RecordContextProvider>
            </Box>
        </Box>
    );
};

const StudentRow = ({ student, thresholdRatio, lessonHeaders, open, onToggle }) => (
    <>
        <Box
            role="button"
            tabIndex={0}
            aria-expanded={open}
            onClick={onToggle}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggle();
                }
            }}
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr) minmax(0, 1.1fr)', sm: 'minmax(0, 1.2fr) minmax(0, 1.4fr) minmax(0, 1.6fr)' },
                gap: 1.5,
                alignItems: 'center',
                px: 2,
                py: 1,
                borderTop: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineStyle: 'solid' },
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{student.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {student.unapproved} חיסורים מתוך {student.lessons} שיעורים{student.approved ? ` · ${student.approved} מאושרים` : ''}
                </Typography>
            </Box>
            <ThresholdMeter student={student} thresholdRatio={thresholdRatio} />
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, minWidth: 0 }}>
                <SubjectChips subjects={student.subjects} />
            </Box>
        </Box>
        {open && <StudentDetail student={student} lessonHeaders={lessonHeaders} />}
    </>
);

const KlassCard = ({ group, thresholdRatio, lessonHeaders, openIds, onToggle }) => {
    const topSubject = getTopSubject(group.all);
    return (
        <Card variant="outlined" sx={{ breakInside: 'avoid', mb: 2, borderRadius: 3 }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: 17 }}>{group.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {group.all.length} תלמידות · ממוצע {formatPercent(group.ratio)}
                        {group.over > 0 && <Box component="b" sx={{ color: STATUS_STYLES.over.text }}> · {group.over} מעל הסף</Box>}
                        {group.near > 0 && <Box component="b" sx={{ color: STATUS_STYLES.near.text }}> · {group.near} קרובות</Box>}
                    </Typography>
                </Box>
                {topSubject && (
                    <Typography variant="body2" sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 1.25, py: 0.5 }}>
                        הכי הרבה חיסורים בכיתה: <b>{topSubject.name}</b> – {topSubject.abs} חיסורים, {Math.round(topSubject.share * 100)}% מכל החיסורים בכיתה
                    </Typography>
                )}
            </Box>
            {group.students.map((student) => (
                <StudentRow
                    key={student.id}
                    student={student}
                    thresholdRatio={thresholdRatio}
                    lessonHeaders={lessonHeaders}
                    open={openIds.has(student.id)}
                    onToggle={() => onToggle(student.id)}
                />
            ))}
        </Card>
    );
};

const AbsenceTrackingView = () => {
    const { filterValues } = useListContext();
    const { pages, isPending } = useAllPivotRows();
    const [thresholdInput, setThresholdInput] = useState(readStoredThreshold);
    const [status, setStatus] = useState('');
    const [openIds, setOpenIds] = useState(() => new Set());

    const parsedThreshold = Number(thresholdInput);
    const thresholdPercent = parsedThreshold > 0 && parsedThreshold <= 100 ? parsedThreshold : DEFAULT_THRESHOLD_PERCENT;
    const thresholdRatio = thresholdPercent / 100;

    const rows = useMemo(() => pages.flat(), [pages]);
    const lessonHeaders = useMemo(() => getLessonHeaders(pages), [pages]);
    const studentIds = useMemo(() => rows.map((row) => row.id), [rows]);
    const baseKlassByStudent = useBaseKlasses(studentIds, filterValues?.year);

    const allStudents = rows.map((row) => getStudentStats(row, lessonHeaders, thresholdRatio));
    const students = allStudents.filter((s) => s.hasReports);
    const groups = groupByKlass(students, baseKlassByStudent, NO_KLASS_LABEL)
        .map((group) => ({ ...group, all: group.students, students: status ? group.students.filter((s) => s.status.key === status) : group.students }))
        .filter((group) => group.students.length);

    const handleThresholdChange = (value) => {
        setThresholdInput(value);
        try {
            if (Number(value) > 0 && Number(value) <= 100) localStorage.setItem(THRESHOLD_STORAGE_KEY, String(Number(value)));
        } catch {
            // Storage blocked: the threshold still works for this visit.
        }
    };
    const toggleOpen = (id) =>
        setOpenIds((current) => {
            const next = new Set(current);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
                    אחוז החיסור הוא חיסורים לא מאושרים מתוך כל השיעורים בתקופה. תלמידה שעברה את הסף מסומנת באדום, ותלמידה
                    שחסרים לה עד {NEAR_THRESHOLD_ABSENCES} חיסורים לסף מסומנת בכתום. לחיצה על תלמידה פותחת פירוט.
                </Typography>
                <ThresholdInput value={thresholdInput} onChange={handleThresholdChange} />
            </Box>
            {isPending ? (
                <CircularProgress size={28} sx={{ m: 2 }} />
            ) : (
                <>
                    <SummaryTiles
                        students={students}
                        noReportsCount={allStudents.length - students.length}
                        thresholdPercent={thresholdPercent}
                        status={status}
                        onStatusChange={setStatus}
                    />
                    {groups.length ? (
                        <Box sx={{ columnWidth: 560, columnGap: 2 }}>
                            {groups.map((group) => (
                                <KlassCard
                                    key={group.name}
                                    group={group}
                                    thresholdRatio={thresholdRatio}
                                    lessonHeaders={lessonHeaders}
                                    openIds={openIds}
                                    onToggle={toggleOpen}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">אין תלמידות שמתאימות לסינון.</Typography>
                    )}
                </>
            )}
        </Box>
    );
};

const AbsenceTrackingList = () => {
    const isAdmin = useIsAdmin();
    const { permissions } = usePermissions();
    const filtersArr = filterArrayByParams(filters, { isAdmin, permissions });

    return (
        <CommonList
            resource={RESOURCE}
            storeKey={STORE_KEY}
            title="מעקב חיסורים"
            filters={filtersArr}
            filterDefaultValues={filterDefaultValues}
            exporter={false}
            empty={<EmptyPage />}
            sort={{ field: 'id', order: 'ASC' }}
            configurable={false}
            perPage={MAX_PAGE_SIZE}
            pagination={false}
        >
            <AbsenceTrackingView />
        </CommonList>
    );
};

export default AbsenceTrackingList;
