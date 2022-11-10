import { Datagrid, DateField, EmailField, List, TextField, TextInput } from 'react-admin';

const filters = [
    <TextInput label="שם" source="desc" alwaysOn />,
];

export const UserList = (props) => (
    <List {...props} filters={filters}>
        <Datagrid rowClick="edit">
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
        </Datagrid>
    </List>
);