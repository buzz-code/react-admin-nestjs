import { ReferenceField, ReferenceInput, ReferenceArrayField, TextField, required, SelectField, BooleanInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { RichTextInput } from 'ra-input-rich-text';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="reportMonthReferenceId" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const defaultMailBody = 'מורה יקרה, מצורפים קבצים';
const additionalBulkButtons = [
    <BulkReportButton label='הורדת אקסל למורה' icon={<BrowserUpdatedIcon />} name='teacherReportFile' >
        <BooleanInput source="isGrades" label="קובץ ציונים" />
    </BulkReportButton>,
    <BulkActionButton label='שליחת אקסל למורה' icon={<AttachEmailIcon />} name='teacherReportFile' >
        <RichTextInput key="mailBody" source="mailBody" label="תוכן המייל" validate={required()} defaultValue={defaultMailBody} />
        <BooleanInput source="isGrades" label="קובץ ציונים" />
    </BulkActionButton>,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <ReferenceField source="teacherReferenceId" reference="teacher" sortBy='teacherName' />
            <ReferenceField source="reportMonthReferenceId" reference="report_month" sortBy='reportMonthName' />
            <SelectField source="year" choices={yearChoices} />
            <ReferenceArrayField source="reportedLessons" reference="lesson" sortBy="reportedLessonNames" />
            <ReferenceArrayField source="notReportedLessons" reference="lesson" sortBy="notReportedLessonNames" />
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
