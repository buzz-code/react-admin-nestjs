import { 
  BooleanField, 
  BooleanInput, 
  DateField, 
  required, 
  SelectInput, 
  TextField, 
  TextInput,
  Create,
  Edit,
  List,
  Show,
  SimpleForm,
  Datagrid,
  ShowButton,
  EditButton,
  DeleteButton,
  SimpleShowLayout,
  FunctionField,
  useNotify,
  useRefresh,
  Button,
} from 'react-admin';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import PhoneIcon from '@mui/icons-material/Phone';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField } from '@mui/material';

const filters = [
  <TextInput source="name:$cont" label="resources.phone_template.fields.name" alwaysOn />,
  <BooleanInput source="isActive" label="resources.phone_template.fields.isActive" />,
];

const PhoneTemplateList = (props) => (
  <List {...props} filters={filters} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="name" label="resources.phone_template.fields.name" />
      <TextField source="description" label="resources.phone_template.fields.description" />
      <BooleanField source="isActive" label="resources.phone_template.fields.isActive" />
      <DateField source="createdAt" showTime label="resources.phone_template.fields.createdAt" />
      <ShowButton />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

const TestCampaignButton = ({ record }) => {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const notify = useNotify();
  const refresh = useRefresh();

  const handleTest = async () => {
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
        setOpen(false);
        setPhoneNumber('');
      }
    } catch (error) {
      notify('resources.phone_template.notifications.test_failed', { type: 'error' });
    }
  };

  return (
    <>
      <Button
        label="resources.phone_template.actions.test"
        onClick={() => setOpen(true)}
      >
        <PhoneIcon />
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>resources.phone_template.dialogs.test_title</DialogTitle>
        <DialogContent>
          <MuiTextField
            autoFocus
            margin="dense"
            label="resources.phone_template.fields.test_phone"
            type="tel"
            fullWidth
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="05XXXXXXXX"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} label="ra.action.cancel" />
          <Button onClick={handleTest} label="ra.action.send" disabled={!phoneNumber} />
        </DialogActions>
      </Dialog>
    </>
  );
};

const PhoneTemplateShow = (props) => (
  <Show {...props} actions={<TestCampaignButton />}>
    <SimpleShowLayout>
      <TextField source="name" label="resources.phone_template.fields.name" />
      <TextField source="description" label="resources.phone_template.fields.description" />
      <TextField source="messageType" label="resources.phone_template.fields.messageType" />
      <TextField source="messageText" label="resources.phone_template.fields.messageText" />
      <TextField source="callerId" label="resources.phone_template.fields.callerId" />
      <BooleanField source="isActive" label="resources.phone_template.fields.isActive" />
      <TextField source="yemotTemplateId" label="resources.phone_template.fields.yemotTemplateId" />
      <DateField source="createdAt" showTime label="resources.phone_template.fields.createdAt" />
      <DateField source="updatedAt" showTime label="resources.phone_template.fields.updatedAt" />
    </SimpleShowLayout>
  </Show>
);

const PhoneTemplateForm = (props) => (
  <SimpleForm {...props}>
    <TextInput source="name" label="resources.phone_template.fields.name" validate={[required()]} />
    <TextInput 
      source="description" 
      label="resources.phone_template.fields.description" 
      multiline 
      rows={3}
      validate={[required()]} 
    />
    <SelectInput 
      source="messageType" 
      label="resources.phone_template.fields.messageType"
      choices={[
        { id: 'text', name: 'resources.phone_template.messageTypes.text' },
      ]}
      defaultValue="text"
      disabled
    />
    <TextInput 
      source="messageText" 
      label="resources.phone_template.fields.messageText"
      multiline 
      rows={5}
      validate={[required()]}
    />
    <TextInput 
      source="callerId" 
      label="resources.phone_template.fields.callerId"
      helperText="resources.phone_template.help.callerId"
    />
    <BooleanInput 
      source="isActive" 
      label="resources.phone_template.fields.isActive"
      defaultValue={true}
    />
  </SimpleForm>
);

const PhoneTemplateCreate = (props) => (
  <Create {...props}>
    <PhoneTemplateForm />
  </Create>
);

const PhoneTemplateEdit = (props) => (
  <Edit {...props}>
    <PhoneTemplateForm />
  </Edit>
);

export default {
  list: PhoneTemplateList,
  show: PhoneTemplateShow,
  create: PhoneTemplateCreate,
  edit: PhoneTemplateEdit,
  recordRepresentation: CommonRepresentation,
};
