import React from 'react';
import { List, usePermissions, useGetList } from 'react-admin';
import { Datagrid } from '../../entities/student-percent-report';
import { Box, CircularProgress, Alert } from '@mui/material';

export const FilteredStudentPercentReport = ({ teacherId }) => {
  const { permissions } = usePermissions();
  const isAdmin = permissions?.includes('admin');

  // Permanent filter by teacher ID
  const permanentFilter = {
    teacherReferenceId: teacherId,
  };

  // Pre-fetch to check if data exists
  const { isLoading, error } = useGetList('student_percent_report', {
    pagination: { page: 1, perPage: 1 },
    filter: permanentFilter,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">שגיאה בטעינת הנתונים</Alert>
      </Box>
    );
  }

  return (
    <List
      resource="student_percent_report"
      filter={permanentFilter}
      filterDefaultValues={permanentFilter}
      disableSyncWithLocation
      actions={false}
      title="דוח אחוזים"
    >
      <Datagrid isAdmin={isAdmin} bulkActionButtons={false} />
    </List>
  );
};
