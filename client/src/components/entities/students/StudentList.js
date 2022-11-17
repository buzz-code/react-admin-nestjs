import { Datagrid, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const StudentList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="tz" />
            <TextField source="name" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </Datagrid>
    </List>
);