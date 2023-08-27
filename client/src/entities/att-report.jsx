import { DateField, DateInput, DateTimeInput, NumberField, NumberInput, TextField, TextInput, ReferenceField, ReferenceInput, required, maxLength, AutocompleteInput, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={{ userId: 'userId' }} />,
    <TextInput source="studentBaseKlass.klassName:$cont" label="כיתת בסיס" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={{ userId: 'userId' }} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={{ userId: 'userId' }} />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" dynamicFilter={{ userId: 'userId', teacherReferenceId: 'teacherReferenceId', 'klassReferenceIds:$cont': 'klassReferenceId' }} />,
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
            <TextField source="studentBaseKlass.klassName" />
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <SelectField source="year" choices={yearChoices} />
            <DateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <NumberField source="absCount" />
            {/* <NumberField source="approvedAbsCount" /> */}
            <TextField source="comments" />
            {/* <TextField source="sheetName" /> */}
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
        <CommonReferenceInput source="teacherReferenceId" reference="teacher" validate={required()} dynamicFilter={{ userId: 'userId' }} />
        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} dynamicFilter={{ userId: 'userId' }} />
        <CommonReferenceInput source="lessonReferenceId" reference="lesson" validate={required()} dynamicFilter={{ userId: 'userId', year: 'year' }} />
        <DateInput source="reportDate" validate={required()} />
        <NumberInput source="howManyLessons" defaultValue={1} />
        <NumberInput source="absCount" defaultValue={0} />
        {/* <NumberInput source="approvedAbsCount" defaultValue={0} /> */}
        <TextInput source="comments" validate={maxLength(500)} />
        <AutocompleteInput source="year" choices={yearChoices} />
        {/* <TextInput source="sheetName" validate={maxLength(100)} /> */}
        {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
}

const entity = {
    Datagrid,
    Inputs,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
