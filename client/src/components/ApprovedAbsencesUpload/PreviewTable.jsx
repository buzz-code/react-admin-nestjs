import React from 'react';
import {
  Datagrid,
  FunctionField,
  ListContextProvider,
  ResourceContextProvider,
  useList,
  useRecordContext
} from 'react-admin';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

// Expanded Row Component
const ExpandedRow = () => {
  const record = useRecordContext();

  // Show error message if there's an error
  if (record?.error) {
    return (
      <Box sx={{ padding: 2, backgroundColor: '#ffebee' }}>
        <Typography variant="subtitle2" color="error" gutterBottom>
          שגיאה:
        </Typography>
        <Typography variant="body2" color="error">
          {record.error}
        </Typography>
      </Box>
    );
  }

  // Show students if there are reports
  if (record?.reports && record.reports.length > 0) {
    return (
      <Box sx={{ padding: 2, backgroundColor: '#fafafa' }}>
        <Typography variant="subtitle2" gutterBottom>
          תלמידות מושפעות ({record.reports.length}):
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {record.reports.map((report, i) => (
            <Chip
              key={i}
              label={report.student?.name || `תלמידה ${i + 1}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return null;
};

const PreviewTable = ({ data }) => {
  // Safety check: ensure data is an array
  if (!data || !Array.isArray(data)) {
    return null;
  }

  // Add IDs to each record for React-Admin
  const dataWithIds = data.map((item, index) => ({
    id: index,
    ...item
  }));

  const listContext = useList({ data: dataWithIds });

  return (
    <ListContextProvider value={listContext}>
      <ResourceContextProvider value="approved_absences_preview">
        <Datagrid
          bulkActionButtons={false}
          rowClick={false}
          expand={<ExpandedRow />}
        >
          <FunctionField
            label="סטטוס"
            render={record => {
              if (record.error) return <ErrorIcon color="error" />;
              if (record.warning) return <WarningIcon color="warning" />;
              return <CheckCircleIcon color="success" />;
            }}
          />
          <FunctionField
            label="מספר כיתה"
            render={record => record.klassKey}
          />
          <FunctionField
            label="שם כיתה"
            render={record => record.klassName || 'לא נמצא'}
          />
          <FunctionField
            label="תאריך"
            render={record => record.row.reportDate}
          />
          <FunctionField
            label="דיווחים"
            render={record => `${record.reports?.length || 0} דיווחים`}
          />
          <FunctionField
            label="הערות"
            render={record => record.error || record.warning || '-'}
          />
        </Datagrid>
      </ResourceContextProvider>
    </ListContextProvider>
  );
};

export default PreviewTable;
