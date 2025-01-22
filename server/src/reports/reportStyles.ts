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

export function mergeStyles(userStyles: ReportStyles, defaultStyles: ReportStyles): ReportStyles {
    if (!userStyles || userStyles.length === 0) {
        return defaultStyles;
    }

    return defaultStyles.map(defaultStyle => {
        const userStyle = userStyles.find(style => style.type === defaultStyle.type);
        return userStyle ? { ...defaultStyle, ...userStyle } : defaultStyle;
    });
}

export function getElementStyle(elementType: ReportElementType, styles: ReportStyles): ReportElementStyle {
    return styles.find(style => style.type === elementType) || styles[0];
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