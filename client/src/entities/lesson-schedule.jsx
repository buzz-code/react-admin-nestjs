import {
    DateField,
    DateInput,
    DateTimeInput,
    NumberInput,
    ReferenceField,
    required,
    TextField,
    TextInput,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
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
import { CommonTimeInput } from '@shared/components/fields/CommonTimeInput';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { LessonScheduleImportButton } from 'src/components/LessonScheduleImportButton';

const filters = [
    ...commonAdminFilters,
    <CommonReferenceInputFilter
        source="teacherReferenceId"
        reference="teacher"
        dynamicFilter={filterByUserId}
        alwaysOn
    />,
    <CommonReferenceInputFilter
        source="klassReferenceId"
        label="התמחות"
        reference="klass"
        dynamicFilter={filterByUserIdAndYear}
    />,
    <CommonReferenceInputFilter
        source="lessonReferenceId"
        label="שיעור"
        reference="lesson"
        dynamicFilter={filterByUserIdAndYear}
    />,
    <CommonYearInputFilter />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="organizationalYear" label="שנה אירגונית" />
            <TextField source="startTime" label="משעה" />
            <DateField source="scheduleDate" label="תאריך" />
            <ReferenceField source="klassReferenceId" reference="klass" label="התמחות" />
            <ReferenceField source="lessonReferenceId" reference="lesson" label="שיעור" />
            <TextField source="groupNumber" label="קבוצה" />
            <ReferenceField source="teacherReferenceId" reference="teacher" sortBy="teacher.name" label="מורה" />
            <CommonYearField />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <TextInput source="organizationalYear" label="שנה אירגונית" />
            <CommonTimeInput source="startTime" label="משעה" />
            <DateInput source="scheduleDate" label="תאריך" validate={required()} />
            <CommonReferenceInput
                source="klassReferenceId"
                reference="klass"
                label="התמחות"
                dynamicFilter={filterByUserIdAndYear}
                validate={required()}
            />
            <CommonReferenceInput
                source="lessonReferenceId"
                reference="lesson"
                label="שיעור"
                dynamicFilter={filterByUserIdAndYear}
                validate={required()}
            />
            <NumberInput source="groupNumber" label="קבוצה" />
            <CommonReferenceInput
                source="teacherReferenceId"
                reference="teacher"
                label="מורה"
                dynamicFilter={filterByUserId}
                validate={required()}
            />
            <CommonYearInput />
            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = CommonRepresentation;

const additionalListActions = [<LessonScheduleImportButton key="lessonScheduleImport" />];

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
    additionalListActions,
};

export default getResourceComponents(entity);
