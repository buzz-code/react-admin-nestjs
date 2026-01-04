import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import PivotTableChartIcon from '@mui/icons-material/PivotTableChart';
import PercentIcon from '@mui/icons-material/Percent';
import { useObjectStore } from 'src/utils/storeUtil';

import { InLessonReport } from '../reports/in-lesson-report';
import { FilteredAttReportList } from './teacher-personal-area/FilteredAttReportList';
import { FilteredStudentAttendanceList } from './teacher-personal-area/FilteredStudentAttendanceList';
import { FilteredStudentPercentReport } from './teacher-personal-area/FilteredStudentPercentReport';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const TeacherPersonalArea = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { value: teacher } = useObjectStore('teacher');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (!teacher) {
    return null; // TeacherGuard will handle authentication
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Paper elevation={2}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="teacher personal area tabs"
          >
            <Tab
              label="דיווח נוכחות"
              icon={<AssignmentIcon />}
              iconPosition="start"
            />
            <Tab
              label="היסטוריית דיווחים"
              icon={<HistoryIcon />}
              iconPosition="start"
            />
            <Tab
              label="דוח סיכום נוכחות"
              icon={<PivotTableChartIcon />}
              iconPosition="start"
            />
            <Tab
              label="דוח אחוזים"
              icon={<PercentIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          <InLessonReport
            teacher={teacher}
            isStartWithTeacher={false}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <FilteredAttReportList teacherId={teacher.id} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <FilteredStudentAttendanceList teacherId={teacher.id} />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <FilteredStudentPercentReport teacherId={teacher.id} />
        </TabPanel>
      </Paper>
    </Container>
  );
};
