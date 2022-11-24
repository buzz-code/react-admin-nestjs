import { DateField, DateInput, NumberField, ReferenceField, TextField, ReferenceInput } from 'react-admin';
import { useIsAdmin } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

const filters = [
    <DateInput source="reportDate:$lte" label="reportDate:$lte" alwaysOn />,
    <DateInput source="reportDate:$gte" label="reportDate:$gte" alwaysOn />,
    <ReferenceInput source="teacherId" reference="teachers" />
];

export const AttReportList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props} filters={filters}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <CustomReferenceField source="studentTz" reference="students" target="tz" />
            <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
            <CustomReferenceField source="klassId" reference="klasses" target="key" />
            <CustomReferenceField source="lessonId" reference="lessons" target="key" />
            <DateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <DateField source="absCount" />
            <DateField source="approvedAbsCount" />
            <TextField source="comments" />
            <TextField source="sheetName" />פ
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}