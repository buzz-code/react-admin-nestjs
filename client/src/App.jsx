import { Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { blue, purple } from '@mui/material/colors';

import domainTranslations from 'src/domainTranslations';
import roadmapFeatures from 'src/roadmapFeatures';
import AdminAppShell from '@shared/components/app/AdminAppShell';
import CommonRoutes from '@shared/components/app/CommonRoutes';
import CommonAdminResources from '@shared/components/app/CommonAdminResources';
import CommonSettingsResources from '@shared/components/app/CommonSettingsResources';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';

import { Layout } from 'src/GeneralLayout';
import { RootDashboard } from 'src/RootDashboard';
import { TeacherGuard } from './components/TeacherView/TeacherAccess';

import { resourceEntityGuesser } from '@shared/components/crudContainers/EntityGuesser';
import attReport from "src/entities/att-report";
import attReportWithReportMonth from './entities/att-report-with-report-month';
import teacherAttReport from 'src/components/TeacherView/taecher-att-report-list';
import LeadTeacherAttReportList from './components/TeacherView/lead-teacher-att-report-list';
import TeacherPercentReportWithDatesList from 'src/components/TeacherView/percent-report-with-dates-list';
import TeacherStudentAttendanceList from 'src/components/TeacherView/student-attendance-list';
import grade from "src/entities/grade";
import klass from "src/entities/klass";
import klassType from "src/entities/klass-type";
import knownAbsence from "src/entities/known-absence";
import lesson from "src/entities/lesson";
import studentKlass from "src/entities/student-klass";
import student from "src/entities/student";
import teacher from "src/entities/teacher";
import transportation from 'src/entities/transportation';
import absenceType from 'src/entities/absenceType';
import uploadedFile from "@shared/components/common-entities/uploaded-file";
import studentKlassesReport from "src/entities/student-klasses-report";
import StudentEventReport from "src/components/StudentView/student-event-report";
import reportMonth from "src/entities/report-month";
import teacherReportStatus from "src/entities/teacher-report-status";
import teacherGradeReportStatus from "src/entities/teacher-grade-report-status";
import teacherSalaryReport from "src/entities/teacher-salary-report";
import studentPercentReport from "src/entities/student-percent-report";
import gradeName from "src/entities/grade-name";
import attendanceName from "src/entities/attendance-name";
import attGradeEffect from './entities/att-grade-effect';
import reportGroup from './entities/report-group';
import reportGroupSession from './entities/report-group-session';
import Settings from 'src/settings/Settings';

import StudentAttendanceList from 'src/pivots/StudentAttendanceList';
import PercentReportWithDatesList from 'src/pivots/PercentReportWithDatesList';

import { isUploadedFiles, isAdmin } from "@shared/utils/permissionsUtil";
import { isLessonSignature, isOnlyInLessonReport, isTeacherView, isTransportation, isAbsenceType, isStudentView } from 'src/utils/appPermissions';
import ScannerUpload from '@shared/components/views/ScannerUpload';
import InLessonReport from 'src/reports/InLessonReport';
import MichlolFileHelper from '@shared/components/views/MichlolFileHelper';
import ApprovedAbsencesUpload from 'src/components/ApprovedAbsencesUpload';

import BadgeIcon from '@mui/icons-material/Badge';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SchoolIcon from '@mui/icons-material/School';
import PortraitIcon from '@mui/icons-material/Portrait';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ViewListIcon from '@mui/icons-material/ViewList';
import GradingIcon from '@mui/icons-material/Grading';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import RuleIcon from '@mui/icons-material/Rule';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LabelIcon from '@mui/icons-material/Label';
import CalculateIcon from '@mui/icons-material/Calculate';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CelebrationIcon from '@mui/icons-material/Celebration';

const themeOptions = { primary: blue[700], secondary: purple[500] };

const App = () => (
  <AdminAppShell
    title='נוכחות'
    themeOptions={themeOptions}
    domainTranslations={domainTranslations}
    dashboard={RootDashboard}
    layout={Layout}
  >
    {permissions => {
      const onlyInLesson = isOnlyInLessonReport(permissions) && !isAdmin(permissions);
      const teacherView = isTeacherView(permissions) && !isAdmin(permissions);
      const studentView = isStudentView(permissions) && !isAdmin(permissions);
      if (onlyInLesson) {
        return (
          <>
            <Resource name="teacher" />
            <Resource name="lesson" />
            <CustomRoutes>
              <Route path="/in-lesson-report-att/*" element={<InLessonReport />} />
              <Route path="/in-lesson-report-grade/*" element={<InLessonReport gradeMode />} />
            </CustomRoutes>
          </>
        );
      }
      if (teacherView) {
        return (
          <>
            <Resource name="teacher" />
            <Resource name="lesson" />
            <Resource name="att_report_with_report_month" {...teacherAttReport} icon={ViewListIcon} />
            <CustomRoutes>
              <Route path="/in-lesson-report-att/*" element={<TeacherGuard> <InLessonReport /> </TeacherGuard>} />
              <Route path="/in-lesson-report-grade/*" element={<TeacherGuard> <InLessonReport gradeMode /> </TeacherGuard>} />
              <Route path="/percent-report-with-dates" element={<TeacherPercentReportWithDatesList />} />
              <Route path="/student/student-attendance" element={<TeacherStudentAttendanceList />} />
              <Route path="/att_report_with_report_month_lead" element={<LeadTeacherAttReportList />} />
            </CustomRoutes>
          </>
        );
      }
      if (studentView) {
          return(
          <> </>
        );
     }
      return (
        <>
          <Resource name="teacher" {...teacher} options={{ menuGroup: 'data' }} icon={BadgeIcon} />
          <Resource name="klass_type" {...klassType} options={{ menuGroup: 'data' }} icon={CategoryIcon} />
          <Resource name="klass" {...klass} options={{ menuGroup: 'data' }} icon={SupervisedUserCircleIcon} />
          <Resource name="lesson" {...lesson} options={{ menuGroup: 'data' }} icon={SchoolIcon} />
          <Resource name="student" {...student} options={{ menuGroup: 'data' }} icon={PortraitIcon}>
            <Route path="student-attendance" element={<StudentAttendanceList />} />
          </Resource>
          <Resource name="student_klass" {...studentKlass} options={{ menuGroup: 'data' }} icon={WorkspacesIcon} />
          {(isTransportation(permissions) || isAdmin(permissions)) && <Resource name="transportation" {...transportation} options={{ menuGroup: 'data' }} icon={DirectionsBusIcon} />}
          {(isAbsenceType(permissions) || isAdmin(permissions)) && <Resource name="absence_type" {...absenceType} options={{ menuGroup: 'data' }} icon={CelebrationIcon} />}
          <Resource name="att_report_with_report_month" {...attReportWithReportMonth} options={{ menuGroup: 'data' }} icon={ViewListIcon} />
          <Resource name="grade" {...grade} options={{ menuGroup: 'data' }} icon={GradingIcon} />
          <Resource name="known_absence" {...knownAbsence} options={{ menuGroup: 'data' }} icon={PlaylistRemoveIcon} />
          <Resource name="student_klass_report" {...studentKlassesReport} options={{ menuGroup: 'report' }} icon={GroupWorkIcon} />
          <Resource name="teacher_report_status" {...teacherReportStatus} options={{ menuGroup: 'report' }} icon={RuleIcon} />
          <Resource name="teacher_grade_report_status" {...teacherGradeReportStatus} options={{ menuGroup: 'report' }} icon={RuleIcon} />
          <Resource name="teacher_salary_report" {...teacherSalaryReport} options={{ menuGroup: 'report' }} icon={LocalAtmIcon} />

          <Resource name="report_month" {...reportMonth} options={{ menuGroup: 'settings' }} icon={DateRangeIcon} />
          <CommonSettingsResources />
          {isUploadedFiles(permissions) && <Resource name="uploaded_file" {...uploadedFile} options={{ menuGroup: 'settings' }} icon={UploadFileIcon} />}
          <Resource name="att_report" {...attReport} options={{ menuGroup: 'settings' }} icon={ViewListIcon} />
          <Resource name="grade_name" {...gradeName} options={{ menuGroup: 'settings' }} icon={LabelIcon} />
          <Resource name="attendance_name" {...attendanceName} options={{ menuGroup: 'settings' }} icon={LabelIcon} />
          <Resource name="att_grade_effect" {...attGradeEffect} options={{ menuGroup: 'settings' }} icon={CalculateIcon} />
          <Resource name="student_by_year" {...(isAdmin(permissions) ? resourceEntityGuesser : {})} recordRepresentation={CommonRepresentation} options={{ menuGroup: 'admin' }} icon={PermContactCalendarIcon} />
          <Resource name="grade_effect_by_user" {...(isAdmin(permissions) ? resourceEntityGuesser : {})} recordRepresentation={'effect'} options={{ menuGroup: 'admin' }} icon={AdminPanelSettingsIcon} />
          <Resource name="abs_count_effect_by_user" {...(isAdmin(permissions) ? resourceEntityGuesser : {})} recordRepresentation={'effect'} options={{ menuGroup: 'admin' }} icon={AdminPanelSettingsIcon} />

          {isAdmin(permissions) && <Resource name="student_percent_report" {...studentPercentReport} options={{ menuGroup: 'report' }} icon={SummarizeIcon} />}
          <CommonAdminResources permissions={permissions} />

          {isLessonSignature(permissions) && <>
            <Resource name="report_group" {...reportGroup} create={null} edit={isAdmin(permissions) ? reportGroup.edit : null} options={{ menuGroup: 'settings' }} icon={GroupWorkIcon} />
            <Resource name="report_group_session" {...reportGroupSession} options={{ menuGroup: 'settings' }} icon={DateRangeIcon} />
          </>}

          <CustomRoutes>
            <Route path="/percent-report-with-dates" element={<PercentReportWithDatesList />} />
            <Route path="/scanner-upload" element={<ScannerUpload />} />
            <Route path="/in-lesson-report-att/*" element={<InLessonReport />} />
            <Route path="/in-lesson-report-grade/*" element={<InLessonReport gradeMode />} />
            <Route path="/michlol-file-helper" element={<MichlolFileHelper />} />
            <Route path="/approved-absences-upload" element={<ApprovedAbsencesUpload />} />
          </CustomRoutes>
          <CommonRoutes
            permissions={permissions}
            roadmapFeatures={roadmapFeatures}
            settingsPage={<Settings />}
          />
        </>
      );
    }}
  </AdminAppShell>
);

export default App;
