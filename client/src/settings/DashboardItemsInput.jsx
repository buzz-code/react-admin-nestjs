import React from 'react';
import { ArrayInput, SimpleFormIterator, required, TextInput } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { CommonEntityNameInput } from '@shared/components/fields/CommonEntityNameInput';
import { CommonJsonInput } from '@shared/components/fields/CommonJsonItem';

export function DashboardItemsInput() {
    return (
        <CommonSettingsAccordion
            id="dashboard-items"
            title="הגדרות לוח מחוונים"
            subtitle="אילו כרטיסי נתונים יוצגו בלוח הבקרה"
        >
            <ArrayInput source="dashboardItems">
                <SimpleFormIterator>
                    <TextInput source="title" fullWidth />
                    <CommonEntityNameInput
                        source="resource"
                        allowedEntities={[
                            'att_report_with_report_month',
                            'grade',
                            'known_absence',
                            'student_klass_report',
                            'teacher_report_status',
                            'teacher_grade_report_status',
                            'student_percent_report',
                            'student_by_year',
                            'teacher',
                            'klass',
                            'lesson',
                        ]}
                        helperText="בחר את מקור הנתונים שברצונך להציג"
                        fullWidth
                        validate={required()}
                    />
                    <CommonAutocompleteInput
                        source="yearFilterType"
                        choices={[
                            { id: 'none', name: 'ללא סינון שנה' },
                            { id: 'year', name: 'סינון שנה רגיל' },
                            { id: 'year:$cont', name: 'סינון שנה מורחב' },
                        ]}
                        defaultValue="year"
                        fullWidth
                        disableClearable
                    />
                    <CommonJsonInput
                        source="filter"
                        helperText="קוד JSON לסינון נתונים נוסף, מעבר לשנה. דרוש רק במקרים מיוחדים."
                    />
                </SimpleFormIterator>
            </ArrayInput>
        </CommonSettingsAccordion>
    );
}
