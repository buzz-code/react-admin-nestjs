import { DateField, ReferenceField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const StudentKlassList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <TextField source="studentTz" />
        <ReferenceField source="klassId" reference="klasses" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);