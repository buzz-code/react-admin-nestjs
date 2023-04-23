import { TextField, TextInput, ReferenceField, ReferenceInput, DateField, DateTimeInput, NumberInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/CommonReferenceField';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/CommonReferenceInputFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <NumberInput source="key" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="klassTypeReferenceId" reference="klass_type" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="key" />
            <TextField source="name" />
            <MultiReferenceField source="klassTypeReferenceId" sortBy="klassType.name" reference="klass_type" optionalSource="klassTypeId" optionalTarget="id" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" reference="teacher" optionalSource="teacherId" optionalTarget="tz" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <NumberInput source="key" />
        <TextInput source="name" />
        <ReferenceInput source="klassTypeReferenceId" reference="klass_type" />
        <ReferenceInput source="teacherReferenceId" reference="teacher" />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
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
