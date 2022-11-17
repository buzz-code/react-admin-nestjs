import { DateField, NumberField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';

export const LessonList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <ReferenceField source="userId" reference="users" />
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