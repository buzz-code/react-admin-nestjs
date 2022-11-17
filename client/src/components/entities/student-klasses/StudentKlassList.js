import { DateField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';

export const StudentKlassList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <ReferenceField source="userId" reference="users" />
        <TextField source="studentTz" />
        <ReferenceField source="klassId" reference="klasses" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);