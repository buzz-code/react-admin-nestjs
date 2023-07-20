import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';

import domainTranslations from 'src/domainTranslations';
import dataProvider from "@shared/providers/dataProvider";
import { getI18nProvider } from "@shared/providers/i18nProvider";
import authProvider from "@shared/providers/authProvider";
import theme from "@shared/providers/themeProvider";
import RTLStyle from "@shared/components/layout/RTLStyle";

import { Dashboard, Layout } from 'src/GeneralLayout';

import { resourceEntityGuesser } from '@shared/components/crudContainers/EntityGuesser';
import attReport from "src/entities/att-report";
import grade from "src/entities/grade";
import klass from "src/entities/klass";
import klassType from "src/entities/klass-type";
import knownAbsence from "src/entities/known-absence";
import lesson from "src/entities/lesson";
import studentKlass from "src/entities/student-klass";
import student from "src/entities/student";
import teacher from "src/entities/teacher";
import studentKlassesReport from "src/entities/student-klasses-report";
import reportMonth from "src/entities/report-month";
import teacherReportStatus from "src/entities/teacher-report-status";
import studentPercentReport from "src/entities/student-percent-report";

import StudentAttendanceList from 'src/pivots/StudentAttendanceList';
import PercentReportWithDatesList from 'src/pivots/PercentReportWithDatesList';

import text from "@shared/components/common-entities/text";
import textByUser from "@shared/components/common-entities/text-by-user";
import user from "@shared/components/common-entities/user";
import auditLog from '@shared/components/common-entities/audit-log';
import importFile from '@shared/components/common-entities/import-file';
import mailAddress from '@shared/components/common-entities/mail-address';
import recievedMail from '@shared/components/common-entities/recieved-mail';
import page from '@shared/components/common-entities/page';
import image from '@shared/components/common-entities/image';

import { isShowUsersData, isEditPagesData, isAdmin } from "@shared/utils/permissionsUtil";
import YemotSimulator from "@shared/components/views/YemotSimulator";
import { RegisterPage } from '@shared/components/layout/RegisterPage';
import { LoginPage } from '@shared/components/layout/LoginPage';
import Tutorial from '@shared/components/views/Tutorial';
import PageList from '@shared/components/views/PageList';

import BadgeIcon from '@mui/icons-material/Badge';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SchoolIcon from '@mui/icons-material/School';
import PortraitIcon from '@mui/icons-material/Portrait';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ViewListIcon from '@mui/icons-material/ViewList';
import GradingIcon from '@mui/icons-material/Grading';
import RuleIcon from '@mui/icons-material/Rule';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import ImageIcon from '@mui/icons-material/Image';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';
import EmailIcon from '@mui/icons-material/Email';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const i18nProvider = getI18nProvider(domainTranslations);

const App = () => (
  <BrowserRouter>
    <RTLStyle>
      <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider}
        theme={theme} title='נוכחות'
        dashboard={Dashboard} layout={Layout} loginPage={LoginPage}
        requireAuth>
        {permissions => (
          <>
            <Resource name="teacher" {...teacher} options={{ menuGroup: 'data' }} icon={BadgeIcon} />
            <Resource name="klass" {...klass} options={{ menuGroup: 'data' }} icon={SupervisedUserCircleIcon} />
            <Resource name="lesson" {...lesson} options={{ menuGroup: 'data' }} icon={SchoolIcon} />
            <Resource name="student" {...student} options={{ menuGroup: 'data' }} icon={PortraitIcon}>
              <Route path="student-attendance" element={<StudentAttendanceList />} />
            </Resource>
            <Resource name="student_klass" {...studentKlass} options={{ menuGroup: 'data' }} icon={GroupWorkIcon} />
            <Resource name="att_report" {...attReport} options={{ menuGroup: 'data' }} icon={ViewListIcon} />
            <Resource name="grade" {...grade} options={{ menuGroup: 'data' }} icon={GradingIcon} />

            <Resource name="student_klass_report" {...studentKlassesReport} options={{ menuGroup: 'report' }} icon={GroupWorkIcon} />
            <Resource name="teacher_report_status" {...teacherReportStatus} options={{ menuGroup: 'report' }} icon={RuleIcon} />

            <Resource name="klass_type" {...klassType} options={{ menuGroup: 'settings' }} icon={CategoryIcon} />
            <Resource name="report_month" {...reportMonth} options={{ menuGroup: 'settings' }} icon={DateRangeIcon} />
            <Resource name="text_by_user" {...textByUser} options={{ menuGroup: 'settings' }} icon={RateReviewIcon} />
            <Resource name="mail_address" {...mailAddress} options={{ menuGroup: 'settings' }} icon={AlternateEmailIcon} />
            <Resource name="image" {...image} options={{ menuGroup: 'settings' }} icon={ImageIcon} />
            <Resource name="import_file" {...importFile} options={{ menuGroup: 'settings' }} icon={UploadFileIcon} />

            {/* <Resource name="grade" {...resourceEntityGuesser} /> */}
            {/* <Resource name="known_absence" {...knownAbsence} /> */}

            {isAdmin(permissions) && <>
              <Resource name="student_percent_report" {...studentPercentReport} options={{ menuGroup: 'report' }} icon={SummarizeIcon}/>
              <Resource name="text" {...text} options={{ menuGroup: 'admin' }} />
              <Resource name="yemot_call" {...resourceEntityGuesser} options={{ menuGroup: 'admin' }} icon={SettingsPhoneIcon} />
              <Resource name="recieved_mail" {...recievedMail} options={{ menuGroup: 'admin' }} icon={EmailIcon} />
              <Resource name="audit_log" {...auditLog} options={{ menuGroup: 'admin' }} icon={LogoDevIcon} />
            </>}

            {isShowUsersData(permissions) && <>
              <Resource name="user" {...user} create={isAdmin(permissions) && user.create} options={{ menuGroup: 'admin' }} icon={AccountBoxIcon} />
            </>}

            {isEditPagesData(permissions) && <>
              <Resource name="page" {...page} options={{ menuGroup: 'admin' }} icon={AutoStoriesIcon} />
            </>}

            <CustomRoutes>
              <Route path="/percent-report-with-dates" element={<PercentReportWithDatesList />} />
              <Route path="/yemot-simulator" element={<YemotSimulator />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/pages-view" element={<PageList />} />
            </CustomRoutes>

            <CustomRoutes noLayout>
              <Route path="/register" element={<RegisterPage />} />
            </CustomRoutes>

            {/* {!isAdmin(permissions) && <CustomRoutes>
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </CustomRoutes>} */}
          </>
        )}
      </Admin>
    </RTLStyle>
  </BrowserRouter>
);

export default App;
