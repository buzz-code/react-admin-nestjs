import { useState } from 'react';
import { DateInput, ReferenceField, RecordContextProvider, TextField, useGetList, useListContext, usePermissions } from 'react-admin';
import { Box, ButtonBase, Card, CircularProgress, Popover, Typography } from '@mui/material';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonList } from '@shared/components/crudContainers/CommonList';
import { EmptyPage } from '@shared/components/crudContainers/EmptyPage';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';
import { filterArrayByParams } from '@shared/utils/filtersUtil';
import { useIsAdmin } from '@shared/utils/permissionsUtil';
import { MAX_PAGE_SIZE } from '@shared/config/settings';

// This is a card view, not a table, so cap high rather than paginate at 10 rows.
const LIST_PAGE_SIZE = 1000;

const ISRAEL_TIMEZONE = 'Asia/Jerusalem';
const todayDateOnly = new Date().toLocaleDateString('en-CA', { timeZone: ISRAEL_TIMEZONE });

const filters = [
    adminUserFilter,
    <DateInput source="reportDate:$gte" label="מתאריך" alwaysOn />,
    <DateInput source="reportDate:$lte" label="עד תאריך" alwaysOn />,
];

const filterDefaultValues = {
    'reportDate:$gte': todayDateOnly,
    'reportDate:$lte': todayDateOnly,
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('he-IL', { timeZone: ISRAEL_TIMEZONE }) : '');
const formatHour = (value) => (value ? new Date(value).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: ISRAEL_TIMEZONE }) : '');

const NO_KLASS_KEY = 'none';

// A lesson with this many missing girls or more is highlighted in red; fewer (but some) in orange.
const HIGH_MISSING_THRESHOLD = 5;

const missingCount = (row) => Number(row.missingGirlsCount) || 0;

const missingPillSx = (count) => ({
    display: 'inline-block',
    minWidth: 32,
    textAlign: 'center',
    px: 1,
    borderRadius: 999,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
    ...(count === 0
        ? { color: 'text.secondary' }
        : count >= HIGH_MISSING_THRESHOLD
            ? { bgcolor: '#fde7e6', color: '#a5221a', fontWeight: 'bold' }
            : { bgcolor: '#fff1dc', color: '#9a4a00', fontWeight: 500 }),
});

// The view has one row per lesson taught (already sorted by reportHour); group them into one card per class.
function groupByKlass(rows) {
    const klasses = new Map();
    rows.forEach((row) => {
        // Lessons without a class are grouped per user, so an admin never sees two users' rows in one card.
        const key = row.klassReferenceId ?? `${NO_KLASS_KEY}_${row.userId}`;
        if (!klasses.has(key)) {
            klasses.set(key, { key, klassReferenceId: row.klassReferenceId, userId: row.userId, lessons: [] });
        }
        klasses.get(key).lessons.push(row);
    });
    return [...klasses.values()].sort((a, b) => {
        if (!a.klassReferenceId) return 1;
        if (!b.klassReferenceId) return -1;
        return a.klassReferenceId - b.klassReferenceId;
    });
}

// The same subject taught twice in a day shows as two rows; a row's reports end where the next one's begin.
const nextLessonStart = (row, lessons) => lessons.find((other) =>
    other.teacherReferenceId === row.teacherReferenceId
    && other.lessonReferenceId === row.lessonReferenceId
    && other.reportDate === row.reportDate
    && other.reportHour > row.reportHour
)?.reportHour;

const MissingGirlsList = ({ row, until }) => {
    const filter = {
        teacherReferenceId: row.teacherReferenceId,
        klassReferenceId: row.klassReferenceId,
        lessonReferenceId: row.lessonReferenceId,
        'reportDate:$eq': row.reportDate,
        'absCount:$gt': 0,
        'createdAt:$gte': row.reportHour,
        ...(until && { 'createdAt:$lt': until }),
    };
    const { data, isPending } = useGetList('att_report', { filter, pagination: { page: 1, perPage: MAX_PAGE_SIZE }, sort: { field: 'id', order: 'ASC' } });
    if (isPending) {
        return <CircularProgress size={20} sx={{ m: 2 }} />;
    }
    const studentIds = [...new Set((data || []).map((report) => report.studentReferenceId))];
    return (
        <Box component="ol" sx={{ m: 0, py: 1, px: 4, minWidth: 180 }}>
            {studentIds.map((studentReferenceId) => (
                <Typography component="li" variant="body2" key={studentReferenceId} sx={{ py: 0.25 }}>
                    <RecordContextProvider value={{ studentReferenceId }}>
                        <ReferenceField source="studentReferenceId" reference="student" link={false}>
                            <TextField source="name" />
                        </ReferenceField>
                    </RecordContextProvider>
                </Typography>
            ))}
        </Box>
    );
};

// Names are fetched only when the count is clicked, so opening the report stays one query.
const MissingGirls = ({ row, until }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const count = missingCount(row);
    if (count === 0) {
        return <Box component="span" sx={missingPillSx(count)} title="מספר בנות שחסרו">–</Box>;
    }
    return (
        <>
            <ButtonBase onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ ...missingPillSx(count), cursor: 'pointer' }} title="הצגת שמות הבנות שחסרו">
                {count}
            </ButtonBase>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5 }}>בנות שחסרו</Typography>
                <MissingGirlsList row={row} until={until} />
            </Popover>
        </>
    );
};

const sumMissing = (rows) => rows.reduce((sum, row) => sum + missingCount(row), 0);

const SummaryTiles = ({ rows, klassCount }) => {
    const tiles = [
        { label: 'שיעורים שדווחו', value: rows.length },
        { label: 'כיתות', value: klassCount },
        { label: 'מורות', value: new Set(rows.map((row) => row.teacherReferenceId)).size },
        { label: 'סה״כ חסרות', value: sumMissing(rows) },
    ];
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2, mb: 2 }}>
            {tiles.map((tile) => (
                <Card key={tile.label} variant="outlined" sx={{ px: 2.5, py: 2, borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">{tile.label}</Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{tile.value}</Typography>
                </Card>
            ))}
        </Box>
    );
};

const LessonRow = ({ row, showDate, until }) => {
    return (
        <RecordContextProvider value={row}>
            <Box sx={{ display: 'grid', gridTemplateColumns: showDate ? '96px minmax(0, 1fr) minmax(0, 1fr) 44px' : '48px minmax(0, 1fr) minmax(0, 1fr) 44px', gap: 1.5, alignItems: 'center', px: 2, py: 1.25, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                    {showDate && `${formatDate(row.reportDate)} `}{formatHour(row.reportHour)}
                </Typography>
                <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>
                    {row.lessonReferenceId ? (
                        <ReferenceField source="lessonReferenceId" reference="lesson" link={false}>
                            <TextField source="name" />
                        </ReferenceField>
                    ) : 'ללא שיוך שיעור'}
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                    <ReferenceField source="teacherReferenceId" reference="teacher" link={false}>
                        <TextField source="name" />
                    </ReferenceField>
                </Typography>
                <MissingGirls row={row} until={until} />
            </Box>
        </RecordContextProvider>
    );
};

const TeacherReportCards = ({ isAdmin }) => {
    const { data, total, filterValues } = useListContext();
    const rows = data || [];
    const klasses = groupByKlass(rows);
    // Show the date on each row unless the filter is a single day.
    const showDate = !filterValues?.['reportDate:$gte'] || filterValues['reportDate:$gte'] !== filterValues['reportDate:$lte'];

    return (
        <Box sx={{ p: 1 }}>
            {total > rows.length && (
                <Typography variant="body2" color="warning.dark" sx={{ mb: 1 }}>
                    מוצגים {rows.length} מתוך {total} שיעורים. צמצמו את טווח התאריכים כדי לראות את כולם.
                </Typography>
            )}
            <SummaryTiles rows={rows} klassCount={klasses.length} />
            <Box sx={{ columnWidth: 340, columnGap: 2 }}>
                {klasses.map((klass) => {
                    const lessonCount = klass.lessons.length;
                    return (
                        <Card key={klass.key} variant="outlined" sx={{ breakInside: 'avoid', mb: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, px: 2, py: 1.5 }}>
                                <Typography component="div" sx={{ fontWeight: 'bold', fontSize: 17 }}>
                                    {klass.klassReferenceId ? (
                                        <RecordContextProvider value={{ klassReferenceId: klass.klassReferenceId }}>
                                            <ReferenceField source="klassReferenceId" reference="klass">
                                                <TextField source="name" sx={{ fontWeight: 'bold', fontSize: 17 }} />
                                            </ReferenceField>
                                        </RecordContextProvider>
                                    ) : 'ללא כיתה'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {lessonCount === 1 ? 'שיעור אחד' : `${lessonCount} שיעורים`} · חסרו {sumMissing(klass.lessons)}
                                </Typography>
                            </Box>
                            {isAdmin && (
                                <RecordContextProvider value={{ userId: klass.userId }}>
                                    <Box sx={{ px: 2, pb: 1 }}>
                                        <ReferenceField source="userId" reference="user" />
                                    </Box>
                                </RecordContextProvider>
                            )}
                            {klass.lessons.map((row) => (
                                <LessonRow key={row.id} row={row} showDate={showDate} until={nextLessonStart(row, klass.lessons)} />
                            ))}
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
};

const Datagrid = ({ isAdmin }) => <TeacherReportCards isAdmin={isAdmin} />;

// Card view has no pagination footer, so fetch everything up front instead of the default 10-row page.
// Mirrors CommonEntity's own List wiring, which likewise only forwards `filter`.
const List = ({ filter = {} }) => {
    const isAdmin = useIsAdmin();
    const { permissions } = usePermissions();
    const filtersArr = filterArrayByParams(filters, { isAdmin, permissions });

    return (
        <CommonList
            filter={filter}
            filters={filtersArr}
            filterDefaultValues={filterDefaultValues}
            exporter={false}
            empty={<EmptyPage />}
            sort={{ field: 'reportHour', order: 'ASC' }}
            configurable={false}
            perPage={LIST_PAGE_SIZE}
            pagination={false}
        >
            <Datagrid isAdmin={isAdmin} />
        </CommonList>
    );
};

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
    exporter: false,
    configurable: false,
    sort: { field: 'reportHour', order: 'ASC' },
};

export default { ...getResourceComponents(entity), list: List };
