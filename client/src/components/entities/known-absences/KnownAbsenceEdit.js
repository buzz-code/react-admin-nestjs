import { DateInput, Edit, NumberInput, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const KnownAbsenceEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="studentTz" />
            <DateInput source="reportDate" />
            <NumberInput source="absnceCount" />
            <NumberInput source="absnceCode" />
            <TextInput source="senderName" />
            <TextInput source="reason" />
            <TextInput source="comment" />
            <DateInput source="createdAt" />
            <DateInput source="idCopy1" />
        </SimpleForm>
    </Edit>
);