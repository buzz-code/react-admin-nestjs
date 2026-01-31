import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextInput } from 'react-admin';

export function YemotSettingsInput() {
  return (
    <Accordion sx={{ width: '100%' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="yemot-settings-content"
        id="yemot-settings-header"
      >
        <Typography variant="h6">הגדרות Yemot (מערכת שיחות טלפון)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextInput
          source="yemotApiKey"
          label="מפתח API של Yemot"
          helperText="הזן את מפתח ה-API שקיבלת ממערכת Yemot לשליחת הודעות טלפון"
          fullWidth
          type="password"
        />
      </AccordionDetails>
    </Accordion>
  );
}
