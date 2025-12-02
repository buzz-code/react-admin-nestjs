import { DateField, TextField, DateInput, ReferenceField, ReferenceManyCount, NumberInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    <CommonReferenceInputFilter source="reportGroupId" reference="report_group" alwaysOn />,
    <CommonReferenceInputFilter source="reportGroup.teacherReferenceId" reference="teacher" label='מורה' dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="reportGroup.lessonReferenceId" reference="lesson" label='שיעור' dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceInputFilter source="reportGroup.klassReferenceId" reference="klass" label='כיתה' dynamicFilter={filterByUserIdAndYear} />,
    <DateInput source="sessionDate:$gte" label="תאריך אחרי" />,
    <DateInput source="sessionDate:$lte" label="תאריך לפני" />,
    <CommonAutocompleteInput source="reportGroup.year" choices={yearChoices} />,
    ...commonAdminFilters,
];

const filterDefaultValues = {
    'reportGroup.year': defaultYearFilter.year,
};

const additionalBulkButtons = [
    <BulkReportButton
        key='sessionsSummary'
        label='דוח סיכום מפגשים'
        icon={<PictureAsPdfIcon />}
        name='sessionsSummary'
        filename='סיכום-מפגשים'
    />,
    <BulkActionButton 
        key='adjustTime' 
        label='התאמת שעות' 
        icon={<AccessTimeIcon />} 
        name='adjustTime' 
        reloadOnEnd
        defaultRequestValues={{ hoursAdjustment: 2 }}
    >
        <NumberInput 
            source="hoursAdjustment" 
            label="מספר שעות להוספה (שלילי להפחתה)" 
            helperText="לדוגמה: 2 להוספת שעתיים, -2 להפחתת שעתיים"
        />
    </BulkActionButton>,
];

export const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons} hasDelete>
            {children}
            {isAdmin && <TextField source="id" />}
            <ReferenceField source="reportGroupId" reference="report_group" />
            <DateField source="sessionDate" />
            <TextField source="startTime" />
            <TextField source="endTime" />
            <TextField source="topic" />
            <ReferenceManyCount label="נוכחות" reference="att_report" target="reportGroupSessionId" />
            <ReferenceManyCount label="ציונים" reference="grade" target="reportGroupSessionId" />
            <DateField source="createdAt" showTime />
        </CommonDatagrid>
    );
};

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
};

export default getResourceComponents(entity);
