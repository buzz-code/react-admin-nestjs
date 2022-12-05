import { DateField, DateInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CommonReferenceField } from '../common/CommonReferenceField';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';
import { CommonReferenceInput } from '../common/CommonRefenceInput';


export const StudentKlassList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <CommonReferenceField source="studentTz" reference="students" target="tz" />
            <CommonReferenceField source="klassId" reference="klasses" target="key" />
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
        <CommonReferenceInput source="studentTz" reference="students" optionValue="tz" />,
        <CommonReferenceInput source="klassId" reference="klasses" optionValue="key" />,
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
