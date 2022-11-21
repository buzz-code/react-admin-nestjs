import { DateField, EmailField, ReferenceField, TextField } from 'react-admin';
import { useIsAdmin } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';

export const TeacherList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="tz" />
            <TextField source="name" />
            <TextField source="phone" />
            <TextField source="phone2" />
            <EmailField source="email" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}