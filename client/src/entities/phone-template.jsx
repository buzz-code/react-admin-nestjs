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
  Button,
  useDataProvider,
  useGetRecordId,
  FormDataConsumer,
  useGetIdentity,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { ActionOrDialogButton } from '@shared/components/crudContainers/ActionOrDialogButton';
import { DialogContent, DialogActions, Button as MuiButton, Alert } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { useState } from 'react';

const filters = [
  ...commonAdminFilters,
  <TextInput source="name:$cont" alwaysOn />,
  <BooleanInput source="isActive" />,
];

const TestCallButton = ({ ...props }) => {
  const recordId = useGetRecordId();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    try {
      const result = await dataProvider.action('phone_template', 'test', {
        'extra.templateId': recordId,
        'extra.phoneNumber': phoneNumber,
      });
      
      notify('resources.phone_template.notifications.test_sent', { type: 'success' });
      setOpen(false);
      setPhoneNumber('');
    } catch (error) {
      notify(error.message || 'resources.phone_template.notifications.test_failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionOrDialogButton
      label="resources.phone_template.actions.test"
      icon={<PhoneIcon />}
      title="resources.phone_template.dialogs.test_title"
      onClick={(e) => e.stopPropagation()}
      dialogContent={() => (
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
            <MuiButton onClick={() => setOpen(false)}>ra.action.cancel</MuiButton>
            <MuiButton onClick={handleTest} disabled={!phoneNumber || loading} variant="contained">
              ra.action.send
            </MuiButton>
          </DialogActions>
        </>
      )}
    />
  );
};

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
      <TestCallButton />
    </CommonDatagrid>
  );
};

const ApiKeyWarning = () => {
  const { identity } = useGetIdentity();
  const hasApiKey = identity?.additionalData?.yemotApiKey;

  if (hasApiKey) return null;

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      Please configure your Yemot API key in your user settings before creating phone templates.
    </Alert>
  );
};

const Inputs = ({ isCreate, isAdmin }) => {
  const { identity } = useGetIdentity();
  const hasApiKey = identity?.additionalData?.yemotApiKey;

  return <>
    {isCreate && <ApiKeyWarning />}
    {!isCreate && <FormDataConsumer>{({ formData }) => <TestCallButton record={formData} />}</FormDataConsumer>}
    {!isCreate && isAdmin && <TextInput source="id" disabled />}
    {isAdmin && <CommonReferenceInput source="userId" reference="user" validate={required()} />}
    <TextInput source="name" validate={[required(), maxLength(100)]} disabled={isCreate && !hasApiKey} />
    <TextInput 
      source="description" 
      multiline 
      rows={3}
      validate={[required(), maxLength(500)]} 
      disabled={isCreate && !hasApiKey}
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
      disabled={isCreate && !hasApiKey}
    />
    <TextInput 
      source="callerId"
      helperText="resources.phone_template.help.callerId"
      disabled={isCreate && !hasApiKey}
    />
    <BooleanInput 
      source="isActive"
      defaultValue={true}
      disabled={isCreate && !hasApiKey}
    />
    {!isCreate && isAdmin && <TextField source="yemotTemplateId" />}
    {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
    {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
  </>;
};

const Representation = CommonRepresentation;

const entity = {
  Datagrid,
  Inputs,
  Representation,
  filters,
};

export default getResourceComponents(entity);
