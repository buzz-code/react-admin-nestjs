import { TextField, TextInput, ReferenceField, ReferenceInput, DateField, DateInput, NumberInput } from 'react-admin';
import { useIsAdmin } from '@buzz-code/crud-nestjs-react-admin/client/components/AdminRestricted';
import { CommonList } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonList';
import { CommonReferenceField } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonReferenceField';
import { CommonEdit } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonEdit';
import { CommonCreate } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonCreate';
import { CommonReferenceInput } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonRefenceInput';


export const KlassList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="key" />
            <TextField source="name" />
            <CommonReferenceField source="klassTypeId" reference="klass_types" target="id" />
            <CommonReferenceField source="teacherId" reference="teachers" target="tz" />
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
        <CommonReferenceInput source="klassTypeId" reference="klassTypes" />
        <CommonReferenceInput source="teacherId" reference="teachers" optionValue="tz" />,
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

export const KlassEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const KlassCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
