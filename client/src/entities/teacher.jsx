import {
    ArrayInput,
    DateField,
    DateInput,
    DateTimeInput,
    email,
    EmailField,
    FunctionField,
    maxLength,
    ReferenceField,
    required,
    SimpleFormIterator,
    TextField,
    TextInput,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useUnique } from '@shared/utils/useUnique';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

const filters = [
    ...commonAdminFilters,
    <TextInput source="tz:$cont" label="תז" />,
    <TextInput source="name:$cont" alwaysOn />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="tz" />
            <TextField source="name" />
            <TextField source="displayName" />
            <TextField source="number" />
            <TextField source="phone" />
            <TextField source="phone2" />
            <FunctionField
                source="email"
                render={(record) => [].concat(record.email ?? []).map((addr) => (
                    <div key={addr}>
                        <EmailField record={{ email: addr }} source="email" />
                    </div>
                ))}
            />
            <TextField source="comment" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique();
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <TextInput source="tz" validate={[required(), maxLength(10), unique()]} />
            <TextInput source="name" validate={[required(), maxLength(500)]} />
            <TextInput source="displayName" validate={maxLength(500)} />
            <TextInput source="number" validate={[maxLength(10), unique()]} />
            <TextInput source="phone" validate={maxLength(10)} />
            <TextInput source="phone2" validate={maxLength(10)} />
            <ArrayInput source="email">
                <SimpleFormIterator>
                    <TextInput source="" label={false} type="email" validate={email()} />
                </SimpleFormIterator>
            </ArrayInput>
            <TextInput source="comment" validate={maxLength(1000)} />
            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = CommonRepresentation;

const importer = {
    fields: ['tz', 'name', 'number', 'phone', 'phone2', 'email', 'comment', 'displayName'],
};

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    importer,
};

export default getResourceComponents(entity);
