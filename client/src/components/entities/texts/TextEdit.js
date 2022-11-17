import { ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';

export const TextEdit = (props) => (
    <CommonEdit {...props}>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="name" />
        <TextInput source="description" />
        <TextInput source="value" />
    </CommonEdit>
);
