import { DateField, DateInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '@buzz-code/crud-nestjs-react-admin/client/components/AdminRestricted';
import { CommonList } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonList';
import { CommonReferenceField } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonReferenceField';
import { CommonEdit } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonEdit';
import { CommonCreate } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonCreate';
import { CommonReferenceInput } from '@buzz-code/crud-nestjs-react-admin/client/components/CommonRefenceInput';


export const StudentKlassList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <CommonReferenceField source="studentTz" reference="student" target="tz" />
            <CommonReferenceField source="klassId" reference="klass" target="key" />
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
        <CommonReferenceInput source="studentTz" reference="student" optionValue="tz" />,
        <CommonReferenceInput source="klassId" reference="klass" optionValue="key" />,
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

export const StudentKlassEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const StudentKlassCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);