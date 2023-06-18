import { CommonDatagrid, CommonList } from "@shared/components/crudContainers/CommonList"
import { CommonReferenceInputFilter } from "@shared/components/fields/CommonReferenceInputFilter";
import { useIsAdmin } from "@shared/utils/permissionsUtil";
import { ReferenceField, TextField, useListContext, ReferenceInput, TextInput, AutocompleteInput, SelectField } from "react-admin"
// import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';

const filters = [
    ({ isAdmin }) => isAdmin && <ReferenceInput source="userId" reference="user" />,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="extra.klassId" reference="klass" dynamicFilter={{ userId: 'userId' }} alwaysOn />,
    <CommonReferenceInputFilter source="extra.lessonId" reference="lesson" dynamicFilter={{ userId: 'userId' }} alwaysOn />,
    // <AutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    // ...defaultYearFilter,
};

export default (props) => {
    const isAdmin = useIsAdmin();

    const filtersArr = filters
        .map(item => typeof item === 'function' ? item({ isAdmin }) : item)
        .filter(item => item);

    return (
        <CommonList resource="student/pivot?extra.pivot=StudentAttendance"
            importer={null} exporter={true}
            filters={filtersArr} filterDefaultValues={filterDefaultValues}
            {...props}>
            <Datagrid />
        </CommonList>
    );
}

const Datagrid = ({ ...props }) => {
    const { data } = useListContext();
    const isAdmin = useIsAdmin();

    const columns = [
        isAdmin && <TextField key="id" source="id"/>,
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
