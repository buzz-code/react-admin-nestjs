import { DateInput, NumberField, TextField, ReferenceField, ReferenceInput, useRecordContext, useCreatePath, Button, Link } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import ListIcon from '@mui/icons-material/List';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <DateInput source="reportDate:$lte" label="תאריך דיווח לפני" alwaysOn />,
    <DateInput source="reportDate:$gte" label="תאריך דיווח אחרי" alwaysOn />,
    <CommonReferenceInputFilter source="studentReferenceId" reference="student" dynamicFilter={{ userId: 'userId' }} />,
    // <TextInput source="studentBaseKlass.klassName:$cont" label="כיתת בסיס" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={{ userId: 'userId' }} />,
    <CommonReferenceInputFilter source="klassReferenceId" reference="klass" dynamicFilter={{ userId: 'userId' }} />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" dynamicFilter={{ userId: 'userId', teacherReferenceId: 'teacherReferenceId', 'klassReferenceIds:$cont': 'klassReferenceId' }} />,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student" optionalTarget="tz" />
            {/* <TextField source="studentBaseKlass.klassName" /> */}
            <MultiReferenceField source="teacherReferenceId" sortBy="teacher.name" optionalSource="teacherId" reference="teacher" optionalTarget="tz" />
            <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
            <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
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
    const createPath = useCreatePath();
    const filter = { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId };

    return (
        <Button label='ra.action.show_matching_records' startIcon={<ListIcon />}
            component={Link}
            to={{
                pathname: createPath({ resource: 'att_report', type: 'list' }),
                search: `filter=${JSON.stringify(filter)}`
            }}
            onClick={e => e.stopPropagation()} />
    );
}

const entity = {
    Datagrid,
    filters,
};

export default getResourceComponents(entity);
