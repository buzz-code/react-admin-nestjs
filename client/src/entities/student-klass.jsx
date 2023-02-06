import { DateField, DateInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const filters = [
    <CommonReferenceInput source="studentTz" reference="student" optionValue="tz" />,
    <CommonReferenceInput source="klassId" reference="klass" optionValue="key" />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" optionalSource="studentTz" reference="student" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" optionalSource="klassId" reference="klass" optionalTarget="key" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <CommonReferenceInput source="studentTz" reference="student" optionValue="tz" />
        <CommonReferenceInput source="klassId" reference="klass" optionValue="key" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

const importer = {
    fields: ['studentTz', 'klassId'],
}

const entity = {
    Datagrid,
    Inputs,
    filters,
    importer,
};

export default getResourceComponents(entity);
