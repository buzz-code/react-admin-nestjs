import { TextInput, BooleanInput, DateInput } from 'react-admin';
import { yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';

const defaultValues = {
    attendance: true,
    personalNote: '',
    showStudentTz: true,
};
export default ({ defaultRequestValues }) => (
    <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
        name='studentReportCardReact' filename='תעודה'
        defaultRequestValues={{ ...defaultValues, ...defaultRequestValues }}>
        <CommonAutocompleteInput source="year" label="שנה" choices={yearChoices} />
        <DateInput source="startDate" label="תאריך התחלה" />
        <DateInput source="endDate" label="תאריך סיום" />
        <CommonReferenceArrayInput source="globalLessonReferenceIds" reference="lesson" label="שיעורים ללא הגבלת תאריך" />
        <BooleanInput source="groupByKlass" label="קבץ לפי כיתה" />
        <BooleanInput source="hideAbsTotal" label="הסתר סיכום כללי" />
        <BooleanInput source="attendance" label="הצג נוכחות" defaultChecked />
        <BooleanInput source="forceAtt" label="הצג רק שורות שכוללות נוכחות" />
        <BooleanInput source="grades" label="הצג ציונים" />
        <BooleanInput source="forceGrades" label="הצג רק שורות שכוללות ציונים" />
        <BooleanInput source="showStudentTz" label="הצג תעודת זהות" defaultChecked />
        <BooleanInput source="downComment" label="הצג הערה מתחת שם תלמידה" />
        <TextInput source="personalNote" label="הערה לתלמידה" defaultValue='' />
        <BooleanInput source="lastGrade" label="חשב ציון אחרון" defaultChecked />
        <BooleanInput source="debug" label="הצג פירוט" defaultChecked />
    </BulkReportButton>
);