import { DateField, NumberField, ReferenceField, TextField } from 'react-admin';
import { useIsAdmin } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const LessonList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <NumberField source="key" />
            <TextField source="name" />
            <TextField source="klasses" />
            <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}