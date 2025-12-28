import React from 'react';
import { List, usePermissions, useGetList, NumberField, TextField, SelectField, useRecordContext } from 'react-admin';
import { Box, CircularProgress, Alert } from '@mui/material';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { MultiReferenceField } from '@shared/components/fields/CommonReferenceField';
import { yearChoices } from '@shared/utils/yearFilter';
import { ShowMatchingRecordsButton } from '@shared/components/fields/ShowMatchingRecordsButton';

const TeacherPercentDatagrid = ({ isAdmin, ...props }) => {
  return (
    <CommonDatagrid {...props}>
      <MultiReferenceField source="studentReferenceId" sortBy="student.name" optionalSource="studentTz" reference="student_by_year" optionalTarget="tz" />
      <TextField source="studentBaseKlass.klassName" />
      <MultiReferenceField source="klassReferenceId" sortBy="klass.name" optionalSource="klassId" reference="klass" optionalTarget="key" />
      <MultiReferenceField source="lessonReferenceId" sortBy="lesson.name" optionalSource="lessonId" reference="lesson" optionalTarget="key" />
      <SelectField source="year" choices={yearChoices} />
      <NumberField source="lessonsCount" />
      <NumberField source="absCount" />
      <NumberField source="absPercents" options={{ style: 'percent', maximumFractionDigits: 2 }} />
      <NumberField source="attPercents" options={{ style: 'percent', maximumFractionDigits: 2 }} />
      <NumberField source="gradeAvg" options={{ style: 'percent', maximumFractionDigits: 2 }} />
      <ShowMatchingAttReportsButton />
    </CommonDatagrid>
  );
};

const ShowMatchingAttReportsButton = ({ ...props }) => {
  const { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId } = useRecordContext();
  const filter = { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId };

  return (
    <ShowMatchingRecordsButton filter={filter} resource="att_report" />
  );
};

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
      <TeacherPercentDatagrid isAdmin={isAdmin} bulkActionButtons={false} />
    </List>
  );
};
