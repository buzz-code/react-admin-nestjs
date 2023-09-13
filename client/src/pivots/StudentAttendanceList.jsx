import { getResourceComponents } from "@shared/components/crudContainers/CommonEntity";
import { CommonDatagrid } from "@shared/components/crudContainers/CommonList"
import { CommonReferenceInputFilter, filterByUserIdAndYear } from "@shared/components/fields/CommonReferenceInputFilter";
import { ReferenceField, TextField, useListContext, ReferenceInput, TextInput } from "react-admin"
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonSelectArrayField } from "@shared/components/fields/CommonSelectArrayField";

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="extra.klassId" reference="klass" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonReferenceInputFilter source="extra.lessonId" reference="lesson" dynamicFilter={filterByUserIdAndYear} alwaysOn />,
    <CommonAutocompleteInput source="year:$cont" choices={yearChoices} alwaysOn />,
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