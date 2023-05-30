import { ReferenceField, ReferenceInput, ReferenceArrayField, TextField, required } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter } from '@shared/components/fields/CommonReferenceInputFilter';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { RichTextInput } from 'ra-input-rich-text';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <CommonReferenceInputFilter source="teacherReferenceId" reference="teacher" />,
    <CommonReferenceInputFilter source="reportMonthReferenceId" reference="report_month" />,
];

const defaultMailBody = 'מורה יקרה, מצורפים קבצים';
const additionalBulkButtons = [
    <BulkReportButton label='הורדת אקסל למורה' icon={<BrowserUpdatedIcon />} name='teacherReportFile' />,
    <BulkActionButton label='שליחת אקסל למורה' icon={<AttachEmailIcon />} name='teacherReportFile' >
        <RichTextInput key="mailBody" source="mailBody" label="תוכן המייל" validate={required()} defaultValue={defaultMailBody} />
    </BulkActionButton>,
];

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <ReferenceField source="teacherReferenceId" reference="teacher" sortBy='teacherName' />
            <ReferenceField source="reportMonthReferenceId" reference="report_month" sortBy='reportMonthName' />
            <ReferenceArrayField source="reportedLessons" reference="lesson" />
            <ReferenceArrayField source="notReportedLessons" reference="lesson" />
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    filters,
};

export default getResourceComponents(entity);
