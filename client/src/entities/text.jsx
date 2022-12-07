import { ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '@buzz-code/crud-nestjs-react-admin/client/components/AdminRestricted';
import { CommonList } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonList';
import { CommonEdit } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonEdit';
import { CommonCreate } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonCreate';

export const TextList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="value" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}

const Fields = ({ isCreate }) => {
    const isAdmin = useIsAdmin();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <TextInput source="name" />
        <TextInput source="description" />
        <TextInput source="value" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

export const TextEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const TextCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
