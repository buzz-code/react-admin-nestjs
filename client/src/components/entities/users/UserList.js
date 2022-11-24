import { DateField, EmailField, TextField, TextInput } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { QuickFilter } from '../../common/QuickFilter';

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