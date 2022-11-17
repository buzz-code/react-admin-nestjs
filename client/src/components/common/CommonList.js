import { List, Datagrid } from 'react-admin';

export const CommonList = ({ children, ...props }) => (
    <List {...props}>
        <Datagrid rowClick="edit">
            {children}
        </Datagrid>
    </List>
)