import { DateInput, Edit, NumberInput, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const KlassEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <NumberInput source="key" />
            <TextInput source="name" />
            <ReferenceInput source="klassTypeId" reference="klassTypes" />
            <ReferenceInput source="teacherId" reference="teachers" />
            <DateInput source="createdAt" />
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);
