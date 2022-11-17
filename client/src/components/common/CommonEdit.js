import { Edit, SimpleForm } from 'react-admin';

export const CommonEdit = ({ children, ...props }) => (
    <Edit {...props}>
        <SimpleForm>
            {children}
        </SimpleForm>
    </Edit>
)