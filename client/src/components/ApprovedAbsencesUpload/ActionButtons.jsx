import React from 'react';
import { Button } from 'react-admin';
import Box from '@mui/material/Box';

const ActionButtons = ({ loading, matchedCount, onCancel, onApply }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
                onClick={onCancel}
                disabled={loading}
            >
                ביטול
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={onApply}
                disabled={loading || matchedCount === 0}
            >
                אישור ויצירת חיסורים מאושרים
            </Button>
        </Box>
    );
};

export default ActionButtons;
