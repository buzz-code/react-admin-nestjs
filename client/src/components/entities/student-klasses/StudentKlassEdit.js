import { DateInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';

export const StudentKlassEdit = (props) => (
    <CommonEdit {...props}>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="studentTz" />
        <ReferenceInput source="klassId" reference="klasses" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </CommonEdit>
);