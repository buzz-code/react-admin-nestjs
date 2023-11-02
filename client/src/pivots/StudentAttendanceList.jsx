import { getResourceComponents } from "@shared/components/crudContainers/CommonEntity";
import { CommonDatagrid } from "@shared/components/crudContainers/CommonList"
import { CommonReferenceInputFilter, filterByUserId, filterByUserIdAndYear } from "@shared/components/fields/CommonReferenceInputFilter";
import { ReferenceField, TextField, useListContext, TextInput, DateInput } from "react-admin"
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonSelectArrayField } from "@shared/components/fields/CommonSelectArrayField";
import { semesterChoices } from "src/entities/report-month";

const filters = [
    ({ isAdmin }) => isAdmin && <CommonReferenceInputFilter source="userId" reference="user" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="klassReferenceIds:$cont" reference="klass" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonReferenceInputFilter source="extra.lessonId" reference="lesson" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonAutocompleteInput source="year:$cont" choices={yearChoices} alwaysOn />,
    <DateInput source="extra.fromDate" label="תאריך דיווח אחרי" alwaysOn />,
    <DateInput source="extra.toDate" label="תאריך דיווח לפני" alwaysOn />,
    <CommonReferenceInputFilter source="extra.reportMonthReferenceId" label="תקופת דיווח" reference="report_month" dynamicFilter={filterByUserId} />,
    <CommonAutocompleteInput source="extra.semester" label="מחצית" choices={semesterChoices} />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    const { data } = useListContext();

    const columns = [
        isAdmin && <TextField key="id" source="id" />,
        isAdmin && <ReferenceField key="userId" source="userId" reference="user" />,
        <TextField key="tz" source="tz" />,
        <TextField key="name" source="name" />,
        <CommonSelectArrayField key="year" source="year" choices={yearChoices} />,
        ...(data?.[0]?.headers?.map(item => (
            <TextField key={item.value} source={item.value} label={item.label} sortable={false} />
        )) ?? []),
    ]

    return (
        <CommonDatagrid {...props}>
            {children}
            {columns}
        </CommonDatagrid>
    );
}

const entity = {
    resource: 'student_by_year/pivot?extra.pivot=StudentAttendance',
    Datagrid,
    filters,
    filterDefaultValues,
}

export default getResourceComponents(entity).list;