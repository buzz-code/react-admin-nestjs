import { MenuItemLink } from 'react-admin';
import ListIcon from '@mui/icons-material/List';
import LabelIcon from '@mui/icons-material/Label';

import BaseLayout from "@buzz-code/crud-nestjs-react-admin/client/components/Layout";
import BaseDashboard from '@buzz-code/crud-nestjs-react-admin/client/components/Dashboard';

const customMenuItems = [
    <MenuItemLink key="yemot-simulator" to="/yemot-simulator" primaryText="סימולטור" leftIcon={<LabelIcon />} />,
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
