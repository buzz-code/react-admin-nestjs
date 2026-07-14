import React from 'react';
import { NumberInput, required } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { PAGE_SIZE_OPTIONS } from '@shared/config/settings';

const pageSizeOptions = PAGE_SIZE_OPTIONS.map((option) => ({ id: option, name: option }));

export function GeneralSettingsInput() {
    return (
        <CommonSettingsAccordion
            id="general-settings"
            title="הגדרות כלליות"
            subtitle="מספר שורות בטבלה ושווי איחור"
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
        </CommonSettingsAccordion>
    );
}
