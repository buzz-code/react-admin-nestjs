import { AdminDateField, AdminReferenceField, AdminTextField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const StudentKlassList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <CustomReferenceField source="studentTz" reference="students" target="tz" />
        <CustomReferenceField source="klassId" reference="klasses" target="key" />
        <AdminDateField source="createdAt" />
        <AdminDateField source="updatedAt" />
    </CommonList>
);