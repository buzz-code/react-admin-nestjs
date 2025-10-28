import React, { useCallback, useState } from 'react';
import { Container, Paper, Stack } from '@mui/material';
import { ReportContext, defaultContextValue } from './context';
import { LessonSelector } from './LessonSelector';
import { TeacherSelector } from './TeacherSelector';
import { MainReport } from './MainReport';
import { round } from '@shared/utils/numericUtil';
import { useLateValue } from 'src/settings/settingsUtil';

export const InLessonReport = ({
    gradeMode,
    resource,
    Datagrid,
    handleSuccess,
    setDataToSave,
    setSignatureMetadata,
    data,
    saveData,
    isShowLate,
    isStartWithTeacher
}) => {
    const [lesson, setLesson] = useState(null);
    const [students, setStudents] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const lateValue = useLateValue();

    const handleTeacherSelect = useCallback((teacher) => {
        setSelectedTeacher(teacher);
    }, []);

    const handleLessonFound = useCallback(({ lesson, students }) => {
        setLesson(lesson);
        setStudents(students);
    }, []);

    const handleCancel = useCallback(() => {
        setLesson(null);
        setSelectedTeacher(null);
        setDataToSave(null);
    }, []);

    const handleSave = useCallback((formData) => {
        const { reportDates, howManyLessons, lessonDetails, signatureData, ...rest } = formData;
        const dataToSave = [];

        const entry = {
            teacherReferenceId: lesson.teacherReferenceId,
            klassReferenceId: lesson.klassReferenceIds[0],
            lessonReferenceId: lesson.id,
        };
        
        reportDates.forEach((reportDate, index) => {
            const reportDateEntry = { ...entry, reportDate };
            Object.keys(rest).forEach((studentId) => {
                const newEntry = { ...reportDateEntry, studentReferenceId: studentId };
                if (gradeMode) {
                    newEntry.grade = rest[studentId]?.[`grade_${index}`] ?? 0;
                    newEntry.comments = rest[studentId]?.[`comments_${index}`] ?? '';
                } else {
                    newEntry.howManyLessons = howManyLessons;
                    newEntry.absCount = round(
                        (rest[studentId]?.[`absence_${index}`] ?? 0) +
                        (rest[studentId]?.[`late_${index}`] ?? 0) * lateValue
                    );
                }
                dataToSave.push(newEntry);
            });
        });

        setDataToSave(dataToSave);
        
        // Build metadata with per-date details
        const dateDetailsMetadata = {};
        if (lessonDetails) {
            reportDates.forEach((reportDate, index) => {
                const lessonStartTime = lessonDetails[index]?.lessonStartTime;
                const lessonEndTime = lessonDetails[index]?.lessonEndTime;
                const lessonTopic = lessonDetails[index]?.lessonTopic;

                if (lessonStartTime || lessonEndTime || lessonTopic) {
                    dateDetailsMetadata[reportDate] = {
                        lessonStartTime,
                        lessonEndTime,
                        lessonTopic
                    };
                }
            });
        }

        const hasAnySignatureField = signatureData || Object.keys(dateDetailsMetadata).length > 0;

        if (hasAnySignatureField) {
            setSignatureMetadata({
                dateDetails: dateDetailsMetadata,
                signatureData,
            });
        } else {
            setSignatureMetadata(null);
        }
    }, [lesson, gradeMode, lateValue]);

    const contextValue = {
        ...defaultContextValue,
        gradeMode,
        isShowLate,
        lesson,
        students,
        resource,
        Datagrid,
        data,
        saveData,
        handleSuccess,
        handleCancel,
    };

    return (
        <Container fixed mt={4}>
            <Paper>
                <Stack>
                    {!lesson ? (
                        isStartWithTeacher && !selectedTeacher ? (
                            <TeacherSelector onTeacherSelected={handleTeacherSelect} />
                        ) : (
                            <LessonSelector
                                onLessonFound={handleLessonFound}
                                selectedTeacher={selectedTeacher}
                            />
                        )
                    ) : (
                        <ReportContext.Provider value={contextValue}>
                            <MainReport gradeMode={gradeMode} handleSave={handleSave} />
                        </ReportContext.Provider>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
};