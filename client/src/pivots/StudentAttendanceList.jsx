import { CommonDatagrid, CommonList } from "@shared/components/crudContainers/CommonList"
import { useIsAdmin } from "@shared/utils/permissionsUtil";
import { ReferenceField, TextField, useListContext } from "react-admin"

export default (props) => {
    return (
        <CommonList resource="student/pivot?extra.pivot=StudentAttendance"
            importer={null} exporter={false} {...props}>
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
            <TextField key={item.value} source={item.value} label={item.label} />
        )) ?? []),
    ]

    return (
        <CommonDatagrid {...props}>
            {columns}
        </CommonDatagrid>
    );
}
