import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { required } from 'react-admin';
import SignatureInput from '@shared/components/fields/signature/SignatureInput';
import { useIsLessonSignature } from 'src/utils/appPermissions';

const LessonSignatureFields = ({ record }) => {
  const hasPermission = useIsLessonSignature();

  if (!hasPermission) return null;

  return (
    <>
      <Divider />
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          חתימה דיגיטלית
        </Typography>

        <SignatureInput source="signatureData" label="חתימה דיגיטלית" validate={[required()]} />
      </Box>
    </>
  );
};

export default LessonSignatureFields;
