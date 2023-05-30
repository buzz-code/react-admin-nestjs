import { MenuItemLink } from 'react-admin';
import ListIcon from '@mui/icons-material/List';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import CallIcon from '@mui/icons-material/Call';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import DatasetIcon from '@mui/icons-material/Dataset';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import BaseLayout from "@shared/components/layout/Layout";
import BaseDashboard from '@shared/components/views/Dashboard';

const customMenuItems = [
    <MenuItemLink key="tutorial" to="/tutorial" primaryText="מדריך למשתמש" leftIcon={<HelpIcon />} />,
    <MenuItemLink key="pages-view" to="/pages-view" primaryText="הסברים נוספים" leftIcon={<InfoIcon />} />,
    ({ isAdmin }) => isAdmin && <MenuItemLink key="yemot-simulator" to="/yemot-simulator" primaryText="סימולטור" leftIcon={<CallIcon />} />,
    // <MenuItemLink key="settings" to="/settings" primaryText="הגדרות" leftIcon={<SettingsIcon />} />,
    // <MenuItemLink key="profile" to="/profile" primaryText="פרופיל" leftIcon={<PersonIcon />} />,
];

const menuGroups = [
    { name: 'data', label: 'נתונים', icon: <DatasetIcon /> },
    {
        name: 'report', label: 'דוחות', icon: <AnalyticsIcon />, routes: [
            <MenuItemLink key="student-attendance" to="/student/student-attendance" primaryText="דוח נוכחות (פיבוט)" leftIcon={<SummarizeIcon />} />,
        ]
    },
    { name: 'settings', label: 'הגדרות', icon: <SettingsIcon /> },
    { name: 'admin', label: 'ניהול', icon: <AdminPanelSettingsIcon /> },
];

export const Layout = (props) => (
    <BaseLayout {...props} customMenuItems={customMenuItems} menuGroups={menuGroups} />
);

const dashboardItems = [
    { resource: 'att_report', icon: ListIcon },
    { resource: 'student', icon: ListIcon },
];

export const Dashboard = () => (
    <BaseDashboard items={dashboardItems} />
);
