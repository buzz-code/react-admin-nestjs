import React from 'react';
import { Dashboard } from 'src/GeneralLayout';
import { useIsTeacherView, useIsStudentView } from 'src/utils/appPermissions';
import { TeacherGuard } from 'src/components/TeacherView/TeacherAccess';
import { StudentGuard } from './components/StudentView/StudentAccess';
import StudentEventReport from './components/StudentView/student-event-report';

export const RootDashboard = (props) => {
  const isTeacherView = useIsTeacherView();
  const isStudentView = useIsStudentView();

  if (isTeacherView) {
    return (
      <TeacherGuard>
        <Dashboard {...props} />
      </TeacherGuard>

    );
  }
  else if (isStudentView) {
    return (
      <StudentGuard>
        <StudentEventReport />
      </StudentGuard>
    );
  }
  else return <Dashboard {...props} />;

}
