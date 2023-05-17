import { DateField, DateInput, DateTimeInput, NumberField, NumberInput, TextField, TextInput, ReferenceField, ReferenceInput, required, maxLength } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" />,
    <TextInput source="studentBaseKlass.klassName:$cont" label="כיתת בסיס" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student" optionalTarget="tz" />
            <TextField source="studentBaseKlass.klassName" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <DateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <NumberField source="absCount" />
            <NumberField source="approvedAbsCount" />
            <TextField source="comments" />
            {/* <TextField source="sheetName" /> */}
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonReferenceInput source="studentReferenceId" reference="student" validate={required()} />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" validate={required()} />
        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} />
        <CommonReferenceInput source="lessonReferenceId" reference="lesson" validate={required()} />
        <DateInput source="reportDate" validate={required()} />
        <NumberInput source="howManyLessons" />
        <NumberInput source="absCount" />
        <NumberInput source="approvedAbsCount" />
        <TextInput source="comments" validate={maxLength(500)} />
        {/* <TextInput source="sheetName" validate={maxLength(100)} /> */}
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const entity = {
    Datagrid,
    Inputs,
    filters,
};

export default getResourceComponents(entity);
