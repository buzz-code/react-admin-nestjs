import { useGetIdentity } from 'react-admin';

export function useLateValue() {
    const { identity } = useGetIdentity();
    return getLateValue(identity);
}

export function getLateValue(identity) {
    return identity?.additionalData?.lateValue || 0.3;
}

export const useDashboardItems = () => {
    const { identity } = useGetIdentity();
    return getDashboardItems(identity);
};

export function getDashboardItems(identity) {
    return identity?.additionalData?.dashboardItems || getDefaultDashboardItems();
}

export function getDefaultDashboardItems() {
    return [
        {
            resource: 'att_report_with_report_month',
            icon: 'List',
            yearFilterType: 'year',
            filter: {},
        },
        {
            resource: 'student_by_year',
            icon: 'List',
            yearFilterType: 'year',
            filter: {},
        },
    ];
}

export const useReportStyles = () => {
    const { identity } = useGetIdentity();
    return getReportStyles(identity);
};

export function getReportStyles(identity) {
    return identity?.additionalData?.reportStyles || [];
}

// The report card only ever has these six style slots - it's a fixed set,
// not an open-ended list, so the settings UI shouldn't ask users to add rows
// and pick a "type" for each. `type` stays on each object (report generation
// reads styles by type), it's just no longer a field the user edits.
export const REPORT_STYLE_TYPES = [
    { id: 'titlePrimary', label: 'כותרת ראשית' },
    { id: 'titleSecondary', label: 'כותרת משנית (תאריכים)' },
    { id: 'titleThird', label: 'כותרת שלישית' },
    { id: 'tableHeader', label: 'כותרת טבלה' },
    { id: 'tableCell', label: 'תא טבלה' },
    { id: 'document', label: 'טקסט כללי' },
];

// What the report actually renders with when a field is left blank - mirrors
// defaultReportStyles in server/src/reports/studentReportCardReact.tsx, so
// keep the two in sync if that file's defaults ever change.
export const REPORT_STYLE_DEFAULTS = {
    titlePrimary: { fontSize: 18 },
    titleSecondary: { fontSize: 16 },
    titleThird: { fontSize: 16 },
    tableHeader: { fontSize: 16 },
    tableCell: { fontSize: 16 },
    document: { fontFamily: 'Roboto', fontSize: 12 },
};

// Existing users may have 0-6 style entries, saved in whatever order they
// were added in - re-map them onto the fixed 6 slots by `type` so a form
// field bound to `reportStyles.<index>` always edits the right slot.
export function normalizeReportStyles(rawStyles = []) {
    return REPORT_STYLE_TYPES.map(({ id }) => (
        rawStyles.find((style) => style.type === id) || {
            type: id,
            fontFamily: '',
            fontSize: null,
            isBold: false,
            isItalic: false,
        }
    ));
}

export const useReportCardSettings = () => {
    const { identity } = useGetIdentity();
    return getReportCardSettings(identity);
};

export function getReportCardSettings(identity) {
    return identity?.additionalData?.reportCardSettings || getDefaultReportCardSettings();
}

export function getDefaultReportCardSettings() {
    return {
        attendance: true,
        grades: true,
        showStudentTz: true,
        groupByKlass: false,
        hideAbsTotal: false,
        minimalReport: false,
        forceAtt: false,
        forceGrades: false,
        downComment: false,
        lastGrade: true,
    };
}
