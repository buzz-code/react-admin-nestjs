import React, { useCallback, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { useDataProvider, useNotify } from 'react-admin';
import LoginIcon from '@mui/icons-material/Login';

export const TeacherIdentityGuard = ({ onTeacherIdentified }) => {
  const [tz, setTz] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: teachers } = await dataProvider.getList('teacher', {
        pagination: { page: 1, perPage: 1 },
        filter: { tz },
      });

      const teacher = teachers[0];
      if (!teacher) {
        setError('לא נמצאה מורה עם תעודת זהות זו');
        notify('לא נמצאה מורה עם תעודת זהות זו', { type: 'error' });
      } else {
        onTeacherIdentified(teacher);
      }
    } catch (e) {
      console.error(e);
      setError('שגיאה בחיפוש המורה');
      notify('שגיאה בחיפוש המורה', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [tz, dataProvider, notify, onTeacherIdentified]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      padding={2}
    >
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            זיהוי מורה
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            אנא הכניסי את מספר תעודת הזהות שלך
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="תעודת זהות"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            disabled={loading}
            required
            autoFocus
            sx={{ mb: 3 }}
            inputProps={{
              pattern: '[0-9]+',
              inputMode: 'numeric',
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !tz}
            startIcon={<LoginIcon />}
            size="large"
          >
            {loading ? 'מחפש...' : 'כניסה'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
