import { Datagrid, List, ReferenceField, TextField } from 'react-admin';

export const TextList = (props) => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="value" />
        </Datagrid>
    </List>
);
