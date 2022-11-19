import { DateField, NumberField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const KlassTypeList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <NumberField source="key" />
        <TextField source="name" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
    </CommonList>
);