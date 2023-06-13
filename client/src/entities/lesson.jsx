import { DateField, DateInput, DateTimeInput, maxLength, NumberInput, ReferenceArrayField, ReferenceArrayInput, ReferenceField, ReferenceInput, required, TextField, TextInput } from 'react-admin';
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
    <CommonReferenceInputFilter source="klassReferenceIds:$cont" label="כיתה" reference="klass" dynamicFilter={{ userId: 'userId' }} />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={{ userId: 'userId' }} alwaysOn />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="key" />
            <TextField source="name" />
            <ReferenceArrayField source="klassReferenceIds" reference="klass" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <NumberInput source="key" validate={required()} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        <ReferenceArrayInput source="klassReferenceIds" reference='klass' />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" dynamicFilter={{ userId: 'userId' }} />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
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
