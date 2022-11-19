import { DateField, NumberField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const LessonList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <NumberField source="key" />
        <TextField source="name" />
        <DateField source="klasses" />
        <ReferenceField source="teacherId" reference="teachers" />
        <DateField source="startDate" />
        <DateField source="endDate" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);