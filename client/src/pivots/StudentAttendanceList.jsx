import { getResourceComponents } from "@shared/components/crudContainers/CommonEntity";
import { CommonDatagrid } from "@shared/components/crudContainers/CommonList"
import { CommonReferenceInputFilter, filterByUserId } from "@shared/components/fields/CommonReferenceInputFilter";
import { useIsAdmin } from "@shared/utils/permissionsUtil";
import { ReferenceField, TextField, useListContext, ReferenceInput, TextInput, AutocompleteInput, SelectField } from "react-admin"
// import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="extra.klassId" reference="klass" dynamicFilter={filterByUserId} alwaysOn />,
    <CommonReferenceInputFilter source="extra.lessonId" reference="lesson" dynamicFilter={filterByUserId} alwaysOn />,
    // <AutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    // ...defaultYearFilter,
};

const Datagrid = ({ ...props }) => {
    const { data } = useListContext();
    const isAdmin = useIsAdmin();

    const columns = [
        isAdmin && <TextField key="id" source="id" />,
        isAdmin && <ReferenceField key="userId" source="userId" reference="user" />,
        <TextField key="tz" source="tz" />,
        <TextField key="name" source="name" />,
        // <SelectField key="year" source="year" choices={yearChoices} />,
        ...(data?.[0]?.headers?.map(item => (
            <TextField key={item.value} source={item.value} label={item.label} sortable={false} />
        )) ?? []),
    ]

    return (
        <CommonDatagrid {...props}>
            {columns}
        </CommonDatagrid>
    );
}

const entity = {
    resource: 'student/pivot?extra.pivot=StudentAttendance',
    Datagrid,
    filters,
    filterDefaultValues,
}

export default getResourceComponents(entity).list;