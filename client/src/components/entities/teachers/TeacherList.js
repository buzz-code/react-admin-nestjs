import { Datagrid, DateField, EmailField, List, ReferenceField, TextField } from 'react-admin';

export const TeacherList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="tz" />
            <TextField source="name" />
            <TextField source="phone" />
            <TextField source="phone2" />
            <EmailField source="email" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </Datagrid>
    </List>
);
