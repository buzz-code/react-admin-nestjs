import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import {
    CommonReferenceInputFilter,
    filterByUserId,
    filterByUserIdAndYear,
} from '@shared/components/fields/CommonReferenceInputFilter';
import {
    AccessDenied,
    BooleanField,
    ReferenceField,
    TextField,
    useListContext,
    TextInput,
    DateInput,
    NullableBooleanInput,
} from 'react-admin';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonYearField, CommonYearInputFilter } from '@shared/components/fields/CommonYear';
import { semesterChoices } from 'src/entities/report-month';
import CommonReferenceArrayInput from '@shared/components/fields/CommonReferenceArrayInput';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';
import ThresholdColorField from 'src/components/fields/ThresholdColorField';
import { ABSENCE_THRESHOLDS } from 'src/utils/absenceThresholds';
import { useIsStudentAttendanceByKlass } from 'src/utils/appPermissions';

const filters = [
    adminUserFilter,
    // ── Row filters (which students appear) ──
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
    <NullableBooleanInput source="isActive" label="תלמידה פעילה" />,
    <CommonReferenceInputFilter
        source="klassReferenceIds:$cont"
        label="תלמידות בכיתה"
        reference="klass"
        dynamicFilter={filterByUserIdAndYear}
        alwaysOn
    />,
    <CommonReferenceInputFilter
        source="klassTypeReferenceIds:$cont"
        label="תלמידות מסוג כיתה"
        reference="klass_type"
        dynamicFilter={filterByUserId}
    />,
    // ── Column filters (which classes become dynamic columns) ──
    <CommonReferenceArrayInput
        source="extra.klassReferenceIds"
        label="כיתות לדוח (עמודות)"
        reference="klass"
        dynamicFilter={filterByUserIdAndYear}
        alwaysOn
    />,
    <CommonReferenceArrayInput
        source="extra.klassTypeReferenceIds"
        label="נתונים מסוגי כיתות"
        reference="klass_type"
        dynamicFilter={filterByUserId}
    />,
    <CommonYearInputFilter />,
    <DateInput source="extra.fromDate" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="extra.toDate" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter
        source="extra.reportMonthReferenceId"
        label="תקופת דיווח"
        reference="report_month"
        dynamicFilter={filterByUserId}
    />,
    <CommonAutocompleteInput source="extra.semester" label="מחצית" choices={semesterChoices} />,
    <CommonReferenceArrayInput
        source="extra.excludedLessonIds"
        reference="lesson"
        label="הסר מקצועות מהדוח"
        dynamicFilter={filterByUserIdAndYear}
    />,
];

const filterDefaultValues = {
    year: defaultYearFilter.year,
    extra: {},
};

const PCT_SUMMARY_KEYS = new Set(['absenceRatio', 'totalAbsenceRatio']);

const Datagrid = ({ isAdmin, children, ...props }) => {
    const { data } = useListContext();
    const headers = data?.[0]?.headers ?? [];

    const klassHeaders = headers.filter((h) => h.value.startsWith('klass_'));
    const summaryHeaders = headers.filter((h) => !h.value.startsWith('klass_'));

    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField key="id" source="id" />}
            {isAdmin && <ReferenceField key="userId" source="userId" reference="user" />}
            <TextField key="tz" source="tz" />
            <TextField key="name" source="name" />
            <BooleanField key="isActive" source="isActive" />
            <CommonYearField key="year" />

            {klassHeaders.map((h) => (
                <ThresholdColorField key={h.value} source={h.value} label={h.label} thresholds={ABSENCE_THRESHOLDS} />
            ))}

            {summaryHeaders.map((h) =>
                PCT_SUMMARY_KEYS.has(h.value) ? (
                    <ThresholdColorField
                        key={h.value}
                        source={h.value}
                        label={h.label}
                        thresholds={ABSENCE_THRESHOLDS}
                    />
                ) : (
                    <TextField key={h.value} source={h.value} label={h.label} sortable={false} />
                ),
            )}
        </CommonDatagrid>
    );
};

const entity = {
    resource: 'student_by_year/pivot?extra.pivot=StudentAttendanceByKlass',
    Datagrid,
    filters,
    filterDefaultValues,
    configurable: false,
};

const List = getResourceComponents(entity).list;

const StudentAttendanceByKlassList = (props) => {
    const hasPermission = useIsStudentAttendanceByKlass();
    if (!hasPermission) {
        return <AccessDenied />;
    }
    return <List {...props} />;
};

export default StudentAttendanceByKlassList;
