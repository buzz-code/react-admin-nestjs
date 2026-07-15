import React from 'react';
import { Box } from '@mui/material';
import { BooleanInput, Link } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';

export function ReportCardSettingsInput() {
    return (
        <CommonSettingsAccordion
            id="report-card-settings"
            title="הגדרות ברירת מחדל לתעודה"
            subtitle="אילו נתונים יופיעו בתעודה כברירת מחדל"
        >
            <Box sx={{ mb: 2 }}>
                <Link to="/image" target="_blank">
                    להגדרת תמונות
                </Link>
            </Box>
            <BooleanInput
                source="reportCardSettings.attendance"
                defaultChecked
                helperText="הצג את נתוני הנוכחות בתעודה"
            />
            <BooleanInput
                source="reportCardSettings.grades"
                defaultChecked
                helperText="הצג את הציונים בתעודה"
            />
            <BooleanInput
                source="reportCardSettings.showStudentTz"
                defaultChecked
                helperText="הצג את מספר תעודת הזהות של התלמידה בתעודה"
            />
            <BooleanInput
                source="reportCardSettings.groupByKlass"
                helperText="קבץ את השורות בתעודה לפי כיתה"
            />
            <BooleanInput
                source="reportCardSettings.hideAbsTotal"
                helperText="הסתר את שורת סיכום החיסורים הכללי בתחתית התעודה"
            />
            <BooleanInput
                source="reportCardSettings.minimalReport"
                helperText="הצג רק את שורת הסיכום, ללא פירוט לפי שיעור"
            />
            <BooleanInput
                source="reportCardSettings.forceAtt"
                helperText="הצג בתעודה רק שיעורים שיש בהם נתוני נוכחות"
            />
            <BooleanInput
                source="reportCardSettings.forceGrades"
                helperText="הצג בתעודה רק שיעורים שיש בהם ציון"
            />
            <BooleanInput
                source="reportCardSettings.downComment"
                helperText="הצג הערה חופשית מתחת לשם התלמידה בתעודה"
            />
            <BooleanInput
                source="reportCardSettings.lastGrade"
                defaultChecked
                helperText="הצג את הציון האחרון שנרשם, במקום ממוצע ציונים"
            />
        </CommonSettingsAccordion>
    );
}
