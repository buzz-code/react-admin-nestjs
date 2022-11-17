import { DateInput, Edit, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const StudentKlassEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="studentTz" />
            <ReferenceInput source="klassId" reference="klasses" />
            <DateInput source="createdAt" />
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);