import { DateField, DateTimeInput, ReferenceField, ReferenceInput, required, TextField, TextInput, AutocompleteInput, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={{ userId: 'userId' }} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={{ userId: 'userId' }} />,
    <AutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <SelectField source="year" choices={yearChoices} />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonReferenceInput source="studentReferenceId" reference="student" validate={required()} dynamicFilter={{ userId: 'userId' }} />
        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} dynamicFilter={{ userId: 'userId' }} />
        <AutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const importer = {
    fields: ['studentTz', 'klassId'],
}

const entity = {
    Datagrid,
    Inputs,
    filters,
    filterDefaultValues,
    importer,
};

export default getResourceComponents(entity);
