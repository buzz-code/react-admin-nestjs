import { MenuItemLink } from 'react-admin';
import ListIcon from '@mui/icons-material/List';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HelpIcon from '@mui/icons-material/Help';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import CallIcon from '@mui/icons-material/Call';
import SettingsIcon from '@mui/icons-material/Settings';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import PersonIcon from '@mui/icons-material/Person';
import DatasetIcon from '@mui/icons-material/Dataset';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import BaseLayout from "@shared/components/layout/Layout";
import BaseDashboard from '@shared/components/views/Dashboard';
import { defaultYearFilter } from '@shared/utils/yearFilter';
import { isScannerUpload } from '../shared/utils/permissionsUtil';

const customMenuItems = [
    <MenuItemLink key="tutorial" to="/tutorial" primaryText="מדריך למשתמש" leftIcon={<HelpIcon />} />,
    <MenuItemLink key="pages-view" to="/pages-view" primaryText="הסברים נוספים" leftIcon={<ImportContactsIcon />} />,
    ({ isAdmin }) => isAdmin && <MenuItemLink key="yemot-simulator" to="/yemot-simulator" primaryText="סימולטור" leftIcon={<CallIcon />} />,
    ({ permissions }) => isScannerUpload(permissions) && <MenuItemLink key="scanner-upload" to="/scanner-upload" primaryText="העלאת קבצי סורק" leftIcon={<DocumentScannerIcon />} />,
    // <MenuItemLink key="settings" to="/settings" primaryText="הגדרות" leftIcon={<SettingsIcon />} />,
    // <MenuItemLink key="profile" to="/profile" primaryText="פרופיל" leftIcon={<PersonIcon />} />,
];

const menuGroups = [
    { name: 'data', icon: <DatasetIcon /> },
    {
        name: 'report', icon: <AnalyticsIcon />, routes: [
            <MenuItemLink key="student-attendance" to="/student/student-attendance" primaryText="דוח נוכחות (פיבוט)" leftIcon={<SummarizeIcon />} />,
            <MenuItemLink key="percent-report-with-dates" to="/percent-report-with-dates" primaryText="דוח אחוזים לתלמידה" leftIcon={<SummarizeIcon />} />,
        ]
    },
    { name: 'settings', icon: <SettingsIcon /> },
    { name: 'admin', icon: <AdminPanelSettingsIcon /> },
];

export const Layout = (props) => (
    <BaseLayout {...props} customMenuItems={customMenuItems} menuGroups={menuGroups} />
);

const dashboardItems = [
    { resource: 'att_report', icon: ListIcon, filter: defaultYearFilter },
    { resource: 'student_by_year', icon: ListIcon, filter: { 'year:$cont': defaultYearFilter.year } },
];

export const Dashboard = () => (
    <BaseDashboard items={dashboardItems} />
);
