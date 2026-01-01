import React from 'react';
import {useDataProvider,SimpleForm,TextInput,useNotify,Toolbar,SaveButton} from 'react-admin';
import { useObjectStore } from 'src/utils/storeUtil';
import { Dashboard } from 'src/GeneralLayout';
import {useIsTeacher} from 'src/utils/appPermissions';
import Button from '@mui/material/Button';

export const DashboardPermissions = (props) => {
  const isTeacher = useIsTeacher();
  if (isTeacher) {
    return (
      <TeacherDashboard>
        <Dashboard {...props} />
      </TeacherDashboard>
    
    );}
  else {
     return <Dashboard {...props} />;
  }
}

const TeacherDashboard = ({ children }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { value: teacher, set: setTeacher, clear } = useObjectStore('teacher');
  if (teacher) {
    return <div key="view-dashboard"  >
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
      filter: { tz  }
    });
    const teacher = result.data[0] || null;
    if (teacher) {
      setTeacher(teacher);
    } 
    else {
        notify('Teacher not found', { type: 'warning' });
        return null;
    }
   };
     
  return (
    <SimpleForm key="view-search-form" onSubmit={handleSubmit} resource="teacher" toolbar={<Toolbar> <SaveButton label="כניסה" /></Toolbar>}>
      <TextInput source="tz" label="ת.ז" />
    </SimpleForm>
);
}
