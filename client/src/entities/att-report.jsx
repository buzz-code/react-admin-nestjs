import { DateField, DateInput, DateTimeInput, NumberField, NumberInput, TextField, TextInput, ReferenceField, ReferenceInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/CommonReferenceInputFilter';

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
            <TextField source="sheetName" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <ReferenceInput source="studentReferenceId" reference="student" />
        <ReferenceInput source="teacherReferenceId" reference="teacher" />
        <ReferenceInput source="klassReferenceId" reference="klass" />
        <ReferenceInput source="lessonReferenceId" reference="lesson" />
        <DateInput source="reportDate" />
        <NumberInput source="howManyLessons" />
        <NumberInput source="absCount" />
        <NumberInput source="approvedAbsCount" />
        <TextInput source="comments" />
        <TextInput source="sheetName" />
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
