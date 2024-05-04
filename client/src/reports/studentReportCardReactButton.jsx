import { TextInput, BooleanInput } from 'react-admin';
import { yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';

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
        <BooleanInput source="groupByKlass" label="קבץ לפי כיתה" />
        <BooleanInput source="hideAbsTotal" label="הסתר סיכום כללי" />
        <BooleanInput source="attendance" label="הצג נוכחות" defaultChecked />
        <BooleanInput source="forceAtt" label="הצג רק שורות שכוללות נוכחות" />
        <BooleanInput source="grades" label="הצג ציונים" />
        <BooleanInput source="forceGrades" label="הצג רק שורות שכוללות ציונים" />
        <BooleanInput source="showStudentTz" label="הצג תעודת זהות" defaultChecked />
        <BooleanInput source="downComment" label="הצג הערה מתחת שם תלמידה" />
        <TextInput source="personalNote" label="הערה לתלמידה" defaultValue='' />
    </BulkReportButton>
);