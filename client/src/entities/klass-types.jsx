import { NumberField, NumberInput, TextField, TextInput, ReferenceField, ReferenceInput, DateField,DateInput } from 'react-admin';
import { useIsAdmin } from '../common/components/AdminRestricted';
import { CommonList } from '../common/components/CommonList';
import { CommonEdit } from '../common/components/CommonEdit';
import { CommonCreate } from '../common/components/CommonCreate';

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

const Fields = ({ isCreate }) => {
    const isAdmin = useIsAdmin();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="users" />}
        <NumberInput source="key" />
        <TextInput source="name" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

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
