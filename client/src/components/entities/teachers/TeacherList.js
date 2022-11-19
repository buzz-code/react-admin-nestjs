import { DateField, EmailField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const TeacherList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <TextField source="tz" />
        <TextField source="name" />
        <TextField source="phone" />
        <TextField source="phone2" />
        <EmailField source="email" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);
