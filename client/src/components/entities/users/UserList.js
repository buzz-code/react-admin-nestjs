import { DateField, EmailField, TextField, TextInput } from 'react-admin';
import { CommonList } from '../../common/CommonList';

const filters = [
    <TextInput label="שם" source="desc" alwaysOn />,
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
    </CommonList>
);