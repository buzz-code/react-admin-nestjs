import { TextInput, BooleanInput } from 'react-admin';
import { yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';

export default ({ filterDefaultValues }) => (
    <BulkReportButton label='תעודה לתלמידה' icon={<NoteAltIcon />}
        name='studentReportCardReact' filename='תעודה' defaultRequestValues={filterDefaultValues}>
        <CommonAutocompleteInput source="year" label="שנה" choices={yearChoices} />
        <BooleanInput source="grades" label="עם ציונים" />
        <TextInput source="personalNote" label="הערה לתלמידה" defaultValue='' />
        <BooleanInput source="groupByKlass" label="קבץ לפי כיתה" />
        <BooleanInput source="hideAbsTotal" label="הסתר סיכום כללי" />
        <BooleanInput source="forceGrades" label="הצג רק שורות שכוללות ציונים" />
        <BooleanInput source="forceAtt" label="הצג רק שורות שכוללות נוכחות" />
        <BooleanInput source="showStudentTz" label="הצג תעודת זהות" defaultChecked />
        <BooleanInput source="downComment" label="הצג הערה מתחת שם תלמידה" />
    </BulkReportButton>
);