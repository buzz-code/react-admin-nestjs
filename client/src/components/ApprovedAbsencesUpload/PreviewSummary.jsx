import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const PreviewSummary = ({ previewData }) => {
    if (!previewData) {
        return null;
    }

    return (
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                תצוגה מקדימה
            </Typography>
            <Stack direction="row" spacing={4}>
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        סך הכל שורות בקובץ
                    </Typography>
                    <Typography variant="h5">
                        {previewData.total || 0}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        דיווחים תואמים
                    </Typography>
                    <Typography variant="h5" color="success.main">
                        {previewData.matched || 0}
                    </Typography>
                </Box>
                {(previewData.notMatched || 0) > 0 && (
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            שורות עם שגיאות (יידלגו)
                        </Typography>
                        <Typography variant="h5" color="error.main">
                            {previewData.notMatched}
                        </Typography>
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default PreviewSummary;
