import { DateField, NumberField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';
import { UserReferenceField } from '../../common/UserReferenceField';

export const AttReportList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <CustomReferenceField source="studentTz" reference="students" target="tz" />
        <CustomReferenceField source="teacherId" reference="teachers" target="tz"/>
        <CustomReferenceField source="klassId" reference="klasses" target="key"/>
        <CustomReferenceField source="lessonId" reference="lessons" target="key"/>
        <DateField source="reportDate" />
        <NumberField source="howManyLessons" />
        <DateField source="absCount" />
        <DateField source="approvedAbsCount" />
        <TextField source="comments" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
        <TextField source="sheetName" />
    </CommonList>
);