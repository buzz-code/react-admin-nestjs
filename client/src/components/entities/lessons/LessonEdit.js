import { DateInput, NumberInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';

export const LessonEdit = (props) => (
    <CommonEdit {...props}>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <NumberInput source="key" />
        <TextInput source="name" />
        <DateInput source="klasses" />
        <ReferenceInput source="teacherId" reference="teachers" />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </CommonEdit>
);
