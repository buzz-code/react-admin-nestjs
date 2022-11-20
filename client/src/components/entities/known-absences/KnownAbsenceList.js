import { DateField, NumberField, TextField } from 'react-admin';
import { AdminDateField, AdminReferenceField, AdminTextField } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const KnownAbsenceList = (props) => (
    <CommonList {...props}>
        <AdminTextField source="id" />
        <AdminReferenceField source="userId" reference="users" />
        <CustomReferenceField source="studentTz" reference="students" target="tz" />
        <DateField source="reportDate" />
        <NumberField source="absnceCount" />
        <NumberField source="absnceCode" />
        <TextField source="senderName" />
        <TextField source="reason" />
        <TextField source="comment" />
        <AdminDateField source="createdAt" />
        <AdminDateField source="idCopy1" />
    </CommonList>
);