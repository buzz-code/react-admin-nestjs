import { Admin, Resource, ListGuesser, EditGuesser, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';

import domainTranslations from './domainTranslations';
import dataProvider from "@shared/providers/dataProvider";
import { getI18nProvider } from "@shared/providers/i18nProvider";
import authProvider from "@shared/providers/authProvider";
import theme from "@shared/providers/themeProvider";

import { Dashboard, Layout } from './GeneralLayout';

import { AttReportEdit, AttReportCreate, AttReportList } from "./entities/att-report";
import { KlassEdit, KlassCreate, KlassList } from "./entities/klass";
import { KlassTypeEdit, KlassTypeCreate, KlassTypeList } from "./entities/klass-type";
import { KnownAbsenceEdit, KnownAbsenceCreate, KnownAbsenceList } from "./entities/known-absence";
import { LessonEdit, LessonCreate, LessonList } from "./entities/lesson";
import { StudentKlassEdit, StudentKlassCreate, StudentKlassList } from "./entities/student-klass";
import { StudentList, StudentCreate, StudentEdit } from "./entities/student";
import { TeacherList, TeacherCreate, TeacherEdit } from "./entities/teacher";
import { TextEdit, TextCreate, TextList } from "./entities/text";
import { UserEdit, UserCreate, UserList } from "./entities/user";
import { isAdmin } from "@shared/components/AdminRestricted";
import { CommonRepresentation } from "@shared/components/CommonRepresentation";
import YemotSimulator from "@shared/components/YemotSimulator";

const i18nProvider = getI18nProvider(domainTranslations);

const App = () => (
  <BrowserRouter>
    <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider} theme={theme} dashboard={Dashboard} layout={Layout} requireAuth>
      {permissions => (
        <>
          <Resource name="att_report" list={AttReportList} edit={AttReportEdit} create={AttReportCreate} />
          <Resource name="grade" list={ListGuesser} edit={EditGuesser} create={EditGuesser} />
          <Resource name="klass" list={KlassList} edit={KlassEdit} create={KlassCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="klass_type" list={KlassTypeList} edit={KlassTypeEdit} create={KlassTypeCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="known_absence" list={KnownAbsenceList} edit={KnownAbsenceEdit} create={KnownAbsenceCreate} />
          <Resource name="lesson" list={LessonList} edit={LessonEdit} create={LessonCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="student_klass" list={StudentKlassList} edit={StudentKlassEdit} create={StudentKlassCreate} />
          <Resource name="student" list={StudentList} edit={StudentEdit} create={StudentCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="teacher" list={TeacherList} edit={TeacherEdit} create={TeacherCreate} recordRepresentation={CommonRepresentation} />
          <Resource name="text" list={TextList} edit={TextEdit} create={TextCreate} />
          {isAdmin(permissions) && <>
            <Resource name="yemot_call" list={ListGuesser} edit={EditGuesser} />
            <Resource name="user" list={UserList} edit={UserEdit} create={UserCreate} recordRepresentation={CommonRepresentation} />
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
