import { DateField, DateInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CustomReferenceField } from '../common/CustomReferenceField';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';


export const StudentKlassList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <CustomReferenceField source="studentTz" reference="students" target="tz" />
            <CustomReferenceField source="klassId" reference="klasses" target="key" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="studentTz" />
        <ReferenceInput source="klassId" reference="klasses" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </>
)

export const StudentKlassEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const StudentKlassCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
