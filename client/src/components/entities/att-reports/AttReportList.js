import { DateField, NumberField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';

export const AttReportList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <ReferenceField source="userId" reference="users" />
        <TextField source="studentTz" />
        <ReferenceField source="teacherId" reference="teachers" />
        <ReferenceField source="klassId" reference="klasses" />
        <ReferenceField source="lessonId" reference="lessons" />
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