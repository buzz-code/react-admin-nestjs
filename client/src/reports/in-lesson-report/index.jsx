import React, { useCallback, useState, useEffect } from 'react';
import { Container, Paper, Stack } from '@mui/material';
import { useNotify, useStore } from 'react-admin';
import { ReportContext, defaultContextValue } from './context';
import { LessonSelector } from './LessonSelector';
import { TeacherSelector } from './TeacherSelector';
import { MainReport } from './MainReport';
import { round } from '@shared/utils/numericUtil';
import { useLateValue } from 'src/settings/settingsUtil';
import { getCurrentHebrewYear } from '@shared/utils/yearFilter';

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
    isStartWithTeacher,
    dataProvider,
    hasReportGroupPermission,
    preSaveHook,
    teacher,
}) => {
    const storePrefix = gradeMode ? 'InLessonReport.Grade' : 'InLessonReport.Att';
    const [lessonContext, setLessonContext] = useStore(`${storePrefix}.context`, null);
    const { lesson, students } = lessonContext || {};
    const [selectedTeacher, setSelectedTeacher] = useStore(`${storePrefix}.selectedTeacher`, teacher || null);
    const [, setFormData] = useStore(`${storePrefix}.form`, null);
    const [, setReportDates] = useStore(`${storePrefix}.reportDates`, null);
    const lateValue = useLateValue();
    const notify = useNotify();
    useEffect(() => {
        if (teacher && !selectedTeacher) {
            setSelectedTeacher(teacher);
        }
    }, [teacher]);

    const handleTeacherSelect = useCallback((teacher) => {
        setSelectedTeacher(teacher);
    }, [setSelectedTeacher]);

    const handleLessonFound = useCallback(({ lesson, students }) => {
        setLessonContext({ lesson, students });
    }, [setLessonContext]);

    const clearData = useCallback(() => {
        setLessonContext(null);
        setSelectedTeacher(teacher || null);
        setFormData(null);
        setReportDates(null);
    }, [teacher, setLessonContext, setSelectedTeacher, setDataToSave, setFormData, setReportDates]);

    const handleCancel = useCallback(() => {
        clearData();
        setDataToSave(null);
    }, [clearData, setDataToSave]);

    const handleSuccessWrapped = useCallback(() => {
        clearData();
        handleSuccess();
    }, [clearData, handleSuccess]);

    const handleSave = useCallback(async (formData) => {
        const { reportDates, howManyLessons, lessonDetails, signatureData, ...rest } = formData;

        // Build dataToSave array WITHOUT reportGroupSessionId
        // The preSaveHook will add it when actually saving
        const dataToSave = [];
        const entry = {
            teacherReferenceId: lesson.teacherReferenceId,
            klassReferenceId: lesson.klassReferenceIds[0],
            lessonReferenceId: lesson.id,
        };

        reportDates.forEach((reportDate, index) => {
            const reportDateEntry = {
                ...entry,
                reportDate,
                // Store index for preSaveHook to match with sessions
                _dateIndex: index,
            };

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

        // Store form data for preSaveHook to use
        dataToSave._formData = {
            reportDates,
            lessonDetails,
            signatureData,
            lesson,
        };

        setDataToSave(dataToSave);
    }, [lesson, gradeMode, lateValue, setDataToSave]);

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
        handleSuccess: handleSuccessWrapped,
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
                            <MainReport gradeMode={gradeMode} handleSave={handleSave} storePrefix={storePrefix} />
                        </ReportContext.Provider>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
};