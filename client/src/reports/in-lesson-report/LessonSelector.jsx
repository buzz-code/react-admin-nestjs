import React, { useCallback, useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { TabbedForm, Toolbar, SaveButton, TextInput, useDataProvider, useNotify } from 'react-admin';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter } from '@shared/utils/yearFilter';

const lessonKeyAndName = item => `${item.name} (${item.key})`;

export const LessonSelector = ({ onLessonFound, selectedTeacher }) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [lessonKey, setLessonKey] = useState(null);

    const lessonFilter = {
        ...defaultYearFilter,
    };
    if (selectedTeacher) {
        lessonFilter.teacherReferenceId = selectedTeacher.id;
    }

    const handleGetLesson = useCallback(async () => {
        try {
            const { data: [lesson] } = await dataProvider.getManyReference('lesson', {
                target: 'key',
                id: lessonKey,
                pagination: { page: 1, perPage: 1 },
                filter: lessonFilter,
            });
            if (!lesson) {
                throw new Error('Lesson not found');
            }

            const allStudents = await Promise.all(lesson.klassReferenceIds.map(async (klassId) => {
                const { data: students } = await dataProvider.getManyReference('student_klass', {
                    target: 'klassReferenceId',
                    id: klassId,
                    pagination: { page: 1, perPage: 1000 },
                    sort: { field: 'student.name', order: 'ASC' },
                    filter: { year: defaultYearFilter.year },
                });
                return students;
            }));

            const students = [], studentIds = new Set();
            allStudents.flat()
                .filter(student => student.student)
                .forEach(student => {
                    if (!studentIds.has(student.student.id)) {
                        students.push(student);
                        studentIds.add(student.student.id);
                    }
                });

            onLessonFound({ lesson, students });
        } catch (e) {
            console.error(e);
            notify('ra.message.lesson_not_found', { type: 'error' });
        }
    }, [dataProvider, notify, lessonKey, lessonFilter, onLessonFound]);

    return (
        <>
            <Box padding={2}>
                <Typography variant="h6" component="div">
                    בחרי שיעור
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    בחרי את השיעור שברצונך להעלות דוח נוכחות עבורו
                </Typography>
                {selectedTeacher && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        מורה נבחרת: {selectedTeacher.name} ({selectedTeacher.tz})
                    </Typography>
                )}
            </Box>
            <Divider />
            <Box padding={2}>
                <TabbedForm
                    toolbar={<Toolbar><SaveButton icon={<PlayArrowIcon />} label='הצג שיעור' /></Toolbar>}
                    onSubmit={handleGetLesson}>
                    <TabbedForm.Tab label="רשימה נפתחת">
                        <CommonReferenceInput
                            label="שיעור"
                            source="lessonKey"
                            reference="lesson"
                            optionValue='key'
                            optionText={lessonKeyAndName}
                            onChange={(e) => setLessonKey(e)}
                            filter={lessonFilter}
                        />
                    </TabbedForm.Tab>
                    <TabbedForm.Tab label="מספר שיעור">
                        <TextInput label="מזהה שיעור" source="lessonKey" onChange={(e) => setLessonKey(e.target.value)} />
                    </TabbedForm.Tab>
                </TabbedForm>
            </Box>
        </>
    );
};
