import { Menu, useResourceDefinitions } from 'react-admin';
import LabelIcon from '@mui/icons-material/Label';

const CustomMenu = ({ hasDashboard }) => {
    const resources = useResourceDefinitions();

    return (
        <Menu>
            {hasDashboard && (
                <Menu.DashboardItem key="default-dashboard-menu-item" />
            )}
            {Object.keys(resources).map(name => (
                <Menu.ResourceItem key={name} name={name} />
            ))}
            <Menu.Item to="/yemot-simulator" primaryText="סימולטור" leftIcon={<LabelIcon />} />
        </Menu>
    );
};

export default CustomMenu;