import { BooleanInput, DateField, DateTimeInput, Labeled, maxLength, ReferenceField, ReferenceInput, ReferenceManyField, required, SelectField, TextField, TextInput, useUnique } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const additionalBulkButtons = [
    // <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
    //     key='studentReportCard' name='studentReportCard' filename='תעודה' />,
    <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
        key='studentReportCardReact' name='studentReportCardReact' filename='תעודה' defaultRequestValues={filterDefaultValues}>
        <CommonAutocompleteInput source="year" label="שנה" choices={yearChoices} />
        <BooleanInput source="grades" label="עם ציונים" />
    </BulkReportButton>
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="name" />
            <TextField source="comment" />
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
        <TextInput source="tz" validate={[required(), maxLength(10), isCreate && unique()]} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        <TextInput source="comment" validate={[maxLength(1000)]} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        {!isCreate && <Labeled label="שיוך לכיתות">
            <ReferenceManyField reference="student_klass" target="studentReferenceId">
                <CommonDatagrid>
                    <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
                    <SelectField source="year" choices={yearChoices} />
                </CommonDatagrid>
            </ReferenceManyField>
        </Labeled>}
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
