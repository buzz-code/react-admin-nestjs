import { NumberField, TextField } from 'react-admin';
import { AdminDateField, AdminReferenceField, AdminTextField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const KlassList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <NumberField source="key" />
        <TextField source="name" />
        <CustomReferenceField source="klassTypeId" reference="klass_types" target="id" />
        <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
        <AdminDateField source="createdAt" />
        <AdminDateField source="updatedAt" />
    </CommonList>
);
