import { Admin, Resource, ListGuesser, EditGuesser, CustomRoutes, Layout } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';

import dataProvider from "./providers/dataProvider";
import i18nProvider from "./providers/i18nProvider";
import authProvider from "./providers/authProvider";
import theme from "./providers/themeProvider";
import Dashboard from "./components/common/Dashboard";
import Menu from "./components/common/Menu";

import { AttReportEdit, AttReportCreate, AttReportList } from "./components/entities/att-reports";
import { KlassEdit, KlassCreate, KlassList } from "./components/entities/klasses";
import { KlassTypeEdit, KlassTypeCreate, KlassTypeList } from "./components/entities/klass-types";
import { KnownAbsenceEdit, KnownAbsenceCreate, KnownAbsenceList } from "./components/entities/known-absences";
import { LessonEdit, LessonCreate, LessonList } from "./components/entities/lessons";
import { StudentKlassEdit, StudentKlassCreate, StudentKlassList } from "./components/entities/student-klasses";
import { StudentList, StudentCreate, StudentEdit } from "./components/entities/students";
import { TeacherList, TeacherCreate, TeacherEdit } from "./components/entities/teachers";
import { TextEdit, TextCreate, TextList } from "./components/entities/texts";
import { UserEdit, UserCreate, UserList } from "./components/entities/users";
import { isAdmin } from "./components/common/AdminRestricted";
import { CommonRepresentation } from "./components/common/CommonRepresentation";
import YemotSimulator from "./components/common/YemotSimulator";

const MyLayout = (props) => <Layout {...props} menu={Menu} />

const App = () => (
  <BrowserRouter>
    <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider} theme={theme} dashboard={Dashboard} layout={MyLayout} requireAuth>
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
          {isAdmin(permissions) && (
            <Resource name="users" list={UserList} edit={UserEdit} create={UserCreate} recordRepresentation={CommonRepresentation} />
          )}

          <CustomRoutes>
            <Route path="/yemot-simulator" element={<YemotSimulator />} />
          </CustomRoutes>
        </>
      )}
    </Admin>
  </BrowserRouter>
);

export default App;
