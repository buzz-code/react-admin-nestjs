import { DateField, NumberField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const KlassList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <NumberField source="key" />
        <TextField source="name" />
        <ReferenceField source="klassTypeId" reference="klassTypes" />
        <ReferenceField source="teacherId" reference="teachers" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);
