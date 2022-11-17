import * as React from "react";
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';

import dataProvider from "./providers/dataProvider";
import i18nProvider from "./providers/i18nProvider";
import authProvider from "./providers/authProvider";
import theme from "./providers/themeProvider";

import { AttReportEdit, AttReportList } from "./components/entities/att-reports";
import { KlassEdit, KlassList } from "./components/entities/klasses";
import { KlassTypeEdit, KlassTypeList } from "./components/entities/klass-types";
import { KnownAbsenceEdit, KnownAbsenceList } from "./components/entities/known-absences";
import { LessonEdit, LessonList } from "./components/entities/lessons";
import { StudentKlassEdit, StudentKlassList } from "./components/entities/student-klasses";
import { StudentList, StudentEdit } from "./components/entities/students";
import { TeacherList, TeacherEdit } from "./components/entities/teachers";
import { TextEdit, TextList } from "./components/entities/texts";
import { UserEdit, UserList, UserRepresentation } from "./components/entities/users";


const App = () => (
  <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider} theme={theme}>
    <Resource name="att_reports" list={AttReportList} edit={AttReportEdit} />
    <Resource name="grades" list={ListGuesser} edit={EditGuesser} />
    <Resource name="klasses" list={KlassList} edit={KlassEdit} />
    <Resource name="klass_types" list={KlassTypeList} edit={KlassTypeEdit} />
    <Resource name="known_absences" list={KnownAbsenceList} edit={KnownAbsenceEdit} />
    <Resource name="lessons" list={LessonList} edit={LessonEdit} />
    <Resource name="student_klasses" list={StudentKlassList} edit={StudentKlassEdit} />
    <Resource name="students" list={StudentList} edit={StudentEdit} />
    <Resource name="teachers" list={TeacherList} edit={TeacherEdit} />
    <Resource name="texts" list={TextList} edit={TextEdit} />
    <Resource name="users" list={UserList} edit={UserEdit} recordRepresentation={UserRepresentation} />
  </Admin>
);

export default App;
