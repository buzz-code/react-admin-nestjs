import {
    BooleanField,
    BooleanInput,
    DateField,
    FunctionField,
    maxValue,
    minValue,
    NumberField,
    NumberInput,
    ReferenceField,
    required,
    SelectInput,
    TextField,
    TextInput,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { CommonReferenceInputFilter, filterByUserId } from '@shared/components/fields/CommonReferenceInputFilter';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';

const dayOfWeekChoices = [
    { id: 0, name: 'ראשון' },
    { id: 1, name: 'שני' },
    { id: 2, name: 'שלישי' },
    { id: 3, name: 'רביעי' },
    { id: 4, name: 'חמישי' },
    { id: 5, name: 'שישי' },
    { id: 6, name: 'שבת' },
];

const filters = [
    ...commonAdminFilters,
    <TextInput source="name:$cont" alwaysOn />,
    <CommonReferenceInputFilter source="lessonReferenceId" reference="lesson" dynamicFilter={filterByUserId} />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
    const additionalBulkButtons = [
        <BulkActionButton key="runNow" label="הרץ עכשיו" name="runNow" reloadOnEnd />,
    ];

    return (
        <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
            {children}
            {isAdmin && <TextField source="id" />}
            <TextField source="name" />
            <ReferenceField source="lessonReferenceId" reference="lesson" />
            <ReferenceField source="klassReferenceId" reference="klass" />
            <FunctionField
                source="dayOfWeek"
                render={(record) => dayOfWeekChoices.find((c) => c.id === record.dayOfWeek)?.name}
            />
            <NumberField source="weeksBack" />
            <BooleanField source="active" />
            {isAdmin && <DateField showDate showTime source="createdAt" />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
            <TextInput source="name" helperText="שם לזיהוי הכלל, לדוגמה: ניקוי תפילה יום חמישי" />
            <CommonReferenceInput
                source="lessonReferenceId"
                reference="lesson"
                dynamicFilter={filterByUserId}
                validate={required()}
                helperText="השיעור שינוקה"
            />
            <CommonReferenceInput
                source="klassReferenceId"
                reference="klass"
                dynamicFilter={filterByUserId}
                validate={required()}
                helperText="הכיתה/מסלול שישמר - הנוכחות תימחק לכל שאר הכיתות"
            />
            <SelectInput source="dayOfWeek" choices={dayOfWeekChoices} validate={required()} />
            <NumberInput
                source="weeksBack"
                defaultValue={2}
                min={1}
                max={52}
                step={1}
                validate={[required(), minValue(1), maxValue(52)]}
                helperText="כמה שבועות אחורה לנקות בכל הרצה (1-52)"
            />
            <BooleanInput source="active" defaultValue={true} />
        </>
    );
};

const entity = {
    Datagrid,
    Inputs,
    Representation: CommonRepresentation,
    filters,
};

export default getResourceComponents(entity);
