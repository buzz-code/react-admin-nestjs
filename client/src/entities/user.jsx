import { DateField, DateInput, EmailField, TextField, TextInput } from 'react-admin';
import { CommonList } from '@shared/components/CommonList';
import { QuickFilter } from '@shared/components/QuickFilter';
import { CommonEdit } from '@shared/components/CommonEdit';
import { CommonCreate } from '@shared/components/CommonCreate';

const filters = [
    <TextInput source="name" alwaysOn />,
    <TextInput source="email" alwaysOn />,
    <TextInput source="phoneNumber" />,
    <QuickFilter source="fromEmail" defaultValue="gmail"/>
];

export const UserList = () => (
    <CommonList filters={filters}>
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
    </CommonList>
);

const Fields = ({ isCreate }) => (
    <>
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
)

export const UserEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const UserCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
