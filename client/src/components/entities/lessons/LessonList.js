import { DateField, NumberField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';
import { UserReferenceField } from '../../common/UserReferenceField';

export const LessonList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <NumberField source="key" />
        <TextField source="name" />
        <DateField source="klasses" />
        <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
        <DateField source="startDate" />
        <DateField source="endDate" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);