import { ReferenceField, TextField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonReferenceField } from '@shared/components/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props} readonly>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <CommonReferenceField source="studentTz" reference="student" target="tz" />
            <TextField source="klasses1" />
            <TextField source="klasses2" />
            <TextField source="klasses3" />
            <TextField source="klassesNull" />
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    exporter: false,
};

export default {
    ...getResourceComponents(entity),
    create: null,
    edit: null,
};
