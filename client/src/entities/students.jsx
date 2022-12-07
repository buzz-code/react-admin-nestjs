import { DateField, DateInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '@buzz-code/crud-nestjs-react-admin/client/components/AdminRestricted';
import { CommonList } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonList';
import { CommonEdit } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonEdit';
import { CommonCreate } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonCreate';

export const StudentList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="tz" />
            <TextField source="name" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}

const Fields = ({ isCreate }) => {
    const isAdmin = useIsAdmin();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="users" />}
        <TextInput source="tz" />
        <TextInput source="name" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

export const StudentEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const StudentCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
