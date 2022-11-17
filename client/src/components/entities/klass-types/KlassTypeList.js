import { Datagrid, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const KlassTypeList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <NumberField source="key" />
            <TextField source="name" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </Datagrid>
    </List>
);