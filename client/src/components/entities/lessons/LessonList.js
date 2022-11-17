import { Datagrid, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const LessonList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <NumberField source="key" />
            <TextField source="name" />
            <DateField source="klasses" />
            <ReferenceField source="teacherId" reference="teachers" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </Datagrid>
    </List>
);