import { DateField, TextField, TextInput, SelectField, ReferenceField, ReferenceManyCount, DateTimeInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonImageInput } from '@shared/components/fields/CommonImageInput';

const additionalBulkButtons = [
    <BulkReportButton 
        key='lessonSignaturePdf'
        label='הורד דוחות PDF' 
        icon={<PictureAsPdfIcon />} 
        name='lessonSignaturePdf' 
        filename='דוחות-קבוצות'
    />
];

const filters = [
    <TextInput source="name:$cont" label="שם" alwaysOn />,
    <TextInput source="topic:$cont" label="נושא" alwaysOn />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={filterByUserIdAndYear} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} />,
    ...commonAdminFilters,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

export const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid 
            additionalBulkButtons={additionalBulkButtons}
            {...props}
        >
            {children}
            {isAdmin && <TextField source="id" />}
            <TextField source="name" />
            <TextField source="topic" />
            <ReferenceField source="teacherReferenceId" reference="teacher" />
            <ReferenceField source="lessonReferenceId" reference="lesson" />
            <ReferenceField source="klassReferenceId" reference="klass" />
            <SelectField source="year" choices={yearChoices} />
            <ReferenceManyCount label="שיעורים" reference="report_group_session" target="reportGroupId" />
            <DateField source="createdAt" showTime />
            {isAdmin && <DateField source="updatedAt" showTime />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        <TextInput source="name" validate={[required(), maxLength(255)]} />
        <TextInput source="topic" validate={[required(), maxLength(255)]} />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} validate={required()} />
        <CommonReferenceInput source="lessonReferenceId" reference="lesson" dynamicFilter={filterByUserIdAndYear} validate={required()} />
        <CommonReferenceInput source="klassReferenceId" reference="klass" dynamicFilter={filterByUserIdAndYear} validate={required()} />
        <CommonAutocompleteInput source="year" choices={yearChoices} validate={required()} />
        <CommonImageInput source="signatureData" validate={required()} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const Representation = CommonRepresentation;

const entity = {
    Datagrid,
    Inputs,
    filters,
    filterDefaultValues,
    Representation,
};

export default getResourceComponents(entity);
