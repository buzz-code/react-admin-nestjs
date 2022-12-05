import { AutocompleteInput, DateField, DateInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '../common/components/AdminRestricted';
import { CommonList } from '../common/components/CommonList';
import { CommonReferenceField } from '../common/components/CommonReferenceField';
import { CommonEdit } from '../common/components/CommonEdit';
import { CommonCreate } from '../common/components/CommonCreate';
import { CommonReferenceInput } from '../common/components/CommonRefenceInput';

const filters = [
    <CommonReferenceInput source="teacherId" reference="teachers" alwaysOn optionValue="tz" />
];

export const LessonList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList filters={filters}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <NumberField source="key" />
            <TextField source="name" />
            <TextField source="klasses" />
            <CommonReferenceField source="teacherId" reference="teachers" target="tz" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}

const Fields = ({ isCreate }) => {
    const isAdmin = useIsAdmin();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="users" />}
        <NumberInput source="key" />
        <TextInput source="name" />
        <DateInput source="klasses" />
        <CommonReferenceInput source="teacherId" reference="teachers" optionValue="tz" />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

export const LessonEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const LessonCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
