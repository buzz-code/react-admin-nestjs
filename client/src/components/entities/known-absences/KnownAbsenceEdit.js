import { DateInput, NumberInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';
import { CommonCreate } from '../../common/CommonCreate';

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="studentTz" />
        <DateInput source="reportDate" />
        <NumberInput source="absnceCount" />
        <NumberInput source="absnceCode" />
        <TextInput source="senderName" />
        <TextInput source="reason" />
        <TextInput source="comment" />
        <DateInput source="createdAt" />
        <DateInput source="idCopy1" />
    </>
)

export const KnownAbsenceEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const KnownAbsenceCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
