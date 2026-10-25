import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminContext } from 'react-admin';
import { getI18nProvider } from '@shared/providers/i18nProvider';
import domainTranslations from 'src/domainTranslations';
import AttendanceSheetImport from './AttendanceSheetImport';

const makeDataProvider = (importResult) => ({
    getList: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
    getOne: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
    getMany: jest.fn(() => Promise.resolve({ data: [] })),
    getManyReference: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
    action: jest.fn(() => Promise.resolve({ json: importResult })),
    actionAndDownload: jest.fn(() => Promise.resolve({ data: {} })),
});

const renderScreen = (dataProvider) =>
    render(
        <AdminContext dataProvider={dataProvider} i18nProvider={getI18nProvider(domainTranslations)}>
            <AttendanceSheetImport />
        </AdminContext>
    );

const uploadFile = () =>
    fireEvent.change(screen.getByTestId('attendance-sheet-file'), {
        target: { files: [new File(['abc'], 'att.xlsx')] },
    });

const savedResult = {
    success: true,
    errors: [],
    warnings: [{ sheet: 'א1', cell: 'A10', message: 'התלמידה לא משויכת לכיתה' }],
    created: 3,
    updated: 1,
    details: [{ sheet: 'א1', teacherName: 'מורה א', lessonKey: 101, lessonName: 'מתמטיקה', created: 3, updated: 1 }],
};
const previewResult = {
    ...savedResult,
    rows: [
        {
            sheet: 'א1',
            cell: 'D9',
            studentTz: '900',
            studentName: 'תלמידה א',
            teacherName: 'מורה א',
            lessonName: 'מתמטיקה',
            reportDate: '2026-09-01',
            howManyLessons: 2,
            absCount: 1,
            isUpdate: true,
        },
    ],
};

test('previews the file without saving, then imports it on confirm', async () => {
    const dataProvider = makeDataProvider();
    dataProvider.action
        .mockResolvedValueOnce({ json: previewResult })
        .mockResolvedValueOnce({ json: savedResult });
    renderScreen(dataProvider);

    expect(screen.getByText('שלב 1: הורדת קובץ לכיתה')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /הורדת קובץ/ })).toBeDisabled();

    uploadFile();

    expect(await screen.findByText('תצוגה מקדימה: att.xlsx')).toBeInTheDocument();
    expect(screen.getByText('תלמידה א')).toBeInTheDocument();
    expect(screen.getByText('01/09/2026')).toBeInTheDocument();
    expect(screen.getByText('עדכון')).toBeInTheDocument();
    expect(screen.getByText('התלמידה לא משויכת לכיתה')).toBeInTheDocument();
    const [resource, action, query, body] = dataProvider.action.mock.calls[0];
    expect([resource, action, query, body.fileName]).toEqual([
        'att_report',
        'attendanceSheetImport',
        { 'extra.dryRun': true },
        'att.xlsx',
    ]);
    expect(body.fileData).toBe(btoa('abc'));

    fireEvent.click(screen.getByRole('button', { name: 'ייבא' }));

    expect(await screen.findByText('הקובץ נקלט: 3 דיווחים חדשים, 1 דיווחים עודכנו')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('תצוגה מקדימה: att.xlsx')).not.toBeInTheDocument());
    expect(dataProvider.action.mock.calls[1][2]).toEqual({});
    expect(dataProvider.action.mock.calls[1][3]).toEqual(body);
});

test('shows every error with sheet and cell and offers no import when the file is rejected', async () => {
    renderScreen(
        makeDataProvider({
            success: false,
            errors: [
                { sheet: 'א1', cell: 'F2', message: 'חסר קוד כיתה' },
                { sheet: 'א1', cell: 'D9', message: 'הערך "x" אינו מספר' },
            ],
            warnings: [],
            created: 0,
            updated: 0,
            details: [],
        })
    );

    uploadFile();

    await waitFor(() =>
        expect(screen.getByText('הקובץ לא נקלט. יש לתקן 2 שגיאות ולהעלות שוב (שום דיווח לא נשמר)')).toBeInTheDocument()
    );
    expect(screen.getByText('F2')).toBeInTheDocument();
    expect(screen.getByText('הערך "x" אינו מספר')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ייבא' })).not.toBeInTheDocument();
});
