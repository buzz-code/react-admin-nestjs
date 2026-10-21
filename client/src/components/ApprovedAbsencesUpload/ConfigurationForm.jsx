import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const ConfigurationForm = ({ configValues, onChange }) => {
    const handleChange = (event) => {
        onChange({ ...configValues, [event.target.name]: event.target.value });
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                שלב 2: הגדרות
            </Typography>
            <Stack spacing={2} sx={{ maxWidth: 600 }}>
                <TextField name="reason" label="סיבה" value={configValues.reason} onChange={handleChange} fullWidth />
                <TextField
                    name="senderName"
                    label="שם השולח"
                    value={configValues.senderName}
                    onChange={handleChange}
                    fullWidth
                />
                <TextField
                    name="comment"
                    label="הערה"
                    value={configValues.comment}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                    הערה: תאריך ומספר חיסורים יילקחו מהדיווח המקורי
                </Typography>
            </Stack>
        </Box>
    );
};

export default ConfigurationForm;
