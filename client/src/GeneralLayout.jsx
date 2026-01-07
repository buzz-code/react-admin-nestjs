import { MenuItemLink } from 'react-admin';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HelpIcon from '@mui/icons-material/Help';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import CallIcon from '@mui/icons-material/Call';
import SettingsIcon from '@mui/icons-material/Settings';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import DatasetIcon from '@mui/icons-material/Dataset';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MapIcon from '@mui/icons-material/Map';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PercentIcon from '@mui/icons-material/Percent';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import BaseLayout from "@shared/components/layout/Layout";
import BaseDashboard from '@shared/components/views/Dashboard';
import { isInLessonReport, isScannerUpload, isOnlyInLessonReport, isTeacherView } from './utils/appPermissions';
import { useDashboardItems } from './settings/settingsUtil';

const isStandardView = (permissions) => !isOnlyInLessonReport(permissions) && !isTeacherView(permissions);
const shouldShowLessonReports = (permissions) => isInLessonReport(permissions) || isTeacherView(permissions);

const customMenuItems = [
    // static items: render only when NOT restricted to lesson-report-only
    ({ permissions }) => isStandardView(permissions) && <MenuItemLink key="tutorial" to="/tutorial" primaryText="מדריך למשתמש" leftIcon={<HelpIcon />} />,
    ({ permissions }) => isStandardView(permissions) && <MenuItemLink key="pages-view" to="/pages-view" primaryText="הסברים נוספים" leftIcon={<ImportContactsIcon />} />,
    // admin-only
    ({ isAdmin, permissions }) => isStandardView(permissions) && isAdmin && <MenuItemLink key="yemot-simulator" to="/yemot-simulator" primaryText="סימולטור" leftIcon={<CallIcon />} />,
    // permission-based items: show only when not restricted
    ({ permissions }) => isStandardView(permissions) && isScannerUpload(permissions) && <MenuItemLink key="scanner-upload" to="/scanner-upload" primaryText="העלאת קבצי סורק" leftIcon={<DocumentScannerIcon />} />,
    // lesson report links: show when user has lesson-report permission OR when they're in-only mode
    ({ permissions }) => (shouldShowLessonReports(permissions)) && <MenuItemLink key="in-lesson-report-att" to="/in-lesson-report-att" primaryText="טופס נוכחות" leftIcon={<EventAvailableIcon />} />,
    ({ permissions }) => (shouldShowLessonReports(permissions)) && <MenuItemLink key="in-lesson-report-grade" to="/in-lesson-report-grade" primaryText="טופס ציונים" leftIcon={<EditCalendarIcon />} />,
    ({ permissions }) => isStandardView(permissions) && <MenuItemLink key="roadmap" to="/roadmap" primaryText="פיתוחים עתידיים" leftIcon={<MapIcon />} />,
    ({ permissions }) => isStandardView(permissions) && <MenuItemLink key="michlol-file-helper" to="/michlol-file-helper" primaryText="עדכון קבצי מכלול" leftIcon={<ContentPasteSearchIcon />} />,
    ({ permissions }) => isStandardView(permissions) && <MenuItemLink key="settings" to="/settings" primaryText="הגדרות משתמש" leftIcon={<SettingsIcon />} />,
];

const menuGroups = [
    ({ permissions }) => (isStandardView(permissions)) && ({
        name: 'data', icon: <DatasetIcon />, routes: [
            <MenuItemLink key="approved-absences-upload" to="/approved-absences-upload" primaryText="העלאת חיסורים מאושרים" leftIcon={<FileUploadIcon />} />
        ]
    }),
    ({ permissions }) => ((!isInLessonReport(permissions)) || (isTeacherView(permissions))) && ({
        name: 'report', icon: <AnalyticsIcon />, routes: [
            <MenuItemLink key="student-attendance" to="/student/student-attendance" primaryText="דוח נוכחות (פיבוט)" leftIcon={<SummarizeIcon />} />,
            <MenuItemLink key="percent-report-with-dates" to="/percent-report-with-dates" primaryText="דוח אחוזים לתלמידה" leftIcon={<PercentIcon />} />,
        ]
    }),
    { name: 'settings', icon: <SettingsIcon /> },
    { name: 'admin', icon: <AdminPanelSettingsIcon /> },
];

export const Layout = ({ children }) => (
    <BaseLayout customMenuItems={customMenuItems} menuGroups={menuGroups}>
        {children}
    </BaseLayout>
);

export const Dashboard = () => {
    const dashboardItems = useDashboardItems();
    return <BaseDashboard dashboardItems={dashboardItems} />;
};
