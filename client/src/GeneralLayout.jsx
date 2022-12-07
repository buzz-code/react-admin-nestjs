import { MenuItemLink } from 'react-admin';
import DollarIcon from '@mui/icons-material/AttachMoney';
import LabelIcon from '@mui/icons-material/Label';

import Dashboard from "@buzz-code/crud-nestjs-react-admin/client/components/Dashboard";
import BaseLayout from "@buzz-code/crud-nestjs-react-admin/client/components/Layout";

const customMenuItems = [
    <MenuItemLink to="/yemot-simulator" primaryText="סימולטור" leftIcon={<LabelIcon />} />,
];

export const Layout = (props) => (
    <BaseLayout {...props} customMenuItems={customMenuItems} />
);

const dashboardItems = [
    { resource: 'att_report', icon: DollarIcon },
    { resource: 'student', icon: DollarIcon },
];

export const MyDashboard = () => (
    <Dashboard items={dashboardItems} />
);
