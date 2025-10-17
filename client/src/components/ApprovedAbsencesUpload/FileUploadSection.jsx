import React from 'react';
import { Button } from 'react-admin';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { ExcelImportInput } from '@shared/components/import/ExcelImportInput';

const FileUploadSection = ({ fileInputRef, fileName, loading, onFileSelect, onDataParsed }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                שלב 1: בחירת קובץ
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                <Button
                    variant="contained"
                    startIcon={<FileUploadIcon />}
                    onClick={onFileSelect}
                    disabled={loading}
                >
                    בחר קובץ Excel
                </Button>
                <ExcelImportInput
                    ref={fileInputRef}
                    fields={['klassId', 'reportDate']}
                    onDataParsed={onDataParsed}
                    xlsxOptions={{ range: 1 }}
                />
                {fileName && (
                    <Typography variant="body2">
                        קובץ נבחר: <strong>{fileName}</strong>
                    </Typography>
                )}
                {loading && <CircularProgress size={24} />}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                הקובץ צריך לכלול עמודות: מספר כיתה, תאריך
            </Typography>
        </Box>
    );
};

export default FileUploadSection;
