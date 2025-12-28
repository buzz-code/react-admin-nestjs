import React from 'react';
import { List, Datagrid as RaDatagrid, usePermissions, useGetList } from 'react-admin';
import { Datagrid } from '../../entities/att-report';
import { Box, CircularProgress, Alert } from '@mui/material';

export const FilteredAttReportList = ({ teacherId }) => {
  const { permissions } = usePermissions();
  const isAdmin = permissions?.includes('admin');

  // Permanent filter by teacher ID
  const permanentFilter = {
    teacherReferenceId: teacherId,
  };

  // Pre-fetch to check if data exists
  const { isLoading, error } = useGetList('att_report', {
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
      resource="att_report"
      filter={permanentFilter}
      filterDefaultValues={permanentFilter}
      disableSyncWithLocation
      actions={false}
      title="היסטוריית דיווחים"
    >
      <Datagrid isAdmin={isAdmin} bulkActionButtons={false} />
    </List>
  );
};
