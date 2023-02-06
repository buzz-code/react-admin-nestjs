import { TextField, TextInput, ReferenceField, ReferenceInput, DateField, DateInput, NumberInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const filters = [
    <NumberInput source="key" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInput source="klassTypeId" reference="klassType" />,
    <CommonReferenceInput source="teacherId" reference="teacher" optionValue="tz" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="key" />
            <TextField source="name" />
            <MultiReferenceField source="klassTypeReferenceId" reference="klass_type" optionalSource="klassTypeId" optionalTarget="id" />
            <MultiReferenceField source="teacherReferenceId" reference="teacher" optionalSource="teacherId" optionalTarget="tz" />
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
        <CommonReferenceInput source="klassTypeId" reference="klass_type" />
        <CommonReferenceInput source="teacherId" reference="teacher" optionValue="tz" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
};

const Representation = CommonRepresentation;

const importer = {
    fields: ['key', 'name', 'klassTypeId', 'teacherId'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
