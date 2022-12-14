import { TextField, TextInput, ReferenceField, ReferenceInput, DateField, DateInput, NumberInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="key" />
            <TextField source="name" />
            <CommonReferenceField source="klassTypeId" reference="klass_type" target="id" />
            <CommonReferenceField source="teacherId" reference="teacher" target="tz" />
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
        <CommonReferenceInput source="klassTypeId" reference="klassType" />
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
    importer,
};

export default getResourceComponents(entity);
