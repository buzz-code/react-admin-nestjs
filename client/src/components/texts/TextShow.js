import { ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const TextShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="value" />
        </SimpleShowLayout>
    </Show>
);
