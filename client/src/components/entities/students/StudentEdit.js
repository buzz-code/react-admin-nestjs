import { DateInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';

export const StudentEdit = (props) => (
    <CommonEdit {...props}>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="tz" />
        <TextInput source="name" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </CommonEdit>
);