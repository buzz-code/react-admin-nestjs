import { DateInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';
import { CommonCreate } from '../../common/CommonCreate';

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="tz" />
        <TextInput source="name" />
        <TextInput source="phone" />
        <TextInput source="phone2" />
        <TextInput source="email" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </>
)

export const TeacherEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const TeacherCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
