import React, { useCallback, useMemo, useState } from 'react';
import { useRedirect, useDataProvider } from 'react-admin';
import { useSavableData } from '../../shared/components/import/util';
import { Datagrid as AttDatagrid } from 'src/entities/att-report';
import { Datagrid as GradeDatagrid } from 'src/entities/grade';
import { useIsInLessonReportWithLate, useIsInLessonReportStartWithTeacher, useIsLessonSignature } from '../utils/appPermissions';
import { InLessonReport } from './in-lesson-report';

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

const useFileSource = (hasReportGroupPermission) => {
    if (hasReportGroupPermission) {
        return 'טופס נוכחות';
    }
    return undefined;
};

export default ({ gradeMode = false }) => {
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const isShowLate = useIsInLessonReportWithLate();
    const isStartWithTeacher = useIsInLessonReportStartWithTeacher();
    const hasReportGroupPermission = useIsLessonSignature();
    const { entityLabel, resource, Datagrid, redirectUrl } = useMemo(() => entityConfig[gradeMode ? 1 : 0], [gradeMode]);
    const fileName = useMemo(() => 'דיווח ' + entityLabel + ' ' + new Date().toISOString().split('T')[0], [entityLabel]);
    const fileSource = useFileSource(hasReportGroupPermission);
    const [dataToSave, setDataToSave] = useState(null);
    const [signatureMetadata, setSignatureMetadata] = useState(null);
    const { data, saveData } = useSavableData(resource, fileName, dataToSave, signatureMetadata, fileSource);

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
        />
    );
};