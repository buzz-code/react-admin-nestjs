import {
  DateField,
  DateTimeInput,
  ReferenceField,
  required,
  TextField,
  TextInput,
  NumberInput,
  maxLength,
  TimeInput,
  FunctionField,
  SelectField,
} from "react-admin";
import { CommonDatagrid } from "@shared/components/crudContainers/CommonList";
import { CommonRepresentation } from "@shared/components/CommonRepresentation";
import { getResourceComponents } from "@shared/components/crudContainers/CommonEntity";
import CommonReferenceInput from "@shared/components/fields/CommonReferenceInput";
import { useUnique } from "@shared/utils/useUnique";
import { commonAdminFilters } from "@shared/components/fields/PermissionFilter";
import { defaultYearFilter, yearChoices } from "@shared/utils/yearFilter";
import CommonAutocompleteInput from "@shared/components/fields/CommonAutocompleteInput";

const filters = [
  ...commonAdminFilters,
  <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
  <TextInput source="key:$cont" label="שילוט" />,
  <TextInput source="description:$cont" label="תיאור" />,
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
      <TextField source="key" />
      <FunctionField
        source="departureTime"
        render={(record) => {
          if (!record.departureTime) return "";
          const date = new Date(record.departureTime);
          return date.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }}
      />

      <TextField source="description" />
      <SelectField source="year" choices={yearChoices} />
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
      {isAdmin && (
        <CommonReferenceInput
          source="userId"
          reference="user"
          validate={required()}
        />
      )}

      <NumberInput source="key" validate={[required(), unique()]} />
      <TimeInput source="departureTime" validate={[required()]} />
      <CommonAutocompleteInput
        source="year"
        choices={yearChoices}
        validate={required()}
        defaultValue={defaultYearFilter.year}
      />

      <TextInput source="description" multiline validate={maxLength(1000)} />

      {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
      {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    </>
  );
};

const Representation = CommonRepresentation;

const importer = {
  fields: ["key", "year", "departureTime", "description"],
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
