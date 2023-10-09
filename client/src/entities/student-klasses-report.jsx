import { ReferenceField, TextField, SelectField } from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceArrayField, MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

const filters = [
    <CommonAutocompleteInput source="year" choices={yearChoices} alwaysOn />,
];

const filterDefaultValues = {
    ...defaultYearFilter,
};

const Datagrid = ({ isAdmin, children, ...props }) => {
    return (
        <CommonDatagrid {...props} readonly>
            {children}
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="user" />}
            <MultiReferenceField source="studentReferenceId" sortBy="studentName" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
            <MultiReferenceField label="תז תלמידה" source="studentReferenceId" sortBy="studentName" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz">
                <TextField source="tz" />
            </MultiReferenceField>
            <SelectField source="year" choices={yearChoices} />
            {/* <TextField source="klasses1" />
            <TextField source="klasses2" />
            <TextField source="klasses3" />
            <TextField source="klassesNull" /> */}
            <MultiReferenceArrayField source="klassReferenceId1" sortBy="name" reference="klass" target="id" />
            <MultiReferenceArrayField source="klassReferenceId2" sortBy="name" reference="klass" target="id" />
            <MultiReferenceArrayField source="klassReferenceId3" sortBy="name" reference="klass" target="id" />
            <MultiReferenceArrayField source="klassReferenceIdNull" sortBy="name" reference="klass" target="id" />
        </CommonDatagrid>
    );
}

const entity = {
    Datagrid,
    filters,
    filterDefaultValues,
    exporter: false,
};

export default getResourceComponents(entity);
