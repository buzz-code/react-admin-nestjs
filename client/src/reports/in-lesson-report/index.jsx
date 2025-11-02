import React, { useCallback, useState } from 'react';
import { Container, Paper, Stack } from '@mui/material';
import { useNotify } from 'react-admin';
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
    hasReportGroupPermission
}) => {
    const [lesson, setLesson] = useState(null);
    const [students, setStudents] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const lateValue = useLateValue();
    const notify = useNotify();

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

    const handleSave = useCallback(async (formData) => {
        const { reportDates, howManyLessons, lessonDetails, signatureData, ...rest } = formData;
        
        try {
            // Step 1: Create ReportGroup (if user has permission)
            let reportGroup = null;
            let reportGroupSessions = [];
            
            if (hasReportGroupPermission) {
                // Create ReportGroup
                const firstDate = reportDates[0];
                const reportGroupData = {
                    name: `${lesson.name} - ${firstDate}`,
                    topic: lesson.name,
                    signatureData: signatureData || null,
                    teacherReferenceId: lesson.teacherReferenceId,
                    lessonReferenceId: lesson.id,
                    klassReferenceId: lesson.klassReferenceIds[0],
                    year: getCurrentHebrewYear(),
                };

                const reportGroupResponse = await dataProvider.create('report_group', {
                    data: reportGroupData
                });
                reportGroup = reportGroupResponse.data;

                // Step 2: Create ReportGroupSession for each date
                for (let index = 0; index < reportDates.length; index++) {
                    const reportDate = reportDates[index];
                    const details = lessonDetails?.[index];

                    const sessionData = {
                        reportGroupId: reportGroup.id,
                        sessionDate: reportDate,
                        startTime: details?.lessonStartTime || null,
                        endTime: details?.lessonEndTime || null,
                        topic: details?.lessonTopic || null,
                    };

                    const sessionResponse = await dataProvider.create('report_group_session', {
                        data: sessionData
                    });
                    reportGroupSessions.push(sessionResponse.data);
                }
            }

            // Step 3: Build dataToSave array with reportGroupSessionId
            const dataToSave = [];
            const entry = {
                teacherReferenceId: lesson.teacherReferenceId,
                klassReferenceId: lesson.klassReferenceIds[0],
                lessonReferenceId: lesson.id,
            };
            
            reportDates.forEach((reportDate, index) => {
                const reportDateEntry = { ...entry, reportDate };
                
                // Add reportGroupSessionId by index
                if (reportGroupSessions[index]) {
                    reportDateEntry.reportGroupSessionId = reportGroupSessions[index].id;
                }
                
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
            
            // Step 4: Set metadata with reportGroupId (for backward compatibility with ImportFile)
            if (reportGroup) {
                setSignatureMetadata({
                    reportGroupId: reportGroup.id,
                });
            } else {
                setSignatureMetadata(null);
            }
            
        } catch (error) {
            notify('שגיאה ביצירת קבוצת דיווח: ' + (error.message || 'שגיאה לא ידועה'), { type: 'error' });
            console.error('Error creating report group:', error);
        }
    }, [lesson, gradeMode, lateValue, dataProvider, notify, setDataToSave, setSignatureMetadata, hasReportGroupPermission]);

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