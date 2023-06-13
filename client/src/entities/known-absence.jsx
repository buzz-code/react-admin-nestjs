import { DateField, DateInput, DateTimeInput, maxLength, NumberField, NumberInput, ReferenceField, ReferenceInput, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={{ userId: 'userId' }} />,
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
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonReferenceInput source="studentReferenceId" reference="student" validate={required()} dynamicFilter={{ userId: 'userId' }} />
        <DateInput source="reportDate" validate={required()} />
        <NumberInput source="absnceCount" />
        <NumberInput source="absnceCode" />
        <TextInput source="senderName" validate={maxLength(100)} />
        <TextInput source="reason" validate={maxLength(500)} />
        <TextInput source="comment" validate={maxLength(500)} />
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
