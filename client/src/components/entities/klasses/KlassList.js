import { Datagrid, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const KlassList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <NumberField source="key" />
            <TextField source="name" />
            <ReferenceField source="klassTypeId" reference="klassTypes" />
            <ReferenceField source="teacherId" reference="teachers" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </Datagrid>
    </List>
);
