import { ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';

export const TextList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <ReferenceField source="userId" reference="users" />
        <TextField source="name" />
        <TextField source="description" />
        <TextField source="value" />
    </CommonList>
);
