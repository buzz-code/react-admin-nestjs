import React from 'react';
import { List, usePermissions, useListContext, TextField, BooleanField, ReferenceField } from 'react-admin';
import { Box, CircularProgress } from '@mui/material';
import { CommonDatagrid, getPivotColumns } from '@shared/components/crudContainers/CommonList';
import { CommonSelectArrayField } from '@shared/components/fields/CommonSelectArrayField';
import { yearChoices } from '@shared/utils/yearFilter';

const TeacherFilteredDatagrid = ({ isAdmin, ...props }) => {
  const { data } = useListContext();

  return (
    <CommonDatagrid {...props}>
      {isAdmin && <TextField key="id" source="id" />}
      {isAdmin && <ReferenceField key="userId" source="userId" reference="user" />}
      <TextField key="tz" source="tz" />
      <TextField key="name" source="name" />
      <BooleanField key="isActive" source="isActive" />
      <CommonSelectArrayField key="year" source="year" choices={yearChoices} />
      {getPivotColumns(data)}
    </CommonDatagrid>
  );
};

export const FilteredStudentAttendanceList = ({ teacherId }) => {
  const { permissions, isLoading } = usePermissions();
  const isAdmin = permissions?.includes('admin');

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  // Permanent filter by teacher ID through extra.teacherReferenceId
  const permanentFilter = {
    'extra.teacherReferenceId': teacherId,
  };

  return (
    <List
      resource="student_by_year/pivot?extra.pivot=StudentAttendance"
      filter={permanentFilter}
      filterDefaultValues={{
        ...permanentFilter,
        'year:$cont': new Date().getFullYear(),
        extra: {
          isCheckKlassType: true,
          teacherReferenceId: teacherId,
        },
      }}
      disableSyncWithLocation
      actions={false}
      title="דוח סיכום נוכחות"
    >
      <TeacherFilteredDatagrid isAdmin={isAdmin} bulkActionButtons={false} />
    </List>
  );
};
