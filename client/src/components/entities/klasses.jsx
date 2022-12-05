import { TextField, TextInput, ReferenceField, ReferenceInput, DateField, DateInput, NumberInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CustomReferenceField } from '../common/CustomReferenceField';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';
import { CommonReferenceInput } from '../common/CommonRefenceInput';


export const KlassList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="key" />
            <TextField source="name" />
            <CustomReferenceField source="klassTypeId" reference="klass_types" target="id" />
            <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
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
