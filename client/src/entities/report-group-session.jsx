import { DateField, TextField, DateInput, ReferenceField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';

const filters = [
    <CommonReferenceInputFilter source="reportGroupId" reference="report_group" alwaysOn />,
    <DateInput source="sessionDate:$gte" label="תאריך אחרי" />,
    <DateInput source="sessionDate:$lte" label="תאריך לפני" />,
];

export const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            <ReferenceField source="reportGroupId" reference="report_group" />
            <DateField source="sessionDate" />
            <TextField source="startTime" />
            <TextField source="endTime" />
            <TextField source="topic" />
            <DateField source="createdAt" showTime />
        </CommonDatagrid>
    );
};

const entity = {
    Datagrid,
    filters,
};

export default getResourceComponents(entity);
