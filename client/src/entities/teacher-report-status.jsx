import { ReferenceField, ReferenceInput, ReferenceArrayField, TextField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/CommonReferenceInputFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" />,
    <CommonReferenceInputFilter source="reportMonthReferenceId" reference="report_month" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <ReferenceField source="teacherReferenceId" reference="teacher" />
            {/* sortBy='teacher.name' */}
            <ReferenceField source="reportMonthReferenceId" reference="report_month"/>
            {/* sortBy='reportMonth.name' */}
            <ReferenceArrayField source="reportedLessons" reference="lesson" />
            <ReferenceArrayField source="notReportedLessons" reference="lesson" />
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    filters,
};

export default getResourceComponents(entity);
