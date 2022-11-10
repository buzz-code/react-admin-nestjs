import { DateField, EmailField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <EmailField source="email" />
            <TextField source="password" />
            <TextField source="phoneNumber" />
            <TextField source="active" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
            <TextField source="fromEmail" />
            <TextField source="replyToEmail" />
        </SimpleShowLayout>
    </Show>
);
