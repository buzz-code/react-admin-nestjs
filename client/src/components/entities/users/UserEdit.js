import { DateInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';
import { CommonCreate } from '../../common/CommonCreate';

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <TextInput source="name" />
        <TextInput source="email" />
        <TextInput source="password" />
        <TextInput source="phoneNumber" />
        <TextInput source="active" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
        <TextInput source="fromEmail" />
        <TextInput source="replyToEmail" />
        <TextInput source="permissions" multiline />
    </>
)

export const UserEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const UserCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
