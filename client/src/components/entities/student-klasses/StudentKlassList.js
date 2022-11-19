import { DateField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';
import { UserReferenceField } from '../../common/UserReferenceField';

export const StudentKlassList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <CustomReferenceField source="studentTz" reference="students" target="tz" />
        <CustomReferenceField source="klassId" reference="klasses" target="key" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);