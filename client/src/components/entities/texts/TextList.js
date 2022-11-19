import { TextField } from 'react-admin';
import { CommonList } from '../../common/CommonList';
import { UserReferenceField } from '../../common/UserReferenceField';

export const TextList = (props) => (
    <CommonList {...props}>
        <TextField source="id" />
        <UserReferenceField />
        <TextField source="name" />
        <TextField source="description" />
        <TextField source="value" />
    </CommonList>
);
