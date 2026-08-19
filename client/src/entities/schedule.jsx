import {
    BooleanField,
    BooleanInput,
    DateField,
    DateTimeInput,
    FunctionField,
    NumberField,
    NumberInput,
    ReferenceField,
    SelectInput,
    TextField,
    TextInput,
    maxLength,
    minValue,
    required,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

// Sunday=0 .. Saturday=6, matching JS Date#getDay() (the server computes the
// same way), so the value saved here lines up with what the cleanup job reads.
const weekdayChoices = [
    { id: 0, name: 'ראשון' },
    { id: 1, name: 'שני' },
    { id: 2, name: 'שלישי' },
    { id: 3, name: 'רביעי' },
    { id: 4, name: 'חמישי' },
    { id: 5, name: 'שישי' },
    { id: 6, name: 'שבת' },
];
const weekdayName = (value) => weekdayChoices.find((day) => day.id === value)?.name ?? value;

const filters = [
    ...commonAdminFilters,
    <TextInput source="name:$cont" alwaysOn />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="name" />
            <ReferenceField source="payload.klassReferenceId" reference="klass" label="resources.schedule.fields.payload.klassReferenceId" />
            <ReferenceField source="payload.lessonReferenceId" reference="lesson" label="resources.schedule.fields.payload.lessonReferenceId" />
            <FunctionField
                label="resources.schedule.fields.payload.targetWeekday"
                render={(record) => weekdayName(record.payload?.targetWeekday)}
            />
            <NumberField source="payload.lookbackWeeks" label="resources.schedule.fields.payload.lookbackWeeks" />
            <TextField source="cronExpression" />
            <BooleanField source="active" />
            <DateField showDate showTime source="nextRunAt" />
            <DateField showDate showTime source="lastRunAt" />
        </CommonDatagrid>
    );
};

const CronHelperText = () => (
    <span>
        תבנית זמן בסגנון Cron - חמישה שדות מופרדים ברווח: דקה, שעה, יום-בחודש, חודש, יום-בשבוע (0=ראשון). כוכבית (*)
        פירושה &quot;כל ערך&quot;. לדוגמה <code>0 21 * * 6</code> = כל מוצאי שבת (יום שבת) בשעה 21:00.
        אפשר לבנות ולבדוק ביטוי בעזרת{' '}
        <a href="https://crontab.guru" target="_blank" rel="noopener noreferrer">
            crontab.guru
        </a>{' '}
        (כלי חיצוני באנגלית, אך התצוגה בו ויזואלית ופשוטה לשימוש).
    </span>
);

const Inputs = ({ isCreate, isAdmin }) => {
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <TextInput source="name" validate={[required(), maxLength(255)]} helperText="שם לזיהוי התזמון, לדוגמה: ניקוי נוכחות תפילה" />
            <TextInput source="jobType" defaultValue="attendance-cleanup" disabled helperText="סוג המשימה - קבוע: ניקוי נוכחות" />
            <CommonReferenceInput
                source="payload.klassReferenceId"
                reference="klass"
                validate={required()}
                helperText="הכיתה שהנוכחות שלה נשמרת - מכל שאר הכיתות הנוכחות תימחק"
            />
            <CommonReferenceInput
                source="payload.lessonReferenceId"
                reference="lesson"
                validate={required()}
                helperText="השיעור שהנוכחות בו מנוקה"
            />
            <SelectInput
                source="payload.targetWeekday"
                choices={weekdayChoices}
                validate={required()}
                helperText="היום בשבוע שהנוכחות שלו נבדקת"
            />
            <NumberInput
                source="payload.lookbackWeeks"
                defaultValue={2}
                validate={[required(), minValue(1)]}
                helperText="כמה מופעים אחרונים של אותו יום בשבוע לבדוק בכל הרצה - כדי לתפוס גם נוכחות שהוזנה באיחור"
            />
            <TextInput source="cronExpression" defaultValue="0 21 * * 6" validate={[required(), maxLength(120)]} helperText={<CronHelperText />} />
            <BooleanInput source="active" defaultValue={true} />
            {!isCreate && <DateTimeInput source="nextRunAt" disabled />}
            {!isCreate && <DateTimeInput source="lastRunAt" disabled />}
        </>
    );
};

const entity = {
    Datagrid,
    Inputs,
    Representation: CommonRepresentation,
    filters,
};

export default getResourceComponents(entity);
