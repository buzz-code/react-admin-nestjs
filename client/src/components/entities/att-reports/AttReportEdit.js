import { DateInput, NumberInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';
import { CommonCreate } from '../../common/CommonCreate';

const Fields = ({ isCreate }) => (
    <>
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
    </>
)

export const AttReportEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const AttReportCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
