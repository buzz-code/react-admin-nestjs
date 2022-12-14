import { AutocompleteInput, DateField, DateInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '@shared/components/AdminRestricted';
import { CommonList } from '@shared/components/CommonList';
import { CommonReferenceField } from '@shared/components/CommonReferenceField';
import { CommonEdit } from '@shared/components/CommonEdit';
import { CommonCreate } from '@shared/components/CommonCreate';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';

const filters = [
    <CommonReferenceInput source="teacherId" reference="teacher" alwaysOn optionValue="tz" />
];

export const LessonList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList filters={filters}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <NumberField source="key" />
            <TextField source="name" />
            <TextField source="klasses" />
            <CommonReferenceField source="teacherId" reference="teacher" target="tz" />
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
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <NumberInput source="key" />
        <TextInput source="name" />
        <DateInput source="klasses" />
        <CommonReferenceInput source="teacherId" reference="teacher" optionValue="tz" />
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
