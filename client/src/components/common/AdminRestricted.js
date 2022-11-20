import { DateField, ReferenceField, Resource, TextField, usePermissions } from "react-admin";

export const useIsAdmin = () => {
    const { permissions } = usePermissions();
    return isAdmin(permissions);
}

export function isAdmin(permissions) {
    return permissions.includes('admin');
}

const withAdminRestriction = WrappedComponent => (props) => {
    const isAdmin = useIsAdmin();
    if (isAdmin) {
        return <WrappedComponent {...props} />
    }
    return null;
}

export const AdminTextField = withAdminRestriction(TextField);
AdminTextField.defaultProps = TextField.defaultProps;

export const AdminDateField = withAdminRestriction(DateField);
AdminDateField.defaultProps = DateField.defaultProps;

export const AdminReferenceField = withAdminRestriction(ReferenceField);
AdminReferenceField.defaultProps = ReferenceField.defaultProps;
