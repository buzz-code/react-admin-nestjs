import { DateField, NumberField, ReferenceField, TextField } from 'react-admin';
import { useIsAdmin } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const AttReportList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props}>
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
            <TextField source="sheetName" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}