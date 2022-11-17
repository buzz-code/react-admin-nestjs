import { DateField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';

export const StudentList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <ReferenceField source="userId" reference="users" />
        <TextField source="tz" />
        <TextField source="name" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);