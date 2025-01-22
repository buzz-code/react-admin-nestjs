import React from 'react';
import { Typography } from '@mui/material';
import { ArrayInput, BooleanInput, NumberInput, SimpleFormIterator, required } from 'react-admin';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';

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
  { id: 'Georgia', name: 'Georgia' }
].sort((a, b) => a.name.localeCompare(b.name));


export function ReportStylesInput() {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        הגדרות סגנונות דוח
      </Typography>
      <ArrayInput source="reportStyles">
        <SimpleFormIterator>
          <CommonAutocompleteInput
            source="type"
            choices={[
              { id: 'document', name: 'טקסט כללי' },
              { id: 'tableHeader', name: 'כותרת טבלה' },
              { id: 'tableCell', name: 'תא טבלה' },
              { id: 'titlePrimary', name: 'כותרת ראשית' },
              { id: 'titleSecondary', name: 'כותרת משנית' }
            ]}
            fullWidth
            validate={required()}
          />
          <CommonAutocompleteInput
            source="fontFamily"
            label="גופן"
            choices={fontOptions}
            fullWidth
          />
          <NumberInput
            source="fontSize"
            label="גודל גופן"
            fullWidth
          />
          <BooleanInput
            source="isBold"
            label="מודגש"
          />
          <BooleanInput
            source="isItalic"
            label="נטוי"
          />
        </SimpleFormIterator>
      </ArrayInput>
    </>
  )
}