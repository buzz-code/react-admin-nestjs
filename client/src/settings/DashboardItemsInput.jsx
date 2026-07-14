import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { ArrayInput, SimpleFormIterator, TextInput, useGetResourceLabel, useSimpleFormIteratorItem } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';

// resource/yearFilterType/filter used to be hand-typed here, including a raw
// JSON filter field - nobody actually used it, and yearFilterType's "regular
// vs extended" choice meant nothing without reading the query code. Cards are
// created from a list's own filter UI instead (see AddToDashboardButton),
// which already produces valid resource+filter values. This is management
// only: rename, reorder, remove.
//
// SimpleForm here has no `record`, so SimpleFormIterator rows carry no
// RecordContext - read each row's live values via its form path instead.
const DashboardItemSummary = () => {
    const { index } = useSimpleFormIteratorItem();
    const record = useWatch({ name: `dashboardItems.${index}` });
    const getResourceLabel = useGetResourceLabel();
    if (!record?.resource) return null;
    const hasYearFilter = record.yearFilterType && record.yearFilterType !== 'none';
    const hasExtraFilter = record.filter && Object.keys(record.filter).length > 0;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={getResourceLabel(record.resource, 2)} />
            {hasYearFilter && <Chip size="small" variant="outlined" label="מסונן לפי שנה" />}
            {hasExtraFilter && <Chip size="small" variant="outlined" label="עם סינון נוסף" />}
        </Box>
    );
};

export function DashboardItemsInput() {
    return (
        <CommonSettingsAccordion
            id="dashboard-items"
            title="הגדרות לוח מחוונים"
            subtitle="כרטיסי נתונים שנוספו מתוך רשימות - ניתן לשנות שם, לסדר ולהסיר"
        >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                כדי להוסיף כרטיס חדש, סננו כל רשימה כרצונכם ולחצו על "הוסף ללוח מחוונים" בסרגל הכלים
                שלה.
            </Typography>
            <ArrayInput source="dashboardItems" label={false}>
                <SimpleFormIterator disableAdd>
                    <DashboardItemSummary />
                    <TextInput source="title" label="כותרת" fullWidth helperText={false} />
                </SimpleFormIterator>
            </ArrayInput>
        </CommonSettingsAccordion>
    );
}
