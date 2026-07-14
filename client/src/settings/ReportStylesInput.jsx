import React from 'react';
import { Box, Typography } from '@mui/material';
import { BooleanInput, NumberInput } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { REPORT_STYLE_TYPES } from './settingsUtil';

// Common Google Fonts list
const fontOptions = [
    { id: 'Arial', name: 'Arial' },
    { id: 'Open Sans', name: 'Open Sans' },
    { id: 'Roboto', name: 'Roboto' },
    { id: 'Lato', name: 'Lato' },
    { id: 'Montserrat', name: 'Montserrat' },
    { id: 'Raleway', name: 'Raleway' },
    { id: 'Poppins', name: 'Poppins' },
    { id: 'Noto Sans Hebrew', name: 'Noto Sans Hebrew' },
    { id: 'Assistant', name: 'Assistant' },
    { id: 'Heebo', name: 'Heebo' },
    { id: 'Rubik', name: 'Rubik' },
    { id: 'David Libre', name: 'David Libre' },
    { id: 'Varela Round', name: 'Varela Round' },
    { id: 'Times New Roman', name: 'Times New Roman' },
    { id: 'Georgia', name: 'Georgia' },
].sort((a, b) => a.name.localeCompare(b.name));

export function ReportStylesInput() {
    return (
        <CommonSettingsAccordion
            id="report-styles"
            title="הגדרות עיצוב תעודה"
            subtitle="גופן וגודל לכל חלק בתעודה"
        >
            {REPORT_STYLE_TYPES.map(({ id, label }, index) => (
                <Box
                    key={id}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        py: 1.5,
                        borderBottom: index < REPORT_STYLE_TYPES.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="body2" fontWeight={600} sx={{ width: 170, flexShrink: 0 }}>
                        {label}
                    </Typography>
                    <CommonAutocompleteInput
                        source={`reportStyles.${index}.fontFamily`}
                        choices={fontOptions}
                        label="גופן"
                        helperText={false}
                        sx={{ minWidth: 200, margin: 0 }}
                    />
                    <NumberInput
                        source={`reportStyles.${index}.fontSize`}
                        label="גודל"
                        helperText={false}
                        sx={{ width: 90, margin: 0 }}
                    />
                    <BooleanInput source={`reportStyles.${index}.isBold`} label="מודגש" helperText={false} />
                    <BooleanInput source={`reportStyles.${index}.isItalic`} label="נטוי" helperText={false} />
                </Box>
            ))}
        </CommonSettingsAccordion>
    );
}
