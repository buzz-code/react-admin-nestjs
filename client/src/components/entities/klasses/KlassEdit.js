import { DateInput, NumberInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';

export const KlassEdit = (props) => (
    <CommonEdit {...props}>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <NumberInput source="key" />
        <TextInput source="name" />
        <ReferenceInput source="klassTypeId" reference="klassTypes" />
        <ReferenceInput source="teacherId" reference="teachers" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </CommonEdit>
);
