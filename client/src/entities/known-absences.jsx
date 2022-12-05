import { DateField, DateInput, NumberField, NumberInput, ReferenceField, ReferenceInput, TextField, TextInput } from 'react-admin';
import { useIsAdmin } from '../common/components/AdminRestricted';
import { CommonList } from '../common/components/CommonList';
import { CommonReferenceField } from '../common/components/CommonReferenceField';
import { CommonEdit } from '../common/components/CommonEdit';
import { CommonCreate } from '../common/components/CommonCreate';

export const KnownAbsenceList = () => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <CommonReferenceField source="studentTz" reference="students" target="tz" />
            <DateField source="reportDate" />
            <NumberField source="absnceCount" />
            <NumberField source="absnceCode" />
            <TextField source="senderName" />
            <TextField source="reason" />
            <TextField source="comment" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="idCopy1" />}
        </CommonList>
    );
}

const Fields = ({ isCreate }) => {
    const isAdmin = useIsAdmin();

    return <>
        {!isCreate && isAdmin && <TextInput source="id" disabled />}
        {isAdmin && <ReferenceInput source="userId" reference="users" />}
        <TextInput source="studentTz" />
        <DateInput source="reportDate" />
        <NumberInput source="absnceCount" />
        <NumberInput source="absnceCode" />
        <TextInput source="senderName" />
        <TextInput source="reason" />
        <TextInput source="comment" />
        {!isCreate && isAdmin && <DateInput source="createdAt" disabled />}
        {!isCreate && isAdmin && <DateInput source="updatedAt" disabled />}
    </>
}

export const KnownAbsenceEdit = () => (
    <CommonEdit>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const KnownAbsenceCreate = () => (
    <CommonCreate>
        <Fields isCreate={true} />
    </CommonCreate>
);
