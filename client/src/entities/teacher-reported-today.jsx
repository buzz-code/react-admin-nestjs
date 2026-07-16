import { TextField, DateField, DateInput, ReferenceField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
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

const Datagrid = ({ isAdmin, children, ...props }) => (
    <CommonDatagrid {...props} readonly>
        {children}
        {isAdmin && <ReferenceField source="userId" reference="user" />}
        <DateField source="reportDate" />
        <TextField source="teacherName" />
    </CommonDatagrid>
);

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
    exporter: false,
    configurable: false,
    sort: { field: 'reportDate', order: 'DESC' },
};

export default getResourceComponents(entity);
