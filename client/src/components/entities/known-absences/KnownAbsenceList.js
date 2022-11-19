import { DateField, NumberField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const KnownAbsenceList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <TextField source="studentTz" />
        <DateField source="reportDate" />
        <NumberField source="absnceCount" />
        <NumberField source="absnceCode" />
        <TextField source="senderName" />
        <TextField source="reason" />
        <TextField source="comment" />
        <DateField source="createdAt" />
        <DateField source="idCopy1" />
    </CommonList>
);