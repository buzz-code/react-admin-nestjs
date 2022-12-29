import { DateField, DateInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { CommonDatagrid } from '@shared/components/CommonList';
import { CommonReferenceField } from '@shared/components/CommonReferenceField';
import { CommonReferenceInput } from '@shared/components/CommonRefenceInput';
import { getResourceComponents } from '@shared/components/CommonEntity';


const Datagrid = ({ isAdmin, ...props }) => {
    return (
        <CommonDatagrid>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <CommonReferenceField source="studentTz" reference="student" target="tz" />
            <CommonReferenceField source="klassId" reference="klass" target="key" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonDatagrid>
    );
}

const Inputs = ({ isCreate, isAdmin }) => {
    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="user" />}
        <CommonReferenceInput source="studentTz" reference="student" optionValue="tz" />
        <CommonReferenceInput source="klassId" reference="klass" optionValue="key" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

const entity = {
    Datagrid,
    Inputs,
};

export default getResourceComponents(entity);
