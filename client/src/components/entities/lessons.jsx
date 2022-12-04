import { AutocompleteInput, DateField, DateInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '../common/AdminRestricted';
import { CommonList } from '../common/CommonList';
import { CustomReferenceField } from '../common/CustomReferenceField';
import { CommonEdit } from '../common/CommonEdit';
import { CommonCreate } from '../common/CommonCreate';

const filterToQuery = searchText => ({ 'name:cont': `${searchText}` });

const filters = [
    <ReferenceInput source="teacherId" reference="teachers" filter={{ userId: 1 }} alwaysOn>
        <AutocompleteInput filterToQuery={filterToQuery} optionValue="tz" />
    </ReferenceInput>,
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
            <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
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
        <ReferenceInput source="teacherId" reference="teachers" />
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
