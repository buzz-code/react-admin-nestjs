import {
    DateField,
    DateTimeInput,
    ReferenceField,
    required,
    TextField,
    TextInput,
    NumberInput,
    maxLength,
    ArrayInput,
    SimpleFormIterator,
    BooleanInput,
    BooleanField,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useUnique } from '@shared/utils/useUnique';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { CommonYearField, CommonYearInput, CommonYearInputFilter } from '@shared/components/fields/CommonYear';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';

const filters = [
    ...commonAdminFilters,
    <CommonYearInputFilter />,
    <TextInput source="name:$cont" />,
];

const filterDefaultValues = {
    year: defaultYearFilter.year,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}

            <TextField source="name" />
            <TextField source="quota" />
            <BooleanField source="isFileRequired" />
            <CommonYearField />

            <TextField source="requiredLabels" />

            {isAdmin && <DateField source="createdAt" disabled />}
            {isAdmin && <DateField source="updatedAt" disabled />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique({ dynamicFilter: { year: 'year' } });
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <TextInput source="name" validate={[required(), maxLength(100), unique()]} />
            <NumberInput source="quota" step={1} validate={[required()]} />
            <CommonYearInput validate={required()} />
            <ArrayInput source="requiredLabels">
                <SimpleFormIterator>
                    <TextInput fullWidth />
                </SimpleFormIterator>
            </ArrayInput>
            <BooleanInput source="isFileRequired" />

            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = CommonRepresentation;

const importer = {
    fields: ['name', 'quota', 'requiredLabels', 'year', 'isFileRequired'],
};

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
    importer,
};

export default getResourceComponents(entity);