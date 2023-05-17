import { CommonDatagrid, CommonList } from "@shared/components/crudContainers/CommonList"
import { useIsAdmin } from "@shared/utils/permissionsUtil";
import { ReferenceField, TextField, useListContext, ReferenceInput, TextInput } from "react-admin"

export default (props) => {
    const isAdmin = useIsAdmin();

    const filters = [
        isAdmin && <ReferenceInput source="userId" reference="user" />,
        <TextInput source="tz:$cont" label="תז" />,
        <TextInput source="name:$cont" alwaysOn />,
    ].filter(item => item);

    return (
        <CommonList resource="student/pivot?extra.pivot=StudentAttendance"
            importer={null} exporter={false} filters={filters} {...props}>
            <Datagrid />
        </CommonList>
    );
}

const Datagrid = ({ ...props }) => {
    const { data } = useListContext();
    const isAdmin = useIsAdmin();

    const columns = [
        isAdmin && <TextField source="id" />,
        isAdmin && <ReferenceField source="userId" reference="user" />,
        <TextField source="tz" />,
        <TextField source="name" />,
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
