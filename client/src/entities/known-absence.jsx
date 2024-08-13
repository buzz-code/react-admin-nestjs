import { BooleanField, BooleanInput, DateField, DateInput, DateTimeInput, maxLength, NumberField, NumberInput, ReferenceField, required, SelectField, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student_by_year" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" dynamicFilter={filterByUserId} />,
    <DateInput source="reportDate" />,
    <NumberInput source="absnceCount" />,
    <NumberInput source="absnceCode" />,
    <TextInput source="senderName:$cont" label="שולחת" />,
    <TextInput source="reason:$cont" label="סיבה" />,
    <TextInput source="comment:$cont" label="הערות" />,
    <BooleanInput source="isApproved" />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
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
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <DateField source="reportDate" />
            <NumberField source="absnceCount" />
            <NumberField source="absnceCode" />
            <TextField source="senderName" />
            <TextField source="reason" />
            <TextField source="comment" />
            <BooleanField source="isApproved" />
            <SelectField source="year" choices={yearChoices} />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
}

const lessonKeyAndName = item => `${item.name} (${item.key})`;

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
        <CommonReferenceInput source="studentReferenceId" reference="student_by_year" validate={required()} dynamicFilter={filterByUserId} />
        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} dynamicFilter={filterByUserId} />
        <CommonReferenceInput source="lessonReferenceId" reference="lesson" dynamicFilter={filterByUserId} optionText={lessonKeyAndName} />
        <DateInput source="reportDate" validate={required()} />
        <NumberInput source="absnceCount" validate={required()} />
        <NumberInput source="absnceCode" />
        <TextInput source="senderName" validate={maxLength(100)} />
        <TextInput source="reason" validate={maxLength(500)} />
        <TextInput source="comment" validate={maxLength(500)} />
        <BooleanInput source="isApproved" defaultValue={true} />
        <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const importer = {
    fields: ['studentTz', 'klassId', 'lessonId', 'reportDate', 'absnceCount', 'absnceCode', 'senderName', 'reason', 'comment', 'isApproved'],
}

const entity = {
    Datagrid,
    Inputs,
    filters,
    importer,
    filterDefaultValues,
};

export default getResourceComponents(entity);
