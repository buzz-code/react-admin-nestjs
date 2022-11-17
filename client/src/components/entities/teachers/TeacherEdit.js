import { DateInput, Edit, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const TeacherEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="tz" />
            <TextInput source="name" />
            <TextInput source="phone" />
            <TextInput source="phone2" />
            <TextInput source="email" />
            <DateInput source="createdAt" />
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);