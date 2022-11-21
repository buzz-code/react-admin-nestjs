import { TextField, ReferenceField, DateField } from 'react-admin';
import { useIsAdmin } from '../../common/AdminRestricted';
import { CommonList } from '../../common/CommonList';
import { CustomReferenceField } from '../../common/CustomReferenceField';

export const KlassList = (props) => {
    const isAdmin = useIsAdmin();

    return (
        <CommonList {...props}>
            {isAdmin && <TextField source="id" />}
            {isAdmin && <ReferenceField source="userId" reference="users" />}
            <TextField source="key" />
            <TextField source="name" />
            <CustomReferenceField source="klassTypeId" reference="klass_types" target="id" />
            <CustomReferenceField source="teacherId" reference="teachers" target="tz" />
            {isAdmin && <DateField source="createdAt" />}
            {isAdmin && <DateField source="updatedAt" />}
        </CommonList>
    );
}