import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
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
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>חלק בתעודה</TableCell>
                        <TableCell>גופן</TableCell>
                        <TableCell>גודל</TableCell>
                        <TableCell align="center">מודגש</TableCell>
                        <TableCell align="center">נטוי</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {REPORT_STYLE_TYPES.map(({ id, label }, index) => (
                        <TableRow key={id}>
                            <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                    {label}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                                <CommonAutocompleteInput
                                    source={`reportStyles.${index}.fontFamily`}
                                    choices={fontOptions}
                                    label={false}
                                    helperText={false}
                                    sx={{ margin: 0 }}
                                />
                            </TableCell>
                            <TableCell sx={{ width: 80 }}>
                                <NumberInput
                                    source={`reportStyles.${index}.fontSize`}
                                    label={false}
                                    helperText={false}
                                    sx={{ margin: 0 }}
                                />
                            </TableCell>
                            <TableCell align="center" sx={{ width: 60 }}>
                                <BooleanInput source={`reportStyles.${index}.isBold`} label={false} helperText={false} sx={{ margin: 0 }} />
                            </TableCell>
                            <TableCell align="center" sx={{ width: 60 }}>
                                <BooleanInput source={`reportStyles.${index}.isItalic`} label={false} helperText={false} sx={{ margin: 0 }} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CommonSettingsAccordion>
    );
}
