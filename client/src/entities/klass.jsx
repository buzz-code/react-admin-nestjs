import { TextField, TextInput, ReferenceField, ReferenceInput, DateField, DateTimeInput, NumberInput, required, maxLength, useUnique } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <NumberInput source="key" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="klassTypeReferenceId" reference="klass_type" dynamicFilter={{ userId: 'userId' }} />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={{ userId: 'userId' }} />,
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
    const unique = useUnique();
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <NumberInput source="key" validate={[required(), unique()]} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        <CommonReferenceInput source="klassTypeReferenceId" reference="klass_type" validate={required()} dynamicFilter={{ userId: 'userId' }} />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" dynamicFilter={{ userId: 'userId' }} />
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
