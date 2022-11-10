import { DateInput, Edit, SimpleForm, TextInput } from 'react-admin';

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <TextInput source="name" />
            <TextInput source="email" />
            <TextInput source="password" />
            <TextInput source="phoneNumber" />
            <TextInput source="active" />
            <DateInput source="createdAt" />
            <DateInput source="updatedAt" />
            <TextInput source="fromEmail" />
            <TextInput source="replyToEmail" />
        </SimpleForm>
    </Edit>
);
