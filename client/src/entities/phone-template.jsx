import { 
  BooleanField, 
  BooleanInput, 
  DateField,
  DateTimeInput,
  required, 
  SelectInput, 
  TextField, 
  TextInput,
  maxLength,
  useRecordContext,
  useNotify,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { ActionOrDialogButton } from '@shared/components/crudContainers/ActionOrDialogButton';
import { DialogContent, DialogActions, Button } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useState } from 'react';

const filters = [
  ...commonAdminFilters,
  <TextInput source="name:$cont" alwaysOn />,
  <BooleanInput source="isActive" />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
  return (
    <CommonDatagrid {...props}>
      {children}
      {isAdmin && <TextField source="id" />}
      {isAdmin && <TextField source="userId" />}
      <TextField source="name" />
      <TextField source="description" />
      <BooleanField source="isActive" />
      {isAdmin && <DateField showDate showTime source="createdAt" />}
      {isAdmin && <DateField showDate showTime source="updatedAt" />}
    </CommonDatagrid>
  );
};

const Inputs = ({ isCreate, isAdmin }) => {
  return <>
    {!isCreate && isAdmin && <TextInput source="id" disabled />}
    {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
    <TextInput source="name" validate={[required(), maxLength(100)]} />
    <TextInput 
      source="description" 
      multiline 
      rows={3}
      validate={[required(), maxLength(500)]} 
    />
    <SelectInput 
      source="messageType"
      choices={[
        { id: 'text', name: 'resources.phone_template.messageTypes.text' },
      ]}
      defaultValue="text"
      disabled
    />
    <TextInput 
      source="messageText"
      multiline 
      rows={5}
      validate={[required()]}
    />
    <TextInput 
      source="callerId"
      helperText="resources.phone_template.help.callerId"
    />
    <BooleanInput 
      source="isActive"
      defaultValue={true}
    />
    {!isCreate && isAdmin && <TextField source="yemotTemplateId" />}
    {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
    {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
  </>;
};

const TestCallDialog = ({ onClose }) => {
  const record = useRecordContext();
  const notify = useNotify();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/phone_template/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          templateId: record.id,
          phoneNumber,
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        notify(result.error, { type: 'error' });
      } else {
        notify('resources.phone_template.notifications.test_sent', { type: 'success' });
        onClose();
      }
    } catch (error) {
      notify('resources.phone_template.notifications.test_failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogContent>
        <TextInput
          source="phoneNumber"
          label="resources.phone_template.fields.test_phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="05XXXXXXXX"
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ra.action.cancel</Button>
        <Button onClick={handleTest} disabled={!phoneNumber || loading} variant="contained">
          ra.action.send
        </Button>
      </DialogActions>
    </>
  );
};

const additionalShowActions = [
  <ActionOrDialogButton
    key="test"
    label="resources.phone_template.actions.test"
    icon={<PhoneIcon />}
    title="resources.phone_template.dialogs.test_title"
    dialogContent={TestCallDialog}
  />,
];

const Representation = CommonRepresentation;

const entity = {
  Datagrid,
  Inputs,
  Representation,
  filters,
  additionalShowActions,
};

export default getResourceComponents(entity);
