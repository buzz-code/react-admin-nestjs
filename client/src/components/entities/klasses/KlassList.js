import { DateField, NumberField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';
import { UserReferenceField } from '../../common/UserReferenceField';

export const KlassList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <NumberField source="key" />
        <TextField source="name" />
        <CustomReferenceField source="klassTypeId" reference="klass_types" target="id" />
        <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);
