import { DateField, NumberField, TextField } from 'react-admin';
import { AdminTextField, AdminReferenceField, AdminDateField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const AttReportList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <CustomReferenceField source="studentTz" reference="students" target="tz" />
        <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
        <CustomReferenceField source="klassId" reference="klasses" target="key" />
        <CustomReferenceField source="lessonId" reference="lessons" target="key" />
        <DateField source="reportDate" />
        <NumberField source="howManyLessons" />
        <DateField source="absCount" />
        <DateField source="approvedAbsCount" />
        <TextField source="comments" />
        <TextField source="sheetName" />
        <AdminDateField source="createdAt" />
        <AdminDateField source="updatedAt" />
    </CommonList>
);