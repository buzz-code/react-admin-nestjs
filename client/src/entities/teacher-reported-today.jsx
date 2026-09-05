import { ChipField, DateInput, ReferenceField, RecordContextProvider, TextField, useListContext, usePermissions } from 'react-admin';
import { Badge, Box, Card, CardContent, Typography } from '@mui/material';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonList } from '@shared/components/crudContainers/CommonList';
import { EmptyPage } from '@shared/components/crudContainers/EmptyPage';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';
import { filterArrayByParams } from '@shared/utils/filtersUtil';
import { useIsAdmin } from '@shared/utils/permissionsUtil';

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

// The view has one row per teacher+lesson+date+klass; group rows sharing the same
// teacher+date+klass into a single card, collecting their lesson rows.
function groupByTeacherAndDate(rows) {
    const groups = new Map();
    rows.forEach((row) => {
        const key = `${row.userId}_${row.teacherReferenceId}_${row.reportDate}_${row.klassReferenceId ?? NO_KLASS_KEY}`;
        if (!groups.has(key)) {
            groups.set(key, { ...row, lessonRows: [] });
        }
        if (row.lessonReferenceId) {
            groups.get(key).lessonRows.push(row);
        }
    });
    return [...groups.values()];
}

// Split teacher cards into one column per class, so reports are easy to scan by class.
function groupByKlass(groups) {
    const columns = new Map();
    groups.forEach((group) => {
        const key = group.klassReferenceId ?? NO_KLASS_KEY;
        if (!columns.has(key)) {
            columns.set(key, { klassReferenceId: group.klassReferenceId, groups: [] });
        }
        columns.get(key).groups.push(group);
    });
    return [...columns.values()].sort((a, b) => {
        if (!a.klassReferenceId) return 1;
        if (!b.klassReferenceId) return -1;
        return a.klassReferenceId - b.klassReferenceId;
    });
}

// Total missing girls for the whole card: sum across its lessons, or the card's own
// count when it has no per-lesson breakdown (the "ללא שיוך שיעור" case).
function getTotalMissingGirls(group) {
    return group.lessonRows.length > 0
        ? group.lessonRows.reduce((sum, row) => sum + (row.missingGirlsCount || 0), 0)
        : group.missingGirlsCount || 0;
}

const TeacherReportCards = ({ isAdmin }) => {
    const { data } = useListContext();
    const groups = groupByTeacherAndDate(data || []);
    const columns = groupByKlass(groups);

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, padding: 1, alignItems: 'flex-start', overflowX: 'auto' }}>
            {columns.map((column) => (
                <Box key={column.klassReferenceId ?? NO_KLASS_KEY} sx={{ minWidth: 220, flex: '0 0 220px' }}>
                    <Typography variant="subtitle2" sx={{ marginBottom: 0.5 }}>
                        {column.klassReferenceId ? (
                            <RecordContextProvider value={{ klassReferenceId: column.klassReferenceId }}>
                                <ReferenceField source="klassReferenceId" reference="klass">
                                    <TextField source="name" />
                                </ReferenceField>
                            </RecordContextProvider>
                        ) : 'ללא כיתה'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {column.groups.map((group) => {
                            const totalMissingGirls = getTotalMissingGirls(group);
                            return (
                                <RecordContextProvider key={group.id} value={group}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    <ReferenceField source="teacherReferenceId" reference="teacher">
                                                        <TextField source="name" />
                                                    </ReferenceField>
                                                </Typography>
                                                {totalMissingGirls > 0 && (
                                                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }} title="מספר בנות שחסרו">
                                                        חסרו {totalMissingGirls}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                {isAdmin && <ReferenceField source="userId" reference="user" />}
                                                <Typography variant="caption" color="text.secondary">{formatDate(group.reportDate)}</Typography>
                                                <Typography variant="caption" color="text.secondary">{formatHour(group.reportHour)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', marginTop: 0.5 }}>
                                                {group.lessonRows.length > 0 ? (
                                                    group.lessonRows.map((row) => (
                                                        <RecordContextProvider key={row.id} value={row}>
                                                            <Badge badgeContent={row.missingGirlsCount} color="error" title="מספר בנות שחסרו">
                                                                <ReferenceField source="lessonReferenceId" reference="lesson">
                                                                    <ChipField source="name" size="small" color="primary" variant="outlined" />
                                                                </ReferenceField>
                                                            </Badge>
                                                        </RecordContextProvider>
                                                    ))
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">ללא שיוך שיעור</Typography>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </RecordContextProvider>
                            );
                        })}
                    </Box>
                </Box>
            ))}
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
