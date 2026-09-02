import { ChipField, DateInput, ReferenceField, RecordContextProvider, TextField, useListContext } from 'react-admin';
import { Badge, Box, Card, CardContent, Typography } from '@mui/material';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';

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

const TeacherReportCards = ({ isAdmin }) => {
    const { data } = useListContext();
    const groups = groupByTeacherAndDate(data || []);
    const columns = groupByKlass(groups);

    return (
        <Box sx={{ display: 'flex', gap: 2, padding: 2, overflowX: 'auto', alignItems: 'flex-start' }}>
            {columns.map((column) => (
                <Box key={column.klassReferenceId ?? NO_KLASS_KEY} sx={{ minWidth: 320, flex: '0 0 320px' }}>
                    <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                        {column.klassReferenceId ? (
                            <RecordContextProvider value={{ klassReferenceId: column.klassReferenceId }}>
                                <ReferenceField source="klassReferenceId" reference="klass">
                                    <TextField source="name" />
                                </ReferenceField>
                            </RecordContextProvider>
                        ) : 'ללא כיתה'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {column.groups.map((group) => (
                            <RecordContextProvider key={group.id} value={group}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                            <Typography variant="h6">
                                                <ReferenceField source="teacherReferenceId" reference="teacher">
                                                    <TextField source="name" />
                                                </ReferenceField>
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                {isAdmin && <ReferenceField source="userId" reference="user" />}
                                                <Typography variant="body2" color="text.secondary">{formatDate(group.reportDate)}</Typography>
                                                <Typography variant="body2" color="text.secondary">{formatHour(group.reportHour)}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginTop: 1.5 }}>
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
                                                <Typography variant="body2" color="text.secondary">ללא שיוך שיעור</Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </RecordContextProvider>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

const Datagrid = ({ isAdmin }) => <TeacherReportCards isAdmin={isAdmin} />;

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
    exporter: false,
    configurable: false,
    sort: { field: 'reportDate', order: 'DESC' },
};

export default getResourceComponents(entity);
