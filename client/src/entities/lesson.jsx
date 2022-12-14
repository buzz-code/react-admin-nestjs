import { DateField, DateInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const filters = [
    <CommonReferenceInput source="teacherId" reference="teacher" alwaysOn optionValue="tz" />
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
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
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
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
