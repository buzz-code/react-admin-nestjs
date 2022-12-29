import { DateField, DateInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/CommonList';
import { CommonReferenceField } from '@shared/components/CommonReferenceField';
import { getResourceComponents } from '@shared/components/CommonEntity';

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <CommonReferenceField source="studentTz" reference="student" target="tz" />
            <DateField source="reportDate" />
            <NumberField source="absnceCount" />
            <NumberField source="absnceCode" />
            <TextField source="senderName" />
            <TextField source="reason" />
            <TextField source="comment" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="idCopy1" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <TextInput source="studentTz" />
        <DateInput source="reportDate" />
        <NumberInput source="absnceCount" />
        <NumberInput source="absnceCode" />
        <TextInput source="senderName" />
        <TextInput source="reason" />
        <TextInput source="comment" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

const entity = {
    Datagrid,
    Inputs,
};

export default getResourceComponents(entity);
