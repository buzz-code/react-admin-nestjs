import { ArrayInput, CheckboxGroupInput, NumberInput, SimpleFormIterator, TextInput, required } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { PAGE_SIZE_OPTIONS } from '@shared/config/settings';

const pageSizeOptions = PAGE_SIZE_OPTIONS.map((option) => ({ id: option, name: option }));

const weekdayChoices = [
    { id: 0, name: 'ראשון' },
    { id: 1, name: 'שני' },
    { id: 2, name: 'שלישי' },
    { id: 3, name: 'רביעי' },
    { id: 4, name: 'חמישי' },
    { id: 5, name: 'שישי' },
];

export function GeneralSettingsInput() {
    return (
        <CommonSettingsAccordion
            id="general-settings"
            title="הגדרות כלליות"
            subtitle="מספר שורות בטבלה, שווי איחור וזמני שיעורים"
        >
            <CommonAutocompleteInput
                source="defaultPageSize"
                choices={pageSizeOptions}
                fullWidth
                disableClearable
                validate={required()}
            />
            <NumberInput
                source="lateValue"
                fullWidth
                validate={required()}
                helperText="המשקל של איחור אחד בחישוב החיסורים. לדוגמה, 0.3 אומר שכל איחור נספר כ-0.3 מחיסור (כלומר, כ-3-4 איחורים שווים לחיסור אחד)"
            />
            <ArrayInput
                source="lessonTimes"
                helperText="שעות ההתחלה והסיום של כל שיעור, לכל קבוצת ימים. בדוח המורות שדיווחו נוכחות יוצג ריבוע ריק לשיעור שלא דווח באמצע היום"
            >
                <SimpleFormIterator disableReordering>
                    <CheckboxGroupInput source="days" choices={weekdayChoices} validate={required()} />
                    <ArrayInput source="periods">
                        <SimpleFormIterator inline disableReordering>
                            <TextInput source="start" type="time" validate={required()} InputLabelProps={{ shrink: true }} />
                            <TextInput source="end" type="time" validate={required()} InputLabelProps={{ shrink: true }} />
                        </SimpleFormIterator>
                    </ArrayInput>
                </SimpleFormIterator>
            </ArrayInput>
        </CommonSettingsAccordion>
    );
}
