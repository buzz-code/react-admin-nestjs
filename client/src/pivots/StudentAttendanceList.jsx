import { getResourceComponents } from "@shared/components/crudContainers/CommonEntity";
import { CommonDatagrid, getPivotColumns } from "@shared/components/crudContainers/CommonList"
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from "@shared/components/fields/CommonReferenceInputFilter";
import { BooleanField, ReferenceField, TextField, useListContext, TextInput, DateInput, BooleanInput, NullableBooleanInput, SelectField } from "react-admin"
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonSelectArrayField } from "@shared/components/fields/CommonSelectArrayField";
import { semesterChoices } from "src/entities/report-month";
import CommonReferenceArrayInput from "@shared/components/fields/CommonReferenceArrayInput";
import { adminUserFilter } from "@shared/components/fields/PermissionFilter";

const filters = [
    adminUserFilter,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
    <NullableBooleanInput source="isActive" label="תלמידה פעילה" />,
    <CommonReferenceInputFilter source="klassReferenceIds:$cont" label="סינון תלמידות לפי כיתה" reference="klass" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonReferenceInputFilter source="klassTypeReferenceIds:$cont" label="סינון תלמידות לפי סוג כיתה" reference="klass_type" dynamicFilter={filterByUserId} alwaysOn />,
    <CommonReferenceArrayInput source="extra.klassReferenceIds" label="סינון נתונים לפי כיתה" reference="klass" dynamicFilter={filterByUserIdAndYear} />,
    <CommonReferenceArrayInput source="extra.klassTypeReferenceIds" label="סינון נתונים לפי סוג כיתה" reference="klass_type" dynamicFilter={filterByUserId} />,
    <CommonReferenceInputFilter source="extra.lessonId" reference="lesson" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
    <DateInput source="extra.fromDate" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="extra.toDate" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter source="extra.reportMonthReferenceId" label="תקופת דיווח" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="extra.semester" label="מחצית" choices={semesterChoices} />,
    <CommonReferenceArrayInput source="extra.excludedLessonIds" reference="lesson" label="הסר מקצועות מהדוח" dynamicFilter={filterByUserIdAndYear} />,
];

const filterDefaultValues = {
    year: defaultYearFilter.year,
    extra: {},
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    const { data } = useListContext();

    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField key="id" source="id" />}
            {isAdmin && <ReferenceField key="userId" source="userId" reference="user" />}
            <TextField key="tz" source="tz" />
            <TextField key="name" source="name" />
            <BooleanField key="isActive" source="isActive" />
            <SelectField key="year" source="year" choices={yearChoices} />
            {getPivotColumns(data)}
        </CommonDatagrid>
    );
}

const entity = {
    resource: 'student_by_year/pivot?extra.pivot=StudentAttendance',
    Datagrid,
    filters,
    filterDefaultValues,
    configurable: false,
}

export default getResourceComponents(entity).list;