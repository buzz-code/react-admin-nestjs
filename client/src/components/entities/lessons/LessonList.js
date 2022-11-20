import { DateField, NumberField, TextField } from 'react-admin';
import { AdminDateField, AdminReferenceField, AdminTextField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const LessonList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <NumberField source="key" />
        <TextField source="name" />
        <TextField source="klasses" />
        <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
        <DateField source="startDate" />
        <DateField source="endDate" />
        <AdminDateField source="createdAt" />
        <AdminDateField source="updatedAt" />
    </CommonList>
);