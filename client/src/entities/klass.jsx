import { SelectField, TextField, TextInput, ReferenceField, DateField, DateInput, DateTimeInput, NumberInput, required, maxLength } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { useUnique } from '@shared/utils/useUnique';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    ...commonAdminFilters,
    <NumberInput source="key" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="klassTypeReferenceId" reference="klass_type" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="klassType.teacherReferenceId" label="מורה אחראית (שיוך כיתה)" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const additionalBulkButtons = [
    <BulkReportButton 
        key='klassAttendanceReport'
        label='הורד יומן נוכחות' 
        icon={<AssignmentIcon />} 
        name='klassAttendanceReport' 
        filename='יומן-נוכחות'
    >
        <DateInput 
            source="startDate" 
            label="תאריך התחלה" 
        />
        <DateInput 
            source="endDate" 
            label="תאריך סיום" 
        />
        <CommonReferenceArrayInput 
            source="lessonReferenceIds" 
            reference="lesson" 
            label="שיעורים" 
            dynamicFilter={filterByUserIdAndYear}
        />
    </BulkReportButton>
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="key" />
            <TextField source="name" />
            <TextField source="displayName" />
            <MultiReferenceField source="klassTypeReferenceId" sortBy="klassType.name" reference="klass_type" optionalSource="klassTypeId" optionalTarget="key" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" reference="teacher" optionalSource="teacherId" optionalTarget="tz" />
            <SelectField source="year" choices={yearChoices} />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique({ dynamicFilter: { year: 'year' } });
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <NumberInput source="key" validate={[required(), unique()]} />
        <TextInput source="name" validate={[required(), maxLength(500)]} />
        <TextInput source="displayName" validate={[maxLength(500)]} />
        <CommonReferenceInput source="klassTypeReferenceId" reference="klass_type" validate={required()} dynamicFilter={filterByUserId} />
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
};

const Representation = CommonRepresentation;

const importer = {
    fields: ['key', 'name', 'klassTypeId', 'teacherId', 'year', 'displayName'],
}

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
    importer,
};

export default getResourceComponents(entity);
