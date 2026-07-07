import { useCallback, useState } from 'react';
import { TextField, useDataProvider } from 'react-admin';
import { ImportButton } from '@shared/components/import/ImportButton';
import { PreviewListWithSavingDialog } from '@shared/components/import/PreviewListWithSavingDialog';
import { useSavableData } from '@shared/components/import/util';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';

const RESOURCE = 'lesson_schedule';

const fields = ['organizationalYear', 'startTime', 'klassId', 'scheduleDate', 'lessonGroupCode', 'teacherId'];

const PreviewDatagrid = ({ children, ...props }) => (
    <CommonDatagrid {...props} bulkActionButtons={false}>
        {children}
        <TextField source="organizationalYear" label="שנה אירגונית" />
        <TextField source="startTime" label="משעה" />
        <TextField source="scheduleDate" label="תאריך" />
        <TextField source="klassId" label="התמחות" />
        <TextField source="lessonId" label="שיעור" />
        <TextField source="groupNumber" label="קבוצה" />
        <TextField source="teacherId" label="ת. זהות מורה" />
    </CommonDatagrid>
);

// The excel column "מספר שעור + קבוצה" combines two values (e.g. "7771109-02")
// that map to two separate entity fields, so it must be split before saving.
const splitLessonGroupCode = (row) => {
    const { lessonGroupCode, teacherId, ...rest } = row;
    const match = /^(\d+)-(\d+)$/.exec(String(lessonGroupCode ?? '').trim());
    return {
        ...rest,
        lessonId: match ? Number(match[1]) : undefined,
        groupNumber: match ? Number(match[2]) : undefined,
        teacherId: teacherId != null && teacherId !== '' ? String(teacherId) : undefined,
    };
};

// This file is uploaded daily, so re-importing a date should replace that
// date's rows rather than duplicate them. Deletion runs only once the admin
// confirms the save (not at parse/preview time) to avoid data loss on cancel.
const useReplaceDatesPreSaveHook = () => {
    const dataProvider = useDataProvider();
    return useCallback(
        async (data) => {
            const scheduleDates = [...new Set(data.map((row) => row.scheduleDate).filter(Boolean))];
            const idsToDelete = [];
            for (const scheduleDate of scheduleDates) {
                const { data: existing } = await dataProvider.getList(RESOURCE, {
                    filter: { scheduleDate },
                    pagination: { page: 1, perPage: 10000 },
                    sort: { field: 'id', order: 'ASC' },
                });
                idsToDelete.push(...existing.map((item) => item.id));
            }
            if (idsToDelete.length) {
                await dataProvider.deleteMany(RESOURCE, { ids: idsToDelete });
            }
        },
        [dataProvider],
    );
};

export const LessonScheduleImportButton = () => {
    const [uploadedData, setUploadedData] = useState(null);
    const [fileName, setFileName] = useState(null);
    const preSaveHook = useReplaceDatesPreSaveHook();
    const { data, saveData } = useSavableData(RESOURCE, fileName, uploadedData, undefined, undefined, preSaveHook);

    const handleDataParse = useCallback(({ name, data: parsedData }) => {
        setUploadedData(parsedData.map(splitLessonGroupCode));
        setFileName(name);
    }, []);

    const handlePreviewCancel = useCallback(() => {
        setUploadedData(null);
        setFileName(null);
    }, []);

    return (
        <>
            <ImportButton fields={fields} handleDataParse={handleDataParse} label="ייבוא מערכת שעות" />
            <PreviewListWithSavingDialog
                resource={RESOURCE}
                datagrid={PreviewDatagrid}
                data={data}
                saveData={saveData}
                handlePreviewCancel={handlePreviewCancel}
            />
        </>
    );
};
