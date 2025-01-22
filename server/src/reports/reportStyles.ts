import { CSSProperties } from 'react';

export enum ReportElementType {
    DOCUMENT = 'document',           // General document text
    TABLE_HEADER = 'tableHeader',    // Table headers
    TABLE_CELL = 'tableCell',        // Table content
    TITLE_PRIMARY = 'titlePrimary',  // h2 headers (student name, class)
    TITLE_SECONDARY = 'titleSecondary' // h3 headers (dates, comments)
}

export interface ReportElementStyle {
    type: ReportElementType;
    fontFamily: string;
    fontSize: number;
    isBold: boolean;
    isItalic: boolean;
}

export type ReportStyles = ReportElementStyle[];

export const defaultReportStyles: ReportStyles = [
    {
        type: ReportElementType.DOCUMENT,
        fontFamily: 'Roboto',
        fontSize: 12,
        isBold: false,
        isItalic: false
    },
    {
        type: ReportElementType.TABLE_HEADER,
        fontFamily: 'Roboto',
        fontSize: 16,
        isBold: true,
        isItalic: false
    },
    {
        type: ReportElementType.TABLE_CELL,
        fontFamily: 'Roboto',
        fontSize: 16,
        isBold: false,
        isItalic: false
    },
    {
        type: ReportElementType.TITLE_PRIMARY,
        fontFamily: 'Roboto',
        fontSize: 18,
        isBold: true,
        isItalic: false
    },
    {
        type: ReportElementType.TITLE_SECONDARY,
        fontFamily: 'Roboto',
        fontSize: 16,
        isBold: true,
        isItalic: false
    }
];

export function getElementStyle(elementType: ReportElementType): ReportElementStyle {
    return defaultReportStyles.find(style => style.type === elementType) || defaultReportStyles[0];
}

export function convertToReactStyle(elementStyle: ReportElementStyle): CSSProperties {
    return {
        fontFamily: `"${elementStyle.fontFamily}", sans-serif`,
        fontSize: elementStyle.fontSize,
        fontWeight: elementStyle.isBold ? 'bold' : 'normal',
        fontStyle: elementStyle.isItalic ? 'italic' : 'normal'
    };
}

export function getFontLink(styles: ReportElementStyle[]): string {
    const uniqueFonts = [...new Set(styles.map(style => style.fontFamily))];
    const fontsQuery = uniqueFonts.join('|').replace(/\s+/g, '+');
    return `https://fonts.googleapis.com/css2?family=${fontsQuery}&display=swap`;
}