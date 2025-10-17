import React from 'react';
import { Form, TextInput } from 'react-admin';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const ConfigurationForm = ({ configValues, onChange }) => {
    const handleFormChange = (values) => {
        onChange(values);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                שלב 2: הגדרות
            </Typography>
            <Form record={configValues} onSubmit={() => {}} onChange={handleFormChange}>
                <Stack spacing={2} sx={{ maxWidth: 600 }}>
                    <TextInput
                        source="reason"
                        label="סיבה"
                        fullWidth
                    />
                    <TextInput
                        source="senderName"
                        label="שם השולח"
                        fullWidth
                    />
                    <TextInput
                        source="comment"
                        label="הערה"
                        multiline
                        rows={3}
                        fullWidth
                    />
                    <Typography variant="caption" color="text.secondary">
                        הערה: תאריך ומספר חיסורים יילקחו מהדיווח המקורי
                    </Typography>
                </Stack>
            </Form>
        </Box>
    );
};

export default ConfigurationForm;
