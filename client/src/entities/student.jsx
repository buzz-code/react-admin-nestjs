import { BooleanField, BooleanInput, DateField, DateInput, DateTimeInput, Labeled, maxLength, NullableBooleanInput, ReferenceField, ReferenceManyField, required, SelectField, SelectInput, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { useUnique } from '@shared/utils/useUnique';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import StudentReportCardReactButton from 'src/reports/studentReportCardReactButton';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    ...commonAdminFilters,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="phone:$cont" label="טלפון" />,
    <TextInput source="name:$cont" alwaysOn />,
    <NullableBooleanInput source="isActive" alwaysOn />,,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const additionalBulkButtons = [
    // <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
    //     key='studentReportCard' name='studentReportCard' filename='תעודה' />,
    <StudentReportCardReactButton key='studentReportCardReact' defaultRequestValues={filterDefaultValues} />,
    <BulkActionButton label='סימון פעיל/לא פעיל' icon={<CheckCircleIcon />} 
        name='bulkUpdateActive' key='bulkUpdateActive' reloadOnEnd >
        <BooleanInput source="isActive" label="פעיל" />
    </BulkActionButton>,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="name" />
            <TextField source="comment" />
            <TextField source="phone" />
            <TextField source="address" />
            <BooleanField source="isActive" />
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
        <TextInput source="tz" validate={[required(), maxLength(10), unique()]} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        <TextInput source="comment" validate={[maxLength(1000)]} />
        <TextInput source="phone" validate={[maxLength(1000)]} />
        <TextInput source="address" validate={[maxLength(1000)]} />
        <BooleanInput source="isActive" defaultValue={true} />
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
    fields: ['tz', 'name', 'comment', 'phone', 'address', 'isActive'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
