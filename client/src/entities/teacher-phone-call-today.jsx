import { TextField, DateField, FunctionField } from 'react-admin';
import Chip from '@mui/material/Chip';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const CallStatusChip = (record) => {
    if (record.hasError) return <Chip label="נכשל" color="error" size="small" />;
    if (record.isOpen) return <Chip label="בשיחה" color="info" size="small" />;
    return <Chip label="דיווח בהצלחה" color="success" size="small" />;
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
    filters: [],
    exporter: false,
    configurable: false,
    sort: { field: 'callTime', order: 'DESC' },
};

export default getResourceComponents(entity);
