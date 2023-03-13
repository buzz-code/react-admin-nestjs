import { MenuItemLink } from 'react-admin';
import ListIcon from '@mui/icons-material/List';
import LabelIcon from '@mui/icons-material/Label';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

import BaseLayout from "@shared/components/layout/Layout";
import BaseDashboard from '@shared/components/views/Dashboard';

const customMenuItems = [
    <MenuItemLink key="yemot-simulator" to="/yemot-simulator" primaryText="סימולטור" leftIcon={<LabelIcon />} />,
    // <MenuItemLink key="settings" to="/settings" primaryText="הגדרות" leftIcon={<SettingsIcon />} />,
    // <MenuItemLink key="profile" to="/profile" primaryText="פרופיל" leftIcon={<PersonIcon />} />,
];

export const Layout = (props) => (
    <BaseLayout {...props} customMenuItems={customMenuItems} />
);

const dashboardItems = [
    { resource: 'att_report', icon: ListIcon },
    { resource: 'student', icon: ListIcon },
];

export const Dashboard = () => (
    <BaseDashboard items={dashboardItems} />
);
