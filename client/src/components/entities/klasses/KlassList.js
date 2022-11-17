import { DateField, NumberField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';

export const KlassList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <ReferenceField source="userId" reference="users" />
        <NumberField source="key" />
        <TextField source="name" />
        <ReferenceField source="klassTypeId" reference="klassTypes" />
        <ReferenceField source="teacherId" reference="teachers" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);
