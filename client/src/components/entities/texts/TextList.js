import { TextField } from 'react-admin';
import { AdminReferenceField, AdminTextField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';

export const TextList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <TextField source="name" />
        <TextField source="description" />
        <TextField source="value" />
    </CommonList>
);
