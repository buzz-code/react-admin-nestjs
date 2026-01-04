import React from 'react';
import { useDataProvider, SimpleForm, TextInput, useNotify, Toolbar, SaveButton } from 'react-admin';
import { useObjectStore } from 'src/utils/storeUtil';
import { Dashboard } from 'src/GeneralLayout';
import { useIsTeacherView } from 'src/utils/appPermissions';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Paper from '@mui/material/Paper';

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

export const TeacherGuard = ({ children }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { value: teacher, set: setTeacher, clear } = useObjectStore('teacher');

  if (teacher) {
    return (
      <Box display="flex" flexDirection="column" width="100%">
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" component="div">
            שלום המורה <strong>{teacher.name}</strong>
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={clear}
            startIcon={<LogoutIcon />}
          >
            התנתק
          </Button>
        </Paper>
        <Box flexGrow={1}>
          {children}
        </Box>
      </Box>
    );
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="grey.100"
    >
      <Card sx={{ minWidth: 300, maxWidth: 400, p: 2, boxShadow: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            כניסת מורה
          </Typography>
        </Box>
        <CardContent>
          <SimpleForm
            key="view-search-form"
            onSubmit={handleSubmit}
            resource="teacher"
            toolbar={<Toolbar sx={{ display: 'flex', justifyContent: 'center', width: '100%', bgcolor: 'transparent', p: 0 }}>
              <SaveButton label="כניסה" variant="contained" fullWidth color="secondary" />
            </Toolbar>}
          >
            <TextInput source="tz" label="ת.ז" fullWidth variant="outlined" />
          </SimpleForm>
        </CardContent>
      </Card>
    </Box>
  );
}
