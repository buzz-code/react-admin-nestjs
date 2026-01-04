import React from 'react';
import { useDataProvider, SimpleForm, TextInput, useNotify, Toolbar, SaveButton } from 'react-admin';
import { useObjectStore } from 'src/utils/storeUtil';
import { Dashboard } from 'src/GeneralLayout';
import { useIsTeacherView } from 'src/utils/appPermissions';
import { TeacherPersonalArea } from 'src/components/TeacherPersonalArea';
import Button from '@mui/material/Button';

export const RootDashboard = (props) => {
  const isTeacherView = useIsTeacherView();
  if (isTeacherView) {
    return (
      <TeacherGuard>
        <TeacherPersonalArea />
      </TeacherGuard>
    );
  }
  else {
    return <Dashboard {...props} />;
  }
}

// Export TeacherGuard so it can be used to protect custom routes
export const TeacherGuard = ({ children }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { value: teacher, set: setTeacher, clear } = useObjectStore('teacher');

  if (teacher) {
    return <div key="view-dashboard">
      שלום המורה {teacher.name}
      <Button onClick={clear}>
        התנתק
      </Button>
      {children}
    </div>
  }

  const handleSubmit = async (values) => {
    const { tz } = values;
    const result = await dataProvider.getList('teacher', {
      pagination: { page: 1, perPage: 1 },
      filter: { tz }
    });
    const teacher = result.data[0] || null;

    if (teacher) {
      setTeacher(teacher);
    }
    else {
      notify('Teacher not found', { type: 'warning' });
    }
  };

  return (
    <SimpleForm key="view-search-form" onSubmit={handleSubmit} resource="teacher"
      toolbar={<Toolbar>
        <SaveButton label="כניסה" />
      </Toolbar>}>
      <TextInput source="tz" label="ת.ז" />
    </SimpleForm>
  );
}
