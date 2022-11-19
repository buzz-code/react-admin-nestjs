import { DateField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const StudentList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <TextField source="tz" />
        <TextField source="name" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);