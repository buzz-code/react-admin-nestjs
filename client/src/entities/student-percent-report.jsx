import { DateInput, NumberField, TextField, ReferenceField, ReferenceInput, useRecordContext, AutocompleteInput, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import { ShowMatchingRecordsButton } from '@shared/components/fields/ShowMatchingRecordsButton';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    // <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    // <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student_by_year" dynamicFilter={{ userId: 'userId' }} />,
    // <TextInput source="studentBaseKlass.klassName:$cont" label="כיתת בסיס" />,
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
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
            {/* <TextField source="studentBaseKlass.klassName" /> */}
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
            <SelectField source="year" choices={yearChoices} />
            <NumberField source="lessonsCount" />
            <NumberField source="absPercents" options={{ style: 'percent', maximumFractionDigits: 2 }} />
            <NumberField source="attPercents" options={{ style: 'percent', maximumFractionDigits: 2 }} />
            <NumberField source="gradeAvg" options={{ style: 'percent', maximumFractionDigits: 2 }} />
            <ShowMatchingAttReportsButton />
        </CommonDatagrid>
    );
}

const ShowMatchingAttReportsButton = ({ ...props }) => {
    const { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId } = useRecordContext();
    const filter = { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId };

    return (
        <ShowMatchingRecordsButton filter={filter} resource="att_report" />
    );
}

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
