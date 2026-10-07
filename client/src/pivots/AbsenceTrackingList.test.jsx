import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminContext } from 'react-admin';
import AbsenceTrackingList from './AbsenceTrackingList';

const pivotRows = [
    {
        id: 1,
        name: 'שרה כהן',
        tz: '1',
        11: 9,
        12: 1,
        total: 10,
        totalKnownAbsences: 0,
        totalLessons: 40,
        headers: [
            { value: '11', label: 'אנגלית' },
            { value: '12', label: 'תנ"ך' },
            { value: 'total', label: 'סה"כ' },
        ],
    },
    { id: 2, name: 'רחל לוי', tz: '2', 11: 1, total: 1, totalKnownAbsences: 0, totalLessons: 40 },
    { id: 3, name: 'לאה בלי דיווח', tz: '3' },
];

const dataProvider = {
    getList: jest.fn((resource) => {
        if (resource.startsWith('student_by_year/pivot')) {
            return Promise.resolve({ data: pivotRows, total: pivotRows.length });
        }
        if (resource === 'student_base_klass') {
            return Promise.resolve({ data: [{ id: 1, klassName: 'א1' }, { id: 2, klassName: 'א1' }], total: 2 });
        }
        if (resource === 'att_report') {
            return Promise.resolve({
                data: [{ id: 7, lessonReferenceId: 11, howManyLessons: 2, absCount: 1, reportDate: '2026-10-05' }],
                total: 1,
            });
        }
        return Promise.resolve({ data: [], total: 0 });
    }),
    getOne: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
    getMany: jest.fn(() => Promise.resolve({ data: [] })),
    getManyReference: jest.fn(() => Promise.resolve({ data: [], total: 0 })),
};

test('shows class cards, threshold status and the student drill-down', async () => {
    render(
        <AdminContext dataProvider={dataProvider}>
            <AbsenceTrackingList />
        </AdminContext>,
    );

    expect(await screen.findByText('שרה כהן')).toBeInTheDocument();
    expect(await screen.findByText('א1')).toBeInTheDocument();
    // 10 of 40 = 25%, over the default 20% threshold by 2 absences.
    expect(screen.getByText('2 מעל הסף')).toBeInTheDocument();
    expect(screen.getByText('ועוד 1 בלי דיווחים בתקופה')).toBeInTheDocument();
    expect(screen.queryByText('לאה בלי דיווח')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('סף חיסורים (%)'), { target: { value: '30' } });
    expect(screen.getByText('עוד 2 חיסורים לסף')).toBeInTheDocument();

    fireEvent.click(screen.getByText('שרה כהן'));
    expect(await screen.findByText('פירוט לפי מקצוע')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('50.0%')).toBeInTheDocument());
});
