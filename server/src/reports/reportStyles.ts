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
        if (!userStyle) return defaultStyle;

        return {
            ...defaultStyle,
            ...Object.fromEntries(
                Object.entries(userStyle).filter(([_, value]) => value)
            )
        };
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

export function getFontLinks(styles: ReportElementStyle[]): string[] {
    const uniqueFonts = [...new Set(styles.map(style => style.fontFamily))];
    return uniqueFonts.map(font => `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}&display=swap`);
}