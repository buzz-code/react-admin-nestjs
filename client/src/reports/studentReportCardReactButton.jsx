import { TextInput, DateInput, NumberInput, BooleanInput } from 'react-admin';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { CommonYearInput } from '@shared/components/fields/CommonYear';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useReportCardSettings } from 'src/settings/settingsUtil';

const defaultValues = {
    ...defaultYearFilter,
    personalNote: '',
};

export default ({ defaultRequestValues }) => {
    const reportCardSettings = useReportCardSettings();

    return (
        <BulkReportButton
            label="תעודה לתלמידה"
            icon={<NoteAltIcon />}
            name="studentReportCardReact"
            filename="תעודה"
            defaultRequestValues={{ ...defaultValues, ...defaultRequestValues }}
            requestValues={reportCardSettings}
        >
            <CommonYearInput label="שנה" />
            <DateInput source="startDate" label="תאריך התחלה" />
            <DateInput source="endDate" label="תאריך סיום" />
            <CommonReferenceArrayInput
                source="globalLessonReferenceIds"
                reference="lesson"
                label="שיעורים ללא הגבלת תאריך"
            />
            <CommonReferenceArrayInput
                source="denyLessonReferenceIds"
                reference="lesson"
                label="שיעורים שלא ייכללו בתעודה"
            />
            <CommonReferenceInput source="klassTypeReferenceId" reference="klass_type" label="שיוך כיתה" />
            <TextInput source="personalNote" label="הערה לתלמידה" defaultValue="" />
            <NumberInput source="attendanceLessThan" label="הצג רק שורות עם נוכחות נמוכה מ (%)" />
            <NumberInput
                source="gradesLessThan"
                label="הצג רק שורות עם ציון נמוך מ (%)"
                helperText="הסינון מתבצע לפי הציון המקורי, לפני התאמה לפי אחוזי נוכחות"
            />
            <BooleanInput
                source="limitFilterUseOr"
                label="כאשר שני הסינונים הקודמים מלאים, הצג שורה כשמתקיים לפחות אחד מהם (במקום שניהם יחד)"
            />
        </BulkReportButton>
    );
};
