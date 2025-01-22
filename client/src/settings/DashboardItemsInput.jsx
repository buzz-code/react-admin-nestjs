import React from 'react';
import { Typography } from '@mui/material';
import { ArrayInput, SimpleFormIterator, required } from 'react-admin';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonEntityNameInput } from '@shared/components/fields/CommonEntityNameInput';
import { CommonJsonInput } from '@shared/components/fields/CommonJsonItem';

export function DashboardItemsInput() {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        הגדרות לוח מחוונים
      </Typography>
      <ArrayInput source="dashboardItems">
        <SimpleFormIterator>
          <CommonEntityNameInput
            source="resource"
            allowedEntities={[
              'att_report_with_report_month',
              'grade',
              'known_absence',
              'student_klass_report',
              'teacher_report_status',
              'teacher_grade_report_status',
              'student_percent_report',
              'student_by_year',
              'teacher',
              'klass',
              'lesson'
            ]}
            helperText="בחר את מקור הנתונים שברצונך להציג"
            fullWidth
            validate={required()}
          />
          <CommonAutocompleteInput
            source="yearFilterType"
            choices={[
              { id: 'none', name: 'ללא סינון שנה' },
              { id: 'year', name: 'סינון שנה רגיל' },
              { id: 'year:$cont', name: 'סינון שנה מורחב' }
            ]}
            defaultValue="year"
            fullWidth
            disableClearable
          />
          <CommonJsonInput source="filter" />
        </SimpleFormIterator>
      </ArrayInput>
    </>
  )
}
