import { TextField, DateField, DateInput, FunctionField } from 'react-admin';
import Chip from '@mui/material/Chip';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const CallStatusChip = (record) => {
    if (record.hasError) return <Chip label="נכשל" color="error" size="small" />;
    if (record.isOpen) return <Chip label="בשיחה" color="info" size="small" />;
    return <Chip label="דיווח בהצלחה" color="success" size="small" />;
};

const toDateInputValue = (datetimeStr) => (datetimeStr ? datetimeStr.slice(0, 10) : datetimeStr);
const startOfDay = (dateStr) => (dateStr ? `${dateStr} 00:00:00` : dateStr);
const endOfDay = (dateStr) => (dateStr ? `${dateStr} 23:59:59` : dateStr);

const todayDateOnly = new Date().toISOString().slice(0, 10);

const filters = [
    <DateInput
        source="callTime:$gte"
        label="מתאריך"
        alwaysOn
        format={toDateInputValue}
        parse={startOfDay}
    />,
    <DateInput
        source="callTime:$lte"
        label="עד תאריך"
        alwaysOn
        format={toDateInputValue}
        parse={endOfDay}
    />,
];

const filterDefaultValues = {
    'callTime:$gte': startOfDay(todayDateOnly),
    'callTime:$lte': endOfDay(todayDateOnly),
};

const Datagrid = ({ isAdmin, children, ...props }) => (
    <CommonDatagrid {...props} readonly>
        {children}
        <TextField source="teacherName" />
        <DateField source="callTime" showTime locales="he-IL" options={{ hour: '2-digit', minute: '2-digit' }} />
        <FunctionField source="status" label="resources.teacher_phone_call_today.fields.status" render={CallStatusChip} sortable={false} />
    </CommonDatagrid>
);

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
    exporter: false,
    configurable: false,
    sort: { field: 'callTime', order: 'DESC' },
};

export default getResourceComponents(entity);
