import { TextField } from 'react-admin';
import { AdminDateField, AdminReferenceField, AdminTextField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';

export const StudentList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <TextField source="tz" />
        <TextField source="name" />
        <AdminDateField source="createdAt" />
        <AdminDateField source="updatedAt" />
    </CommonList>
);