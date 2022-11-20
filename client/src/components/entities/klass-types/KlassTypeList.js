import { NumberField, TextField } from 'react-admin';
import { AdminDateField, AdminReferenceField, AdminTextField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';

export const KlassTypeList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <NumberField source="key" />
        <TextField source="name" />
        <AdminDateField source="createdAt" />
        <AdminDateField source="updatedAt" />
    </CommonList>
);