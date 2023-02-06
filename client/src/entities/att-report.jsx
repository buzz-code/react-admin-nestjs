import { DateField, DateInput, NumberField, NumberInput, TextField, TextInput, ReferenceField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const filters = [
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <CommonReferenceInput source="studentTz" reference="student" optionValue="tz" />,
    <TextInput source="studentBaseKlass.klassName:$cont" label="כיתת בסיס" />,
    <CommonReferenceInput source="teacherId" reference="teacher" optionValue="tz" />,
    <CommonReferenceInput source="klassId" reference="klass" optionValue="key" />,
    <CommonReferenceInput source="lessonId" reference="lesson" optionValue="key" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" optionalSource="studentTz" reference="student" optionalTarget="tz" />
            <TextField source="studentBaseKlass.klassName" />
            <MultiReferenceField source="teacherReferenceId" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <DateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <NumberField source="absCount" />
            <NumberField source="approvedAbsCount" />
            <TextField source="comments" />
            <TextField source="sheetName" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" />}
        <CommonReferenceInput source="studentTz" reference="student" optionValue="tz" />
        <CommonReferenceInput source="teacherId" reference="teacher" optionValue="tz" />
        <CommonReferenceInput source="klassId" reference="klass" optionValue="key" />
        <CommonReferenceInput source="lessonId" reference="lesson" optionValue="key" />
        <DateInput source="reportDate" />
        <NumberInput source="howManyLessons" />
        <DateInput source="absCount" />
        <DateInput source="approvedAbsCount" />
        <TextInput source="comments" />
        <TextInput source="sheetName" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

const entity = {
    Datagrid,
    Inputs,
    filters,
};

export default getResourceComponents(entity);
