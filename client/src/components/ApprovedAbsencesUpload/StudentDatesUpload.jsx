import { useCallback, useRef, useState } from 'react';
import {
    Button,
    Datagrid,
    FunctionField,
    ListContextProvider,
    ResourceContextProvider,
    useDataProvider,
    useList,
    useNotify,
    useRecordContext,
} from 'react-admin';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { ExcelImportInput } from '@shared/components/import/ExcelImportInput';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import PreviewSummary from './PreviewSummary';
import ConfigurationForm from './ConfigurationForm';
import ActionButtons from './ActionButtons';

const defaultConfigValues = { reason: '', senderName: '', comment: '' };

const ExpandedRow = () => {
    const record = useRecordContext();
    if (!record?.reports?.length) return null;
    return (
        <Box sx={{ padding: 2, backgroundColor: '#fafafa' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {record.reports.map((report) => (
                    <Chip
                        key={report.id}
                        label={`${report.reportDate} ${report.lesson?.name || ''}`}
                        size="small"
                        variant="outlined"
                    />
                ))}
            </Stack>
        </Box>
    );
};

const PreviewTable = ({ data }) => {
    const listContext = useList({ data: data.map((item) => ({ id: item.index, ...item })) });
    return (
        <ListContextProvider value={listContext}>
            <ResourceContextProvider value="approved_absences_preview">
                <Datagrid bulkActionButtons={false} rowClick={false} expand={<ExpandedRow />}>
                    <FunctionField
                        label="סטטוס"
                        render={(record) =>
                            record.error ? <ErrorIcon color="error" /> : <CheckCircleIcon color="success" />
                        }
                    />
                    <FunctionField label="ת.ז." render={(record) => record.row.studentTz ?? ''} />
                    <FunctionField label="תלמידה" render={(record) => record.studentName || 'לא נמצאה'} />
                    <FunctionField label="כיתה" render={(record) => record.klassName || record.row.klassId || ''} />
                    <FunctionField
                        label="תאריכים"
                        render={(record) => [record.row.fromDate, record.row.toDate].filter(Boolean).join(' - ')}
                    />
                    <FunctionField label="חיסורים לאישור" render={(record) => record.reports.length} />
                    <FunctionField label="כבר מאושרים" render={(record) => record.alreadyApprovedCount} />
                    <FunctionField label="הערות" render={(record) => record.error || '-'} />
                </Datagrid>
            </ResourceContextProvider>
        </ListContextProvider>
    );
};

const StudentDatesUpload = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const fileInputRef = useRef();
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [rows, setRows] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [configValues, setConfigValues] = useState(defaultConfigValues);

    const resetForm = () => {
        setFileName('');
        setRows(null);
        setPreviewData(null);
        setConfigValues(defaultConfigValues);
    };

    const handleFileUpload = useCallback(
        async ({ name, data }) => {
            setFileName(name);
            const validRows = data.filter((row) => row.studentTz && row.fromDate);
            if (validRows.length === 0) {
                notify('הקובץ ריק או לא מכיל שורות תקינות', { type: 'error' });
                return;
            }
            try {
                setLoading(true);
                const { json: details } = await dataProvider.action(
                    'known_absence',
                    'previewByStudentDates',
                    {},
                    { rows: validRows },
                );
                const matched = details.filter((item) => item.reports.length > 0).length;
                setRows(validRows);
                setPreviewData({
                    total: validRows.length,
                    matched,
                    notMatched: details.length - matched,
                    details,
                });
            } catch (error) {
                handleError(notify)(error);
            } finally {
                setLoading(false);
            }
        },
        [dataProvider, notify],
    );

    const handleApply = async () => {
        try {
            setLoading(true);
            const response = await dataProvider.action(
                'known_absence',
                'approveByStudentDates',
                {},
                { rows, ...configValues },
            );
            handleActionSuccess(notify)(response);
            resetForm();
        } catch (error) {
            handleError(notify)(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h6" gutterBottom>
                    שלב 1: בחירת קובץ
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                        variant="contained"
                        startIcon={<FileUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                    >
                        בחר קובץ Excel
                    </Button>
                    <ExcelImportInput
                        ref={fileInputRef}
                        fields={['studentTz', 'klassId', 'fromDate', 'toDate']}
                        onDataParsed={handleFileUpload}
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
                    הקובץ צריך לכלול עמודות: ת.ז. תלמידה, מספר כיתה (לא חובה), תאריך, עד תאריך (לא חובה). כל החיסורים של
                    התלמידה בימים אלו יאושרו.
                </Typography>
            </Box>

            {previewData && !loading && (
                <>
                    <Divider />
                    <PreviewSummary previewData={previewData} />
                    <PreviewTable data={previewData.details} />
                    <Divider />
                    <ConfigurationForm configValues={configValues} onChange={setConfigValues} />
                    <ActionButtons
                        loading={loading}
                        matchedCount={previewData.matched}
                        onCancel={resetForm}
                        onApply={handleApply}
                    />
                </>
            )}
        </Stack>
    );
};

export default StudentDatesUpload;
