import { DateField, DateInput, NumberField, TextField, TextInput, ReferenceField, ReferenceInput, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { Inputs } from './att-report';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student_by_year" dynamicFilter={{ ...filterByUserId, 'year:$cont': filterByUserIdAndYear.year }} />,
    <TextInput source="studentBaseKlass.klassName:$cont" label="כיתת בסיס" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" dynamicFilter={{ ...filterByUserIdAndYear, teacherReferenceId: 'teacherReferenceId', 'klassReferenceIds:$cont': 'klassReferenceId' }} />,
    <CommonReferenceInput source="reportMonthReferenceId" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

// const recordRowClick = (id, resource, record) => `/att_report/${id}/edit`;

export const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
            <TextField source="studentBaseKlass.klassName" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <MultiReferenceField source="reportMonthReferenceId" sortBy="reportMonth.name" reference="report_month" />
            <SelectField source="year" choices={yearChoices} />
            <DateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <NumberField source="absCount" />
            {/* <NumberField source="approvedAbsCount" /> */}
            <TextField source="comments" />
            {/* <TextField source="sheetName" /> */}
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    Inputs,
    filters,
    filterDefaultValues,
    editResource: 'att_report',
};

export default getResourceComponents(entity);
