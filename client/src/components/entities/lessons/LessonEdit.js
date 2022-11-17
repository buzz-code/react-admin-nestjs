import { DateInput, Edit, NumberInput, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const LessonEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <NumberInput source="key" />
            <TextInput source="name" />
            <DateInput source="klasses" />
            <ReferenceInput source="teacherId" reference="teachers" />
            <DateInput source="startDate" />
            <DateInput source="endDate" />
            <DateInput source="createdAt" />
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);
