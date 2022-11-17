import { Datagrid, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const KnownAbsenceList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="studentTz" />
            <DateField source="reportDate" />
            <NumberField source="absnceCount" />
            <NumberField source="absnceCode" />
            <TextField source="senderName" />
            <TextField source="reason" />
            <TextField source="comment" />
            <DateField source="createdAt" />
            <DateField source="idCopy1" />
        </Datagrid>
    </List>
);