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

import StudentAttendanceList from 'src/pivots/StudentAttendanceList';

import text from "@shared/components/common-entities/text";
import textByUser from "@shared/components/common-entities/text-by-user";
import user from "@shared/components/common-entities/user";
import auditLog from '@shared/components/common-entities/audit-log';
import importFile from '@shared/components/common-entities/import-file';
import mailAddress from '@shared/components/common-entities/mail-address';
import recievedMail from '@shared/components/common-entities/recieved-mail';
import page from '@shared/components/common-entities/page';

import { isShowUsersData, isEditPagesData, isAdmin } from "@shared/utils/permissionsUtil";
import YemotSimulator from "@shared/components/views/YemotSimulator";
import { RegisterPage } from '@shared/components/layout/RegisterPage';
import { LoginPage } from '@shared/components/layout/LoginPage';
import Tutorial from '@shared/components/views/Tutorial';
import PageList from '@shared/components/views/PageList';

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
            <Resource name="teacher" {...teacher} options={{ menuGroup: 'data' }} />
            <Resource name="klass" {...klass} options={{ menuGroup: 'data' }} />
            <Resource name="lesson" {...lesson} options={{ menuGroup: 'data' }} />
            <Resource name="student" {...student} options={{ menuGroup: 'data' }}>
              <Route path="student-attendance" element={<StudentAttendanceList />} />
            </Resource>
            <Resource name="student_klass" {...studentKlass} options={{ menuGroup: 'data' }} />
            <Resource name="att_report" {...attReport} options={{ menuGroup: 'data' }} />

            <Resource name="student_klass_report" {...studentKlassesReport} options={{ menuGroup: 'report' }} />
            <Resource name="teacher_report_status" {...teacherReportStatus} options={{ menuGroup: 'report' }} />

            <Resource name="klass_type" {...klassType} options={{ menuGroup: 'settings' }} />
            <Resource name="report_month" {...reportMonth} options={{ menuGroup: 'settings' }} />
            <Resource name="text_by_user" {...textByUser} options={{ menuGroup: 'settings' }} />
            <Resource name="mail_address" {...mailAddress} options={{ menuGroup: 'settings' }} />
            <Resource name="import_file" {...importFile} options={{ menuGroup: 'settings' }} />

            {/* <Resource name="grade" {...resourceEntityGuesser} /> */}
            {/* <Resource name="known_absence" {...knownAbsence} /> */}

            {isAdmin(permissions) && <>
              <Resource name="text" {...text} options={{ menuGroup: 'admin' }} />
              <Resource name="yemot_call" {...resourceEntityGuesser} options={{ menuGroup: 'admin' }} />
              <Resource name="recieved_mail" {...recievedMail} options={{ menuGroup: 'admin' }} />
              <Resource name="audit_log" {...auditLog} options={{ menuGroup: 'admin' }} />
            </>}

            {isShowUsersData(permissions) && <>
              <Resource name="user" {...user} create={isAdmin(permissions) && user.create} options={{ menuGroup: 'admin' }} />
            </>}

            {isEditPagesData(permissions) && <>
              <Resource name="page" {...page} options={{ menuGroup: 'admin' }} />
            </>}

            <CustomRoutes>
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
