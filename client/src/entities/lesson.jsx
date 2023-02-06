import { DateField, DateInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const filters = [
    <NumberInput source="key" />,
    <TextInput source="name:$cont" alwaysOn />,
    <TextInput source="klasses:$cont" label="קוד כיתה" />,
    <CommonReferenceInput source="teacherId" reference="teacher" alwaysOn optionValue="tz" />
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="key" />
            <TextField source="name" />
            <TextField source="klasses" />
            <MultiReferenceField source="teacherReferenceId" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <NumberInput source="key" />
        <TextInput source="name" />
        <TextInput source="klasses" />
        <CommonReferenceInput source="teacherId" reference="teacher" optionValue="tz" />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['key', 'name', 'klasses', 'teacherId'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
