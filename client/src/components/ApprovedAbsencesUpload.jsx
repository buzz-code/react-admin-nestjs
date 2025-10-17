import React, { useState, useRef } from 'react';

// MUI Components
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// Sub-components
import FileUploadSection from './ApprovedAbsencesUpload/FileUploadSection';
import PreviewSummary from './ApprovedAbsencesUpload/PreviewSummary';
import PreviewTable from './ApprovedAbsencesUpload/PreviewTable';
import ConfigurationForm from './ApprovedAbsencesUpload/ConfigurationForm';
import ActionButtons from './ApprovedAbsencesUpload/ActionButtons';

// Custom Hooks
import { useFileProcessor } from './ApprovedAbsencesUpload/useFileProcessor';
import { useApplyAction } from './ApprovedAbsencesUpload/useApplyAction';

const ApprovedAbsencesUpload = () => {
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [configValues, setConfigValues] = useState({
        reason: 'התמחות מאושרת',
        senderName: '',
        comment: ''
    });
    const fileInputRef = useRef();

    // Custom hooks
    const { handleFileUpload } = useFileProcessor(setFileName, setPreviewData, setLoading);
    
    const resetForm = () => {
        setPreviewData(null);
        setFileName('');
        setConfigValues({
            reason: 'התמחות מאושרת',
            senderName: '',
            comment: ''
        });
    };

    const { handleApply } = useApplyAction(previewData, configValues, setLoading, resetForm);

    const handleCancel = () => {
        resetForm();
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {/* Header */}
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            העלאת חיסורים מאושרים
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            העלאת קובץ Excel להוספת חיסורים מאושרים עבור כיתות שלמות
                        </Typography>
                    </Box>

                    <Divider />

                    {/* File Upload Section */}
                    <FileUploadSection
                        fileInputRef={fileInputRef}
                        fileName={fileName}
                        loading={loading}
                        onFileSelect={handleFileSelect}
                        onDataParsed={handleFileUpload}
                    />

                    {/* Preview Section */}
                    {previewData && !loading && (
                        <>
                            <Divider />

                            {/* Summary Statistics */}
                            <PreviewSummary previewData={previewData} />

                            {/* Preview Table */}
                            {previewData.details && previewData.details.length > 0 && (
                                <Box>
                                    <PreviewTable data={previewData.details} />
                                </Box>
                            )}

                            <Divider />

                            {/* Configuration Form */}
                            <ConfigurationForm
                                configValues={configValues}
                                onChange={setConfigValues}
                            />

                            {/* Action Buttons */}
                            <ActionButtons
                                loading={loading}
                                matchedCount={previewData.matched}
                                onCancel={handleCancel}
                                onApply={handleApply}
                            />
                        </>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
};

export default ApprovedAbsencesUpload;
