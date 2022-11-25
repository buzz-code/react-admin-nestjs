import { DateField, DateInput, EmailField, TextField, TextInput } from 'react-admin';
import { CommonList } from '../common/CommonList';
import { QuickFilter } from '../common/QuickFilter';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';

const filters = [
    <TextInput source="name" alwaysOn />,
    <TextInput source="email" alwaysOn />,
    <TextInput source="phoneNumber" />,
    <QuickFilter source="fromEmail" defaultValue="gmail"/>
];

export const UserList = (props) => (
    <CommonList {...props} filters={filters}>
        <TextField source="id" />
        <TextField source="name" />
        <EmailField source="email" />
        <TextField source="password" />
        <TextField source="phoneNumber" />
        <TextField source="active" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
        <TextField source="fromEmail" />
        <TextField source="replyToEmail" />
        <TextField source="permissions" />
    </CommonList>
);

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <TextInput source="name" />
        <TextInput source="email" />
        <TextInput source="password" />
        <TextInput source="phoneNumber" />
        <TextInput source="active" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
        <TextInput source="fromEmail" />
        <TextInput source="replyToEmail" />
        <TextInput source="permissions" multiline />
    </>
)

export const UserEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const UserCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
