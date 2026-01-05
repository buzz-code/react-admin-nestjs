import React from 'react';
import { Dashboard } from 'src/GeneralLayout';
import { useIsTeacherView } from 'src/utils/appPermissions';
import { TeacherGuard } from 'src/components/TeacherView/TeacherAccess';

export const RootDashboard = (props) => {
  const isTeacherView = useIsTeacherView();
  if (isTeacherView) {
    return (
      <TeacherGuard>
        <Dashboard {...props} />
      </TeacherGuard>

    );
  }
  else {
    return <Dashboard {...props} />;
  }
}
