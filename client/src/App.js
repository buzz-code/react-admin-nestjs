import * as React from "react";
import { Admin, Resource, ListGuesser, EditGuesser } from 'react-admin';

import dataProvider from "./providers/dataProvider";
import i18nProvider from "./providers/i18nProvider";
import authProvider from "./providers/authProvider";
import theme from "./providers/themeProvider";

import { AttReportEdit, AttReportCreate, AttReportList } from "./components/entities/att-reports";
import { KlassEdit, KlassCreate, KlassList } from "./components/entities/klasses";
import { KlassTypeEdit, KlassTypeCreate, KlassTypeList } from "./components/entities/klass-types";
import { KnownAbsenceEdit, KnownAbsenceCreate, KnownAbsenceList } from "./components/entities/known-absences";
import { LessonEdit, LessonCreate, LessonList } from "./components/entities/lessons";
import { StudentKlassEdit, StudentKlassCreate, StudentKlassList } from "./components/entities/student-klasses";
import { StudentList, StudentCreate, StudentEdit } from "./components/entities/students";
import { TeacherList, TeacherCreate, TeacherEdit } from "./components/entities/teachers";
import { TextEdit, TextCreate, TextList } from "./components/entities/texts";
import { UserEdit, UserCreate, UserList, UserRepresentation } from "./components/entities/users";
import { isAdmin } from "./components/common/AdminRestricted";


const App = () => (
  <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider} theme={theme}>
    {permissions => (
      <>
        <Resource name="att_reports" list={AttReportList} edit={AttReportEdit} create={AttReportCreate} />
        <Resource name="grades" list={ListGuesser} edit={EditGuesser} create={EditGuesser} />
        <Resource name="klasses" list={KlassList} edit={KlassEdit} create={KlassCreate} />
        <Resource name="klass_types" list={KlassTypeList} edit={KlassTypeEdit} create={KlassTypeCreate} />
        <Resource name="known_absences" list={KnownAbsenceList} edit={KnownAbsenceEdit} create={KnownAbsenceCreate} />
        <Resource name="lessons" list={LessonList} edit={LessonEdit} create={LessonCreate} />
        <Resource name="student_klasses" list={StudentKlassList} edit={StudentKlassEdit} create={StudentKlassCreate} />
        <Resource name="students" list={StudentList} edit={StudentEdit} create={StudentCreate} />
        <Resource name="teachers" list={TeacherList} edit={TeacherEdit} create={TeacherCreate} />
        <Resource name="texts" list={TextList} edit={TextEdit} create={TextCreate} />
        {isAdmin(permissions) && (
          <Resource name="users" list={UserList} edit={UserEdit} create={UserCreate} recordRepresentation={UserRepresentation} />
        )}
      </>
    )}
  </Admin>
);

export default App;
