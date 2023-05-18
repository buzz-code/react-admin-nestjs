import { ReferenceField, TextField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';

const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid {...props} readonly>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="studentName" optionalSource="studentTz" reference="student" optionalTarget="tz" />
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

export default getResourceComponents(entity);
