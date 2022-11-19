import { DateField, NumberField, TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';
import { UserReferenceField } from '../../common/UserReferenceField';

export const KnownAbsenceList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <CustomReferenceField source="studentTz" reference="students" target="tz" />
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