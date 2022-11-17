import { DateInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';

export const UserEdit = (props) => (
    <CommonEdit {...props}>
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
    </CommonEdit>
);
