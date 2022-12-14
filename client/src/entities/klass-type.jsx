import { NumberField, NumberInput, TextField, TextInput, ReferenceField, ReferenceInput, DateField,DateInput } from 'react-admin';
import { useIsAdmin } from '@shared/components/AdminRestricted';
import { CommonList } from '@shared/components/CommonList';
import { CommonEdit } from '@shared/components/CommonEdit';
import { CommonCreate } from '@shared/components/CommonCreate';

export const KlassTypeList = () => {
    const isAdmin = useIsAdmin();
    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
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
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
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
