import { ReferenceField, TextField } from 'react-admin';
import { useIsAdmin } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';

export const TextList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="name" />
            <TextField source="description" />
            <TextField source="value" />
        </CommonList>
    );
}