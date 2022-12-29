import { DateField, DateInput, NumberField, NumberInput, TextField, TextInput, ReferenceField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/CommonList';
import { CommonReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { getResourceComponents } from '@shared/components/CommonEntity';

const filters = [
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <CommonReferenceInput source="studentTz" reference="student" optionValue="tz" />,
    <CommonReferenceInput source="teacherId" reference="teacher" optionValue="tz" />,
    <CommonReferenceInput source="klassId" reference="klass" optionValue="key" />,
    <CommonReferenceInput source="lessonId" reference="lesson" optionValue="key" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid >
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <CommonReferenceField source="studentTz" reference="student" target="tz" />
            <CommonReferenceField source="teacherId" reference="teacher" target="tz" />
            <CommonReferenceField source="klassId" reference="klass" target="key" />
            <CommonReferenceField source="lessonId" reference="lesson" target="key" />
            <DateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <DateField source="absCount" />
            <DateField source="approvedAbsCount" />
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
        <CommonReferenceInput source="klassId" reference="klasse" optionValue="key" />
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
