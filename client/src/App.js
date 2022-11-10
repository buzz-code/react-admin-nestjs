import * as React from "react";
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';

import dataProvider from "./providers/dataProvider";
import i18nProvider from "./providers/i18nProvider";
import theme from "./providers/themeProvider";

import { UserEdit, UserList, UserShow } from "./components/users";


const App = () => (
  <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} theme={theme}>
    <Resource name="att_reports" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="grades" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="klasses" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="klass_types" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="known_absences" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="lessons" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="student_klasses" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="students" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="teachers" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="texts" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="users" list={UserList} edit={UserEdit} show={UserShow} />
  </Admin>
);

export default App;
