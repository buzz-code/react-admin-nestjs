import { useEffect } from 'react';
import { useDataProvider, SimpleForm, TextInput, useNotify, Toolbar, SaveButton, useResetStore } from 'react-admin';
import { useObjectStore } from 'src/utils/storeUtil';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Paper from '@mui/material/Paper';

// Teacher login lives only in this tab (sessionStorage) and expires after idle time,
// so the next teacher on a shared computer must enter her ID again.
export const TEACHER_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const LAST_ACTIVE_KEY = 'teacherLastActive';
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

const getLastActive = () => {
    try {
        return Number(sessionStorage.getItem(LAST_ACTIVE_KEY)) || 0;
    } catch {
        return 0;
    }
};
const touchLastActive = () => {
    try {
        sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    } catch {}
};
const clearLastActive = () => {
    try {
        sessionStorage.removeItem(LAST_ACTIVE_KEY);
    } catch {}
};
const isSessionActive = () => Date.now() - getLastActive() < TEACHER_IDLE_TIMEOUT_MS;

export const TeacherGuard = ({ children }) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const reset = useResetStore();
    const { value: teacher, set: setTeacher, clear } = useObjectStore('teacher');
    const sessionActive = !!teacher && isSessionActive();

    const handleLogout = () => {
        clearLastActive();
        clear();
        reset();
    };

    useEffect(() => {
        if (teacher && !sessionActive) {
            handleLogout();
        }
    }, [teacher, sessionActive]);

    useEffect(() => {
        if (!sessionActive) {
            return;
        }
        ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, touchLastActive, { passive: true }));
        const interval = setInterval(() => {
            if (!isSessionActive()) {
                handleLogout();
            }
        }, 30 * 1000);
        return () => {
            ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, touchLastActive));
            clearInterval(interval);
        };
    }, [sessionActive]);

    if (sessionActive) {
        return (
            <Box display="flex" flexDirection="column" width="100%">
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" component="div">
                        שלום המורה <strong>{teacher.name}</strong>
                    </Typography>
                    <Button variant="outlined" color="secondary" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        התנתק
                    </Button>
                </Paper>
                <Box flexGrow={1}>{children}</Box>
            </Box>
        );
    }

    const handleSubmit = async (values) => {
        const { tz } = values;
        const result = await dataProvider.getList('teacher', {
            pagination: { page: 1, perPage: 1 },
            filter: { tz },
        });
        const teacher = result.data[0] || null;

        if (teacher) {
            touchLastActive();
            setTeacher(teacher);
        } else {
            notify('לא נמצאה מורה עם ת.ז. זו. יש לבדוק שהמספר נכון (כולל אפס בתחילתו), ואם הבעיה נמשכת לפנות להנהלת המוסד.', { type: 'warning' });
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bgcolor="grey.100"
        >
            <Card sx={{ minWidth: 300, maxWidth: 400, p: 2, boxShadow: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        כניסת מורה
                    </Typography>
                </Box>
                <CardContent>
                    <SimpleForm
                        key="view-search-form"
                        onSubmit={handleSubmit}
                        resource="teacher"
                        toolbar={
                            <Toolbar
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    width: '100%',
                                    bgcolor: 'transparent',
                                    p: 0,
                                }}
                            >
                                <SaveButton label="כניסה" variant="contained" fullWidth color="secondary" />
                            </Toolbar>
                        }
                    >
                        <TextInput source="tz" label="ת.ז" fullWidth variant="outlined" />
                    </SimpleForm>
                </CardContent>
            </Card>
        </Box>
    );
};
