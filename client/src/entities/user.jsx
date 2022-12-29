import { DateField, DateInput, EmailField, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/CommonList';
import { QuickFilter } from '@shared/components/QuickFilter';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/CommonEntity';

const filters = [
    <TextInput source="name" alwaysOn />,
    <TextInput source="email" alwaysOn />,
    <TextInput source="phoneNumber" />,
    <QuickFilter source="fromEmail" defaultValue="gmail" />
];

const Datagrid = ({ isAdmin, ...props }) => {
return(
        <CommonDatagrid>
        <TextField source="id" />
        <TextField source="name" />
        <EmailField source="email" />
        <TextField source="password" />
        <TextField source="phoneNumber" />
        <TextField source="active" />
        <TextField source="fromEmail" />
        <TextField source="replyToEmail" />
        <TextField source="effective_id" />
        <TextField source="permissions" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonDatagrid>
);
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && <TextInput source="id" disabled />}
        <TextInput source="name" />
        <TextInput source="email" />
        <TextInput source="password" />
        <TextInput source="phoneNumber" />
        <TextInput source="active" />
        <TextInput source="fromEmail" />
        <TextInput source="replyToEmail" />
        <TextInput source="effective_id" />
        <TextInput source="permissions" multiline />
        {!isCreate && <DateInput source="createdAt" disabled />}
        {!isCreate && <DateInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
};

export default getResourceComponents(entity);
