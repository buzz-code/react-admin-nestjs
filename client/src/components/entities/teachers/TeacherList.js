import { DateField, EmailField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';

export const TeacherList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <ReferenceField source="userId" reference="users" />
        <TextField source="tz" />
        <TextField source="name" />
        <TextField source="phone" />
        <TextField source="phone2" />
        <EmailField source="email" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);
