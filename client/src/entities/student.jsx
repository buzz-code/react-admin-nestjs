import { DateField, DateTimeInput, maxLength, ReferenceField, ReferenceInput, required, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
];

const additionalBulkButtons = [
    <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />} name='studentReportCard' filename='תעודה' />
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="name" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <TextInput source="tz" validate={[required(), maxLength(10)]} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const importer = {
    fields: ['tz', 'name'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
