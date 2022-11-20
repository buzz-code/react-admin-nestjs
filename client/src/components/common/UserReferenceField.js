import { ReferenceField, usePermissions } from 'react-admin';

export const UserReferenceField = () => {
    const { permissions } = usePermissions();

    if (!permissions.includes('admin')) {
        return null;
    }

    return (
        <ReferenceField source="userId" reference="users" label="userId" />
    );
}
