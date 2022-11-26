import { NumberField, NumberInput, TextField, TextInput, ReferenceField, ReferenceInput, DateField,DateInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';

export const KlassTypeList = () => {
    const isAdmin = useIsAdmin();
    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <NumberField source="key" />
            <TextField source="name" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <NumberInput source="key" />
        <TextInput source="name" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </>
)

export const KlassTypeEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const KlassTypeCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
