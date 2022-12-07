import { Admin, Resource, ListGuesser, EditGuesser, CustomRoutes, Layout } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import DollarIcon from '@mui/icons-material/AttachMoney';

import domainTranslations from './domainTranslations';
import dataProvider from "@buzz-code/crud-nestjs-react-admin/client/providers/dataProvider";
import { getI18nProvider } from "@buzz-code/crud-nestjs-react-admin/client/providers/i18nProvider";
import authProvider from "@buzz-code/crud-nestjs-react-admin/client/providers/authProvider";
import theme from "@buzz-code/crud-nestjs-react-admin/client/providers/themeProvider";
import Dashboard from "@buzz-code/crud-nestjs-react-admin/client/components/Dashboard";
import Menu from "@buzz-code/crud-nestjs-react-admin/client/components/Menu";

import { AttReportEdit, AttReportCreate, AttReportList } from "./entities/att-reports";
import { KlassEdit, KlassCreate, KlassList } from "./entities/klasses";
import { KlassTypeEdit, KlassTypeCreate, KlassTypeList } from "./entities/klass-types";
import { KnownAbsenceEdit, KnownAbsenceCreate, KnownAbsenceList } from "./entities/known-absences";
import { LessonEdit, LessonCreate, LessonList } from "./entities/lessons";
import { StudentKlassEdit, StudentKlassCreate, StudentKlassList } from "./entities/student-klasses";
import { StudentList, StudentCreate, StudentEdit } from "./entities/students";
import { TeacherList, TeacherCreate, TeacherEdit } from "./entities/teachers";
import { TextEdit, TextCreate, TextList } from "./entities/texts";
import { UserEdit, UserCreate, UserList } from "./entities/users";
import { isAdmin } from "@buzz-code/crud-nestjs-react-admin/client/components/AdminRestricted";
import { CommonRepresentation } from "@buzz-code/crud-nestjs-react-admin/client/components/CommonRepresentation";
import YemotSimulator from "@buzz-code/crud-nestjs-react-admin/client/components/YemotSimulator";

const MyLayout = (props) => <Layout {...props} menu={Menu} />
const MyDashboard = () => <Dashboard items={[{ resource: 'att_reports', icon: DollarIcon }, { resource: 'students', icon: DollarIcon }]} />

const i18nProvider = getI18nProvider(domainTranslations);

const App = () => (
  <BrowserRouter>
    <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider} theme={theme} dashboard={MyDashboard} layout={MyLayout} requireAuth>
      {permissions => (
        <>
          <Resource name="att_reports" list={AttReportList} edit={AttReportEdit} create={AttReportCreate} />
          <Resource name="grades" list={ListGuesser} edit={EditGuesser} create={EditGuesser} />
          <Resource name="klasses" list={KlassList} edit={KlassEdit} create={KlassCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="klass_types" list={KlassTypeList} edit={KlassTypeEdit} create={KlassTypeCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="known_absences" list={KnownAbsenceList} edit={KnownAbsenceEdit} create={KnownAbsenceCreate} />
          <Resource name="lessons" list={LessonList} edit={LessonEdit} create={LessonCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="student_klasses" list={StudentKlassList} edit={StudentKlassEdit} create={StudentKlassCreate} />
          <Resource name="students" list={StudentList} edit={StudentEdit} create={StudentCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="teachers" list={TeacherList} edit={TeacherEdit} create={TeacherCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="texts" list={TextList} edit={TextEdit} create={TextCreate} />
          {isAdmin(permissions) && <>
            <Resource name="yemot_call" list={ListGuesser} edit={EditGuesser} />
            <Resource name="users" list={UserList} edit={UserEdit} create={UserCreate} recordRepresentation={CommonRepresentation} />
          </>}

          <CustomRoutes>
            <Route path="/yemot-simulator" element={<YemotSimulator />} />
          </CustomRoutes>
        </>
      )}
    </Admin>
  </BrowserRouter>
);

export default App;
