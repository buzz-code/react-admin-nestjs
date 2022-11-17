import { DateInput, Edit, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const StudentEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="tz" />
            <TextInput source="name" />
            <DateInput source="createdAt" />
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);