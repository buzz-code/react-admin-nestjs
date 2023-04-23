import { DateField, DateInput, DateTimeInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/CommonReferenceInputFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" />,
    <DateInput source="reportDate" />,
    <NumberInput source="absnceCount" />,
    <NumberInput source="absnceCode" />,
    <TextInput source="senderName:$cont" label="שולחת" />,
    <TextInput source="reason:$cont" label="סיבה" />,
    <TextInput source="comment:$cont" label="הערות" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student" optionalTarget="tz" />
            <DateField source="reportDate" />
            <NumberField source="absnceCount" />
            <NumberField source="absnceCode" />
            <TextField source="senderName" />
            <TextField source="reason" />
            <TextField source="comment" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="idCopy1" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <ReferenceInput source="studentReferenceId" reference="student" />
        <DateInput source="reportDate" />
        <NumberInput source="absnceCount" />
        <NumberInput source="absnceCode" />
        <TextInput source="senderName" />
        <TextInput source="reason" />
        <TextInput source="comment" />
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
