import { DateField, DateInput, NumberField, NumberInput, TextField, TextInput, ReferenceField, ReferenceInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';
import { CustomReferenceField } from '../common/CustomReferenceField';
import { CommonReferenceInput } from '../common/CommonRefenceInput';

const filters = [
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <CommonReferenceInput source="studentTz" reference="students" optionValue="tz" />,
    <CommonReferenceInput source="teacherId" reference="teachers" optionValue="tz" />,
    <CommonReferenceInput source="klassId" reference="klasses" optionValue="key" />,
    <CommonReferenceInput source="lessonId" reference="lessons" optionValue="key" />,
];

export const AttReportList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList filters={filters}>
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

const Fields = ({ isCreate }) => {
    const isAdmin = useIsAdmin();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="users" />}
        <CommonReferenceInput source="studentTz" reference="students" optionValue="tz" />
        <CommonReferenceInput source="teacherId" reference="teachers" optionValue="tz" />
        <CommonReferenceInput source="klassId" reference="klasses" optionValue="key" />
        <CommonReferenceInput source="lessonId" reference="lessons" optionValue="key" />
        <DateInput source="reportDate" />
        <NumberInput source="howManyLessons" />
        <DateInput source="absCount" />
        <DateInput source="approvedAbsCount" />
        <TextInput source="comments" />
        <TextInput source="sheetName" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

export const AttReportEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const AttReportCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
