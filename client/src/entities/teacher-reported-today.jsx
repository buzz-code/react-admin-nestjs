import { DateInput, ReferenceField, RecordContextProvider, useListContext } from 'react-admin';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';

const todayDateOnly = new Date().toISOString().slice(0, 10);

const filters = [
    adminUserFilter,
    <DateInput source="reportDate:$gte" label="מתאריך" alwaysOn />,
    <DateInput source="reportDate:$lte" label="עד תאריך" alwaysOn />,
];

const filterDefaultValues = {
    'reportDate:$gte': todayDateOnly,
    'reportDate:$lte': todayDateOnly,
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('he-IL') : '');
const formatHour = (value) => (value ? new Date(value).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '');

// The view has one row per teacher+lesson+date; group rows sharing the same
// teacher+date into a single card, collecting their lesson names.
function groupByTeacherAndDate(rows) {
    const groups = new Map();
    rows.forEach((row) => {
        const key = `${row.userId}_${row.teacherReferenceId}_${row.reportDate}`;
        if (!groups.has(key)) {
            groups.set(key, { ...row, lessonNames: [] });
        }
        if (row.lessonName) {
            groups.get(key).lessonNames.push(row.lessonName);
        }
    });
    return [...groups.values()];
}

const TeacherReportCards = ({ isAdmin }) => {
    const { data } = useListContext();
    const groups = groupByTeacherAndDate(data || []);

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2, padding: 2 }}>
            {groups.map((group) => (
                <RecordContextProvider key={group.id} value={group}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="h6">{group.teacherName}</Typography>
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                    {isAdmin && <ReferenceField source="userId" reference="user" />}
                                    <Typography variant="body2" color="text.secondary">{formatDate(group.reportDate)}</Typography>
                                    <Typography variant="body2" color="text.secondary">{formatHour(group.reportHour)}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginTop: 1.5 }}>
                                {group.lessonNames.length > 0 ? (
                                    group.lessonNames.map((name) => (
                                        <Chip key={name} label={name} size="small" color="primary" variant="outlined" />
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
