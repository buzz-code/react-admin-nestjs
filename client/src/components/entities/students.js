import { DateField, DateInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';

export const StudentList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="tz" />
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
        <TextInput source="tz" />
        <TextInput source="name" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </>
)

export const StudentEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const StudentCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
