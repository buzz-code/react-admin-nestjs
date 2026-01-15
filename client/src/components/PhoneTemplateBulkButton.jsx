import React from 'react';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import PhoneIcon from '@mui/icons-material/Phone';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { required } from 'react-admin';

const PhoneTemplateBulkButton = ({ resource }) => {
  return (
    <BulkActionButton
      label="Send Phone Messages"
      icon={<PhoneIcon />}
      name="execute-phone-campaign"
      reloadOnEnd
    >
      <CommonReferenceInput 
        source="templateId" 
        reference="phone_template" 
        validate={required()}
        filter={{ isActive: true }}
        label="Select Phone Template"
      />
    </BulkActionButton>
  );
};

export default PhoneTemplateBulkButton;
