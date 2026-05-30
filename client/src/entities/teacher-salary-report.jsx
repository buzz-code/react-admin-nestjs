import { ReferenceField, TextField, SelectField, NumberField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { CommonYearField, CommonYearInputFilter } from '@shared/components/fields/CommonYear';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';

const filters = [
    adminUserFilter,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter
        source="reportMonthReferenceId"
        reference="report_month"
        dynamicFilter={filterByUserId}
    />,
    <CommonReferenceInputFilter
        source="klass.klassTypeReferenceId"
        reference="klass_type"
        dynamicFilter={filterByUserId}
    />,
    <CommonYearInputFilter />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <ReferenceField source="teacherReferenceId" reference="teacher" sortBy="teacher.name" />
            <ReferenceField source="lessonReferenceId" reference="lesson" sortBy="lesson.name" />
            <ReferenceField source="klassReferenceId" reference="klass" sortBy="klass.name" />
            <MultiReferenceField
                source="klassReferenceId"
                label="resources.teacher_salary_report.fields.klass.klassTypeReferenceId"
                sortable={false}
                optionalSource="klassId"
                reference="klass"
                optionalTarget="key"
            >
                <MultiReferenceField source="klassTypeReferenceId" reference="klass_type" />
            </MultiReferenceField>
            <NumberField source="howManyLessons" />
            <ReferenceField source="reportMonthReferenceId" reference="report_month" sortBy="reportMonth.name" />
            <CommonYearField />
        </CommonDatagrid>
    );
};

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
