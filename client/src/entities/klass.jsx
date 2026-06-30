import {
    TextField,
    TextInput,
    ReferenceField,
    DateField,
    DateInput,
    DateTimeInput,
    BooleanInput,
    NumberInput,
    NumberField,
    required,
    maxLength,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import {
    CommonReferenceInputFilter,
    filterByUserId,
    filterByUserIdAndYear,
} from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { CommonYearField, CommonYearInput, CommonYearInputFilter } from '@shared/components/fields/CommonYear';
import { useUnique } from '@shared/utils/useUnique';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import { BulkFixReferenceButton } from '@shared/components/crudContainers/BulkFixReferenceButton';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    ...commonAdminFilters,
    <NumberInput source="key" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="klassTypeReferenceId" reference="klass_type" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter
        source="klassType.teacherReferenceId"
        label="מורה אחראית (שיוך כיתה)"
        reference="teacher"
        dynamicFilter={filterByUserId}
    />,
    <CommonYearInputFilter />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const additionalBulkButtons = [
    <BulkReportButton
        key="klassAttendanceReport"
        label="הורד יומן נוכחות"
        icon={<AssignmentIcon />}
        name="klassAttendanceReport"
        filename="יומן-נוכחות"
    >
        <DateInput source="startDate" label="תאריך התחלה" validate={required()} />
        <DateInput source="endDate" label="תאריך סיום" validate={required()} />
        <CommonReferenceArrayInput
            source="lessonReferenceIds"
            reference="lesson"
            label="שיעורים"
            dynamicFilter={filterByUserIdAndYear}
        />
        <BooleanInput source="groupByDate" label="קיבוץ לפי תאריך" defaultValue={true} />
    </BulkReportButton>,
    <BulkFixReferenceButton key="fixReferences" label="תיקון שיוך" />,
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
            <MultiReferenceField
                source="klassTypeReferenceId"
                sortBy="klassType.name"
                reference="klass_type"
                optionalSource="klassTypeId"
                optionalTarget="key"
            />
            <MultiReferenceField
                source="teacherReferenceId"
                sortBy="teacher.name"
                reference="teacher"
                optionalSource="teacherId"
                optionalTarget="tz"
            />
            <NumberField source="order" />
            <CommonYearField />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique({ dynamicFilter: { year: 'year' } });
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <NumberInput source="key" validate={[required(), unique()]} />
            <TextInput source="name" validate={[required(), maxLength(500)]} />
            <TextInput source="displayName" validate={[maxLength(500)]} />
            <CommonReferenceInput
                source="klassTypeReferenceId"
                reference="klass_type"
                validate={required()}
                dynamicFilter={filterByUserId}
            />
            <CommonReferenceInput source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />
            <NumberInput source="order" helperText="מספר נמוך = מופיע קודם" />
            <CommonYearInput />
            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = CommonRepresentation;

const importer = {
    fields: ['key', 'name', 'klassTypeId', 'teacherId', 'year', 'displayName', 'order'],
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
