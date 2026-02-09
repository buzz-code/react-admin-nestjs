import {
    DateField,
    DateTimeInput,
    ReferenceField,
    required,
    TextField,
    TextInput,
    NumberInput,
    maxLength,
    SelectField,
    ArrayInput,
    SimpleFormIterator,
} from "react-admin";
import { CommonDatagrid } from "@shared/components/crudContainers/CommonList";
import { getResourceComponents } from "@shared/components/crudContainers/CommonEntity";
import CommonReferenceInput from "@shared/components/fields/CommonReferenceInput";
import { useUnique } from "@shared/utils/useUnique";
import { commonAdminFilters } from "@shared/components/fields/PermissionFilter";
import { defaultYearFilter, yearChoices } from "@shared/utils/yearFilter";
import CommonAutocompleteInput from "@shared/components/fields/CommonAutocompleteInput";

const filters = [
    ...commonAdminFilters,
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
    <TextInput source="name:$cont" />,
];

const filterDefaultValues = {
    year: defaultYearFilter.year,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props}>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}

            <TextField source="name" />
            <TextField source="quota" />
            <SelectField source="year" choices={yearChoices} />

            <TextField source="requiredLabels" label="שדות חובה" />

            {isAdmin && <DateField source="createdAt" disabled />}
            {isAdmin && <DateField source="updatedAt" disabled />}
        </CommonDatagrid>
    );
};

const Inputs = ({ isCreate, isAdmin }) => {
    const unique = useUnique();
    return (
        <>
            {!isCreate && isAdmin && <TextInput source="id" disabled />}
            {isAdmin && ( <CommonReferenceInput source="userId" reference="user" validate={required()}/> )}
            <TextInput source="name" validate={[required(), maxLength(100)]}/>
            <NumberInput source="quota" step={1} validate={[required()]} />
            <CommonAutocompleteInput source="year" choices={yearChoices} validate={required()} defaultValue={defaultYearFilter.year} />
            <ArrayInput source="requiredLabels">
                <SimpleFormIterator>
                    <TextInput fullWidth />
                </SimpleFormIterator>
            </ArrayInput>

            {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
            {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
        </>
    );
};

const Representation = 'name';

const importer = {
    fields: ["name", "quota", "year"],
};

const entity = {
    Datagrid,
    Inputs,
    Representation,
    filters,
    filterDefaultValues,
    importer,
};

export default getResourceComponents(entity);