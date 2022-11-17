import * as React from "react";
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';

import dataProvider from "./providers/dataProvider";
import i18nProvider from "./providers/i18nProvider";
import authProvider from "./providers/authProvider";
import theme from "./providers/themeProvider";

import { UserEdit, UserList, UserRepresentation } from "./components/entities/users";
import { TextEdit, TextList } from "./components/entities/texts";


const App = () => (
  <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider} theme={theme}>
    <Resource name="att_reports" list={ListGuesser} edit={EditGuesser} />
    <Resource name="grades" list={ListGuesser} edit={EditGuesser} />
    <Resource name="klasses" list={ListGuesser} edit={EditGuesser} />
    <Resource name="klass_types" list={ListGuesser} edit={EditGuesser} />
    <Resource name="known_absences" list={ListGuesser} edit={EditGuesser} />
    <Resource name="lessons" list={ListGuesser} edit={EditGuesser} />
    <Resource name="student_klasses" list={ListGuesser} edit={EditGuesser} />
    <Resource name="students" list={ListGuesser} edit={EditGuesser} />
    <Resource name="teachers" list={ListGuesser} edit={EditGuesser} />
    <Resource name="texts" list={TextList} edit={TextEdit} />
    <Resource name="users" list={UserList} edit={UserEdit} recordRepresentation={UserRepresentation} />
  </Admin>
);

export default App;
