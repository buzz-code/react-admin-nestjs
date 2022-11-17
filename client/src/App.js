import * as React from "react";
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';

import dataProvider from "./providers/dataProvider";
import i18nProvider from "./providers/i18nProvider";
import theme from "./providers/themeProvider";

import { UserEdit, UserList, UserRepresentation, UserShow } from "./components/entities/users";
import { TextEdit, TextList, TextShow } from "./components/entities/texts";


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
    <Resource name="texts" list={TextList} edit={TextEdit} show={TextShow} />
    <Resource name="users" list={UserList} edit={UserEdit} show={UserShow} recordRepresentation={UserRepresentation} />
  </Admin>
);

export default App;
