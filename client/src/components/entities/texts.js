import { ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';

export const TextList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="value" />
        </CommonList>
    );
}

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="name" />
        <TextInput source="description" />
        <TextInput source="value" />
    </>
)

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
