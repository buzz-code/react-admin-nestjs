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

test('uploads the file and shows the success summary', async () => {
    const dataProvider = makeDataProvider({
        success: true,
        errors: [],
        warnings: [{ sheet: 'א1', cell: 'A10', message: 'התלמידה לא משויכת לכיתה' }],
        created: 3,
        updated: 1,
        details: [{ sheet: 'א1', teacherName: 'מורה א', lessonKey: 101, lessonName: 'מתמטיקה', created: 3, updated: 1 }],
    });
    renderScreen(dataProvider);

    expect(screen.getByText('שלב 1: הורדת קובץ לכיתה')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /הורדת קובץ/ })).toBeDisabled();

    uploadFile();

    expect(await screen.findByText('הקובץ נקלט: 3 דיווחים חדשים, 1 דיווחים עודכנו')).toBeInTheDocument();
    expect(screen.getByText('101 - מתמטיקה')).toBeInTheDocument();
    expect(screen.getByText('התלמידה לא משויכת לכיתה')).toBeInTheDocument();
    const [resource, action, , body] = dataProvider.action.mock.calls[0];
    expect([resource, action, body.fileName]).toEqual(['att_report', 'attendanceSheetImport', 'att.xlsx']);
    expect(body.fileData).toBe(btoa('abc'));
});

test('shows every error with sheet and cell when the file is rejected', async () => {
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
});
