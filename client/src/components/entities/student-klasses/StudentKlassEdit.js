import { DateInput, ReferenceInput, TextInput } from 'react-admin';
import { CommonEdit } from '../../common/CommonEdit';
import { CommonCreate } from '../../common/CommonCreate';

const Fields = ({ isCreate }) => (
    <>
        <TextInput source="id" />
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="studentTz" />
        <ReferenceInput source="klassId" reference="klasses" />
        <DateInput source="createdAt" />
        <DateInput source="updatedAt" />
    </>
)

export const StudentKlassEdit = (props) => (
    <CommonEdit {...props}>
        <Fields isCreate={false} />
    </CommonEdit>
);

export const StudentKlassCreate = (props) => (
    <CommonCreate {...props}>
        <Fields isCreate={true} />
    </CommonCreate>
);
