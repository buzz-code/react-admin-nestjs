import { DateField, DateTimeInput, ReferenceField, required, TextField, TextInput, SelectField, BooleanInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={filterByUserIdAndYear} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const additionalBulkButtons = [
    <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
        key='studentReportCardReact' name='studentReportCardReact' filename='תעודה' defaultRequestValues={filterDefaultValues}>
        <CommonAutocompleteInput source="year" label="שנה" choices={yearChoices} />
        <BooleanInput source="grades" label="עם ציונים" />
    </BulkReportButton>
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
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
        <CommonReferenceInput source="studentReferenceId" reference="student" validate={required()} dynamicFilter={filterByUserId} />
        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} dynamicFilter={filterByUserIdAndYear} />
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const importer = {
    fields: ['studentTz', 'klassId', 'year'],
}

const entity = {
    Datagrid,
    Inputs,
    filters,
    filterDefaultValues,
    importer,
};

export default getResourceComponents(entity);
