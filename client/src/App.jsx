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
import text from "src/entities/text";
import studentKlassesReport from "src/entities/student-klasses-report";
import user from "src/entities/user";
import { isAdmin } from "@shared/utils/permissionsUtil";
import YemotSimulator from "@shared/components/views/YemotSimulator";

const i18nProvider = getI18nProvider(domainTranslations);

const App = () => (
  <BrowserRouter>
    <RTLStyle>
      <Admin dataProvider={dataProvider} i18nProvider={i18nProvider} authProvider={authProvider}
        theme={theme} title='נוכחות' dashboard={Dashboard} layout={Layout} requireAuth>
        {permissions => (
          <>
            <Resource name="att_report" {...attReport} />
            <Resource name="grade" {...resourceEntityGuesser} />
            <Resource name="klass" {...klass} />
            <Resource name="klass_type" {...klassType} />
            <Resource name="known_absence" {...knownAbsence} />
            <Resource name="lesson" {...lesson} />
            <Resource name="student_klass" {...studentKlass} />
            <Resource name="student" {...student} />
            <Resource name="teacher" {...teacher} />
            <Resource name="student_klass_report" {...studentKlassesReport} />
            <Resource name="text" {...text} />

            {isAdmin(permissions) && <>
              <Resource name="yemot_call" {...resourceEntityGuesser} />
              <Resource name="audit_log" {...resourceEntityGuesser} />
              <Resource name="user" {...user} />
            </>}

            <CustomRoutes>
              <Route path="/yemot-simulator" element={<YemotSimulator />} />
            </CustomRoutes>
          </>
        )}
      </Admin>
    </RTLStyle>
  </BrowserRouter>
);

export default App;
