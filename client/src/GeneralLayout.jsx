import { MenuItemLink } from 'react-admin';
import SummarizeIcon from '@mui/icons-material/SummarizeOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlined';
import ImportContactsIcon from '@mui/icons-material/ImportContactsOutlined';
import CallIcon from '@mui/icons-material/CallOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import DocumentScannerIcon from '@mui/icons-material/DocumentScannerOutlined';
import DatasetIcon from '@mui/icons-material/DatasetOutlined';
import AnalyticsIcon from '@mui/icons-material/AnalyticsOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import MapIcon from '@mui/icons-material/MapOutlined';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import EditCalendarIcon from '@mui/icons-material/EditCalendarOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import PercentIcon from '@mui/icons-material/PercentOutlined';
import FileUploadIcon from '@mui/icons-material/FileUploadOutlined';
import ViewListIcon from '@mui/icons-material/ViewListOutlined';
import GridOnIcon from '@mui/icons-material/GridOnOutlined';

import BaseLayout from '@shared/components/layout/Layout';
import BaseDashboard from '@shared/components/views/Dashboard';
import { isYemotSimulator } from '@shared/utils/permissionsUtil';
import {
    isInLessonReport,
    isScannerUpload,
    isOnlyInLessonReport,
    isTeacherView,
    isStudentView,
    isStudentAttendanceByKlass,
} from './utils/appPermissions';
import { useDashboardItems } from './settings/settingsUtil';

const isStandardView = (permissions) =>
    !isOnlyInLessonReport(permissions) && !isTeacherView(permissions) && !isStudentView(permissions);
const shouldShowLessonReports = (permissions) => isInLessonReport(permissions) || isTeacherView(permissions);

const customMenuItems = [
    // static items: render only when NOT restricted to lesson-report-only
    ({ permissions }) =>
        isStandardView(permissions) && (
            <MenuItemLink key="tutorial" to="/tutorial" primaryText="מדריך למשתמש" leftIcon={<HelpIcon />} />
        ),
    ({ permissions }) =>
        isStandardView(permissions) && (
            <MenuItemLink
                key="pages-view"
                to="/pages-view"
                primaryText="הסברים נוספים"
                leftIcon={<ImportContactsIcon />}
            />
        ),
    ({ permissions }) =>
        isStandardView(permissions) &&
        isYemotSimulator(permissions) && (
            <MenuItemLink key="yemot-simulator" to="/yemot-simulator" primaryText="סימולטור" leftIcon={<CallIcon />} />
        ),
    // permission-based items: show only when not restricted
    ({ permissions }) =>
        isStandardView(permissions) &&
        isScannerUpload(permissions) && (
            <MenuItemLink
                key="scanner-upload"
                to="/scanner-upload"
                primaryText="העלאת קבצי סורק"
                leftIcon={<DocumentScannerIcon />}
            />
        ),
    // lesson report links: show when user has lesson-report permission OR when they're in-only mode
    ({ permissions }) =>
        shouldShowLessonReports(permissions) && (
            <MenuItemLink
                key="in-lesson-report-att"
                to="/in-lesson-report-att"
                primaryText="טופס נוכחות"
                leftIcon={<EventAvailableIcon />}
            />
        ),
    ({ permissions }) =>
        shouldShowLessonReports(permissions) && (
            <MenuItemLink
                key="in-lesson-report-grade"
                to="/in-lesson-report-grade"
                primaryText="טופס ציונים"
                leftIcon={<EditCalendarIcon />}
            />
        ),
    ({ permissions }) =>
        isStandardView(permissions) && (
            <MenuItemLink key="roadmap" to="/roadmap" primaryText="פיתוחים עתידיים" leftIcon={<MapIcon />} />
        ),
    ({ permissions }) =>
        isStandardView(permissions) && (
            <MenuItemLink
                key="michlol-file-helper"
                to="/michlol-file-helper"
                primaryText="עדכון קבצי מכלול"
                leftIcon={<ContentPasteSearchIcon />}
            />
        ),
    ({ permissions }) =>
        isStandardView(permissions) && (
            <MenuItemLink key="settings" to="/settings" primaryText="הגדרות משתמש" leftIcon={<SettingsIcon />} />
        ),
];

const menuGroups = [
    ({ permissions }) =>
        isStandardView(permissions) && {
            name: 'data',
            icon: <DatasetIcon />,
            routes: [
                <MenuItemLink
                    key="approved-absences-upload"
                    to="/approved-absences-upload"
                    primaryText="העלאת חיסורים מאושרים"
                    leftIcon={<FileUploadIcon />}
                />,
            ],
        },
    ({ permissions }) =>
        !isOnlyInLessonReport(permissions) &&
        !isStudentView(permissions) && {
            name: 'report',
            icon: <AnalyticsIcon />,
            routes: [
                ({ permissions }) =>
                    !isTeacherView(permissions) && (
                        <MenuItemLink
                            key="student-attendance"
                            to="/student/student-attendance"
                            primaryText="דוח נוכחות (פיבוט)"
                            leftIcon={<SummarizeIcon />}
                        />
                    ),
                ({ permissions }) =>
                    !isTeacherView(permissions) &&
                    isStudentAttendanceByKlass(permissions) && (
                        <MenuItemLink
                            key="student-attendance-by-klass"
                            to="/student/student-attendance-by-klass"
                            primaryText="נוכחות לפי כיתה (פיבוט)"
                            leftIcon={<GridOnIcon />}
                        />
                    ),
                <MenuItemLink
                    key="percent-report-with-dates"
                    to="/percent-report-with-dates"
                    primaryText="דוח אחוזים לתלמידה"
                    leftIcon={<PercentIcon />}
                />,
                ({ permissions }) =>
                    isTeacherView(permissions) && (
                        <MenuItemLink
                            key="att_report_with_report_month_lead"
                            to="/att_report_with_report_month_lead"
                            primaryText="דוח נוכחות לרכזת"
                            leftIcon={<ViewListIcon />}
                        />
                    ),
            ],
        },
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
