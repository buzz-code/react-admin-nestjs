import React, { useCallback, useMemo, useState } from 'react';
import { useRedirect, useDataProvider, useNotify } from 'react-admin';
import { useSavableData } from '../../shared/components/import/util';
import { Datagrid as AttDatagrid } from 'src/entities/att-report';
import { Datagrid as GradeDatagrid } from 'src/entities/grade';
import { useIsInLessonReportWithLate, useIsInLessonReportStartWithTeacher, useIsLessonSignature } from '../utils/appPermissions';
import { InLessonReport } from './in-lesson-report';
import { getCurrentHebrewYear } from '@shared/utils/yearFilter';

const entityConfig = [
    {
        index: 0,
        entityLabel: 'נוכחות',
        resource: 'att_report',
        Datagrid: AttDatagrid,
        redirectUrl: '/att_report_with_report_month',
    },
    {
        index: 1,
        entityLabel: 'ציון',
        resource: 'grade',
        Datagrid: GradeDatagrid,
        redirectUrl: '/grade',
    },
];

const IN_LESSON_FILE_SOURCE = 'טופס נוכחות';

export default ({ gradeMode = false }) => {
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const isShowLate = useIsInLessonReportWithLate();
    const isStartWithTeacher = useIsInLessonReportStartWithTeacher();
    const hasReportGroupPermission = useIsLessonSignature();
    const { entityLabel, resource, Datagrid, redirectUrl } = useMemo(() => entityConfig[gradeMode ? 1 : 0], [gradeMode]);
    const fileName = useMemo(() => 'דיווח ' + entityLabel + ' ' + new Date().toISOString().split('T')[0], [entityLabel]);
    const [dataToSave, setDataToSave] = useState(null);
    const [signatureMetadata, setSignatureMetadata] = useState(null);

    // Pre-save hook: creates ReportGroup & Sessions only when actually saving
    const preSaveHook = useCallback(async (data) => {
        if (!data || !data._formData) {
            return null;
        }
        if (!hasReportGroupPermission) {
            delete data._formData;
            return null;
        }

        try {
            const { reportDates, lessonDetails, signatureData, lesson } = data._formData;

            // Step 1: Create ReportGroup
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
            const reportGroup = reportGroupResponse.data;

            // Step 2: Create ReportGroupSession for each date
            const reportGroupSessions = [];
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

            // Step 3: Update data items with reportGroupSessionId
            const updatedData = data.map(item => {
                const dateIndex = item._dateIndex;
                const sessionId = reportGroupSessions[dateIndex]?.id;
                const { _dateIndex, ...cleanItem } = item;  // Remove temporary field
                return {
                    ...cleanItem,
                    reportGroupSessionId: sessionId,
                };
            });

            // Remove temporary _formData
            delete updatedData._formData;

            // Step 4: Return updated data and metadata
            return {
                updatedData,
                metadata: { reportGroupId: reportGroup.id },
            };
        } catch (error) {
            notify('שגיאה ביצירת קבוצת דיווח: ' + (error.message || 'שגיאה לא ידועה'), { type: 'error' });
            console.error('Error creating report group:', error);
            throw error;  // Re-throw to prevent save
        }
    }, [hasReportGroupPermission, dataProvider, notify]);

    const { data, saveData } = useSavableData(
        resource,
        fileName,
        dataToSave,
        signatureMetadata,
        IN_LESSON_FILE_SOURCE,
        preSaveHook
    );

    const handleSuccess = useCallback(() => {
        redirect(redirectUrl);
    }, [redirect, redirectUrl]);

    return (
        <InLessonReport
            gradeMode={gradeMode}
            resource={resource}
            Datagrid={Datagrid}
            fileName={fileName}
            handleSuccess={handleSuccess}
            setDataToSave={setDataToSave}
            setSignatureMetadata={setSignatureMetadata}
            data={data}
            saveData={saveData}
            isShowLate={isShowLate}
            isStartWithTeacher={isStartWithTeacher}
            dataProvider={dataProvider}
            hasReportGroupPermission={hasReportGroupPermission}
            preSaveHook={preSaveHook}
        />
    );
};