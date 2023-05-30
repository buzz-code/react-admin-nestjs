import { CommonDatagrid, CommonList } from "@shared/components/crudContainers/CommonList"
import { CommonReferenceInputFilter } from "@shared/components/fields/CommonReferenceInputFilter";
import { useIsAdmin } from "@shared/utils/permissionsUtil";
import { ReferenceField, TextField, useListContext, ReferenceInput, TextInput } from "react-admin"

export default (props) => {
    const isAdmin = useIsAdmin();

    const filters = [
        isAdmin && <ReferenceInput source="userId" reference="user" />,
        <TextInput source="tz:$cont" label="תז" />,
        <TextInput source="name:$cont" alwaysOn />,
        <CommonReferenceInputFilter source="extra.klassId" reference="klass" alwaysOn />,
        <CommonReferenceInputFilter source="extra.lessonId" reference="lesson" alwaysOn />,
    ].filter(item => item);

    return (
        <CommonList resource="student/pivot?extra.pivot=StudentAttendance"
            importer={null} exporter={true} filters={filters} {...props}>
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
