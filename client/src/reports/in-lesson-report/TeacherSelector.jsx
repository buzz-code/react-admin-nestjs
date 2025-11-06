import React, { useCallback, useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { TabbedForm, Toolbar, SaveButton, TextInput, useDataProvider, useNotify } from 'react-admin';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';

const teacherTzAndName = item => `${item.name} (${item.tz})`;
const filterToQuery = searchText => {
  const tzMatch = /\((\d+)\)/.exec(searchText);
  if (tzMatch) {
    return { tz: tzMatch[1] };
  }
  return { 'name:$contL': searchText };
}

export const TeacherSelector = ({ onTeacherSelected }) => {
  const [teacherKey, setTeacherKey] = useState('');
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const handleGetTeacher = useCallback(async ({ teacherKey }) => {
    try {
      const { data: teachers } = await dataProvider.getList('teacher', {
        pagination: { page: 1, perPage: 1 },
        filter: { tz: teacherKey },
      });

      const teacher = teachers[0];
      if (!teacher) {
        throw new Error('Teacher not found');
      }
      onTeacherSelected(teacher);
    } catch (e) {
      console.error(e);
      notify('לא נמצאה מורה עם הפרטים שהוזנו', { type: 'error' });
    }
  }, [dataProvider, notify, onTeacherSelected]);

  return (
    <>
      <Box padding={2}>
        <Typography variant="h6" component="div">
          בחרי מורה
        </Typography>
        <Typography variant="body2" color="text.secondary">
          בחרי את המורה שברצונך להעלות דוח נוכחות עבורה
        </Typography>
      </Box>
      <Divider />
      <Box padding={2}>
        <TabbedForm
          toolbar={<Toolbar><SaveButton icon={<PlayArrowIcon />} label='בחר מורה' /></Toolbar>}
          onSubmit={handleGetTeacher}>
          <TabbedForm.Tab label="רשימה נפתחת">
            <CommonReferenceInput
              label="מורה"
              source="teacherKey"
              reference="teacher"
              optionValue='tz'
              optionText={teacherTzAndName}
              filterToQuery={filterToQuery}
              onChange={(e) => setTeacherKey(e)}
            />
          </TabbedForm.Tab>
          <TabbedForm.Tab label="תעודת זהות">
            <TextInput label="תז מורה" source="teacherKey" onChange={(e) => setTeacherKey(e.target.value)} />
          </TabbedForm.Tab>
        </TabbedForm>
      </Box>
    </>
  );
};
