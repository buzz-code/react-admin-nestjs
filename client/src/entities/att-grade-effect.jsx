import {
    NumberInput,
    TextField,
    TextInput,
    ReferenceField,
    DateField,
    DateTimeInput,
    required,
    maxLength,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { adminUserFilter } from '@shared/components/fields/PermissionFilter';

const filters = [
    adminUserFilter,
    <NumberInput source="percents" />,
    <NumberInput source="count" />,
    <NumberInput source="effect" />,
    <NumberInput source="effectPercent" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <TextField source="percents" />
            <TextField source="count" />
            <TextField source="effect" />
            <TextField source="effectPercent" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
            {isAdmin && <DateField showDate showTime source="updatedAt" />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <NumberInput source="percents" />
            <NumberInput source="count" />
            <NumberInput source="effect" helperText="נקודות להוספה/הפחתה מהציון (יש למלא שדה זה או את שדה ההשפעה באחוזים)" />
            <NumberInput
                source="effectPercent"
                helperText="אחוז מהציון המקורי, בין 1 ל-100 (יש למלא שדה זה או את שדה ההשפעה)"
            />
            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const importer = {
    fields: ['percents', 'count', 'effect', 'effectPercent'],
};

const entity = {
    Datagrid,
    Inputs,
    filters,
    importer,
};

export default getResourceComponents(entity);
