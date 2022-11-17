import { Edit, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const TextEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="name" />
            <TextInput source="description" />
            <TextInput source="value" />
        </SimpleForm>
    </Edit>
);
