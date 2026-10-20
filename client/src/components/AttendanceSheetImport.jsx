import { useCallback, useMemo, useRef, useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Button, useDataProvider, useGetList, useNotify, useTranslate } from 'react-admin';
import { handleError } from '@shared/utils/notifyUtil';
import { readAsDataURL } from '@shared/utils/fileUtil';
import { getCurrentHebrewYear } from '@shared/utils/yearFilter';

const listParams = {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'key', order: 'ASC' },
    filter: { year: getCurrentHebrewYear() },
};

const getOptionLabel = (option) => `${option.key} - ${option.name}`;

const isLessonOfKlass = (lesson, klass) =>
    Boolean(klass) && (lesson.klassReferenceIds ?? []).map(String).includes(String(klass.id));

const IssuesTable = ({ issues }) => {
    const translate = useTranslate();
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{translate('attendance_sheet.sheet')}</TableCell>
                    <TableCell>{translate('attendance_sheet.cell')}</TableCell>
                    <TableCell>{translate('attendance_sheet.reason')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {issues.map((issue, index) => (
                    <TableRow key={index}>
                        <TableCell>{issue.sheet}</TableCell>
                        <TableCell>{issue.cell}</TableCell>
                        <TableCell>{issue.message}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const ImportResult = ({ result }) => {
    const translate = useTranslate();
    if (!result.success) {
        return (
            <Stack spacing={1}>
                <Alert severity="error">
                    {translate('attendance_sheet.errors_title', { count: result.errors.length })}
                </Alert>
                <IssuesTable issues={result.errors} />
            </Stack>
        );
    }
    return (
        <Stack spacing={1}>
            <Alert severity="success">
                {translate('attendance_sheet.success', { created: result.created, updated: result.updated })}
            </Alert>
            {result.details.length > 0 && (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{translate('attendance_sheet.sheet')}</TableCell>
                            <TableCell>{translate('attendance_sheet.teacher')}</TableCell>
                            <TableCell>{translate('attendance_sheet.lesson')}</TableCell>
                            <TableCell>{translate('attendance_sheet.created')}</TableCell>
                            <TableCell>{translate('attendance_sheet.updated')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {result.details.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.sheet}</TableCell>
                                <TableCell>{row.teacherName}</TableCell>
                                <TableCell>{`${row.lessonKey} - ${row.lessonName}`}</TableCell>
                                <TableCell>{row.created}</TableCell>
                                <TableCell>{row.updated}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {result.warnings.length > 0 && (
                <>
                    <Alert severity="warning">
                        {translate('attendance_sheet.warnings_title', { count: result.warnings.length })}
                    </Alert>
                    <IssuesTable issues={result.warnings} />
                </>
            )}
        </Stack>
    );
};

const AttendanceSheetImport = () => {
    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const fileSelector = useRef();
    const [klass, setKlass] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const { data: klasses = [] } = useGetList('klass', listParams);
    const { data: allLessons = [] } = useGetList('lesson', listParams);
    const lessonOptions = useMemo(
        () =>
            allLessons
                .map((lesson) => ({ ...lesson, isKlassLesson: isLessonOfKlass(lesson, klass) }))
                .sort((a, b) => Number(b.isKlassLesson) - Number(a.isKlassLesson)),
        [allLessons, klass]
    );

    const handleDownload = useCallback(() => {
        const queryParams = {
            'extra.klassId': klass.id,
            'extra.lessonIds': lessons.map((lesson) => lesson.id).join(','),
        };
        setLoading(true);
        dataProvider
            .actionAndDownload('att_report', 'attendanceSheetTemplate', queryParams)
            .catch(handleError(notify))
            .finally(() => setLoading(false));
    }, [dataProvider, notify, klass, lessons]);

    const handleFileSelect = useCallback((e) => {
        e.preventDefault();
        fileSelector.current?.click();
    }, []);

    const handleFileUpload = useCallback(
        async (e) => {
            const [file] = e.target.files ?? [];
            e.target.value = null;
            if (!file) return;
            setLoading(true);
            setResult(null);
            try {
                const dataUrl = await readAsDataURL(file);
                const body = { fileName: file.name, fileData: dataUrl.split(',')[1] };
                const response = await dataProvider.action('att_report', 'attendanceSheetImport', {}, body);
                setResult(response.json);
            } catch (error) {
                handleError(notify)(error);
            } finally {
                setLoading(false);
            }
        },
        [dataProvider, notify]
    );

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {translate('attendance_sheet.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {translate('attendance_sheet.description')}
                        </Typography>
                    </Box>
                    <Divider />

                    <Stack spacing={2}>
                        <Typography variant="h6">{translate('attendance_sheet.download_title')}</Typography>
                        <Autocomplete
                            options={klasses}
                            getOptionLabel={getOptionLabel}
                            value={klass}
                            onChange={(e, value) => setKlass(value)}
                            renderInput={(params) => (
                                <TextField {...params} label={translate('attendance_sheet.klass')} />
                            )}
                        />
                        <Autocomplete
                            multiple
                            options={lessonOptions}
                            groupBy={(option) =>
                                translate(
                                    option.isKlassLesson
                                        ? 'attendance_sheet.klass_lessons'
                                        : 'attendance_sheet.other_lessons'
                                )
                            }
                            getOptionLabel={getOptionLabel}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={lessons}
                            onChange={(e, value) => setLessons(value)}
                            renderInput={(params) => (
                                <TextField {...params} label={translate('attendance_sheet.lessons')} />
                            )}
                        />
                        <Box>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                label={translate('attendance_sheet.download')}
                                onClick={handleDownload}
                                disabled={loading || !klass || !lessons.length}
                            />
                        </Box>
                    </Stack>
                    <Divider />

                    <Stack spacing={2}>
                        <Typography variant="h6">{translate('attendance_sheet.upload_title')}</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                variant="contained"
                                startIcon={<FileUploadIcon />}
                                label={translate('attendance_sheet.upload')}
                                onClick={handleFileSelect}
                                disabled={loading}
                            />
                            {loading && <CircularProgress size={24} />}
                        </Stack>
                        <input
                            type="file"
                            accept=".xlsx"
                            style={{ display: 'none' }}
                            ref={fileSelector}
                            onChange={handleFileUpload}
                            data-testid="attendance-sheet-file"
                        />
                        {result && <ImportResult result={result} />}
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
};

export default AttendanceSheetImport;
