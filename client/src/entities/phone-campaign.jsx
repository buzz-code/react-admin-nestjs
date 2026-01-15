import { 
  DateField,
  DateInput,
  DateTimeInput,
  SelectInput, 
  TextField, 
  TextInput,
  NumberField,
  ChipField,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';

const statusChoices = [
  { id: 'pending', name: 'resources.phone_campaign.statuses.pending' },
  { id: 'running', name: 'resources.phone_campaign.statuses.running' },
  { id: 'completed', name: 'resources.phone_campaign.statuses.completed' },
  { id: 'failed', name: 'resources.phone_campaign.statuses.failed' },
  { id: 'cancelled', name: 'resources.phone_campaign.statuses.cancelled' },
];

const filters = [
  ...commonAdminFilters,
  <SelectInput 
    source="status"
    choices={statusChoices}
  />,
  <TextInput source="phoneTemplateId" />,
  <DateInput source="createdAt:$gte" label="resources.phone_campaign.fields.dateFrom" />,
  <DateInput source="createdAt:$lte" label="resources.phone_campaign.fields.dateTo" />,
];

const StatusField = ({ record }) => {
  const colorMap = {
    pending: 'default',
    running: 'primary',
    completed: 'success',
    failed: 'error',
    cancelled: 'warning',
  };

  return (
    <ChipField 
      source="status" 
      color={colorMap[record?.status] || 'default'}
    />
  );
};

const additionalBulkButtons = [
  <BulkActionButton
    key="refresh-status"
    label="resources.phone_campaign.actions.refresh"
    icon={<RefreshIcon />}
    name="refresh-status"
    reloadOnEnd
  />,
];

const Datagrid = ({ isAdmin, children, ...props }) => {
  return (
    <CommonDatagrid {...props} additionalBulkButtons={additionalBulkButtons}>
      {children}
      {isAdmin && <TextField source="id" />}
      {isAdmin && <TextField source="userId" />}
      <TextField source="phoneTemplateId" />
      <StatusField />
      <NumberField source="totalPhones" />
      <NumberField source="successfulCalls" />
      <NumberField source="failedCalls" />
      <DateField showDate showTime source="createdAt" />
    </CommonDatagrid>
  );
};

const Inputs = ({ isCreate, isAdmin }) => {
  return <>
    {!isCreate && isAdmin && <TextInput source="id" disabled />}
    {isAdmin && <CommonReferenceInput source="userId" reference="user" />}
    <TextInput source="phoneTemplateId" disabled />
    <SelectInput source="status" choices={statusChoices} disabled />
    <TextField source="yemotCampaignId" />
    <NumberField source="totalPhones" />
    <NumberField source="successfulCalls" />
    <NumberField source="failedCalls" />
    <TextField source="errorMessage" />
    {!isCreate && isAdmin && <DateTimeInput source="createdAt" disabled />}
    {!isCreate && isAdmin && <DateTimeInput source="updatedAt" disabled />}
    {!isCreate && <DateTimeInput source="completedAt" disabled />}
  </>;
};

const Representation = (record) => `Campaign #${record.id}`;

const entity = {
  Datagrid,
  Inputs,
  Representation,
  filters,
  hasCreate: false,
  hasEdit: false,
};

export default getResourceComponents(entity);
