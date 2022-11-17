import { Datagrid, DateField, List, ReferenceField, TextField } from 'react-admin';

export const StudentKlassList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="studentTz" />
            <ReferenceField source="klassId" reference="klasses" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </Datagrid>
    </List>
);