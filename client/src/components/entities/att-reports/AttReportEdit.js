import { DateInput, NumberInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';

export const AttReportEdit = (props) => (
    <CommonEdit {...props}>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="studentTz" />
        <ReferenceInput source="teacherId" reference="teachers" />
        <ReferenceInput source="klassId" reference="klasses" />
        <ReferenceInput source="lessonId" reference="lessons" />
        <DateInput source="reportDate" />
        <NumberInput source="howManyLessons" />
        <DateInput source="absCount" />
        <DateInput source="approvedAbsCount" />
        <TextInput source="comments" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
        <TextInput source="sheetName" />
    </CommonEdit>
);