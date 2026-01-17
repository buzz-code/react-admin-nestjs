import { 
  DateField,
  DateInput,
  SelectInput, 
  TextField, 
  TextInput,
  NumberField,
  ChipField,
} from 'react-admin';
import { CommonDatagrid } from '@shared/components/crudContainers/CommonList';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import { BulkActionButton } from '@shared/components/crudContainers/BulkActionButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { commonAdminFilters } from '@shared/components/fields/PermissionFilter';

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
    <CommonDatagrid {...props} readonly additionalBulkButtons={additionalBulkButtons}>
      {children}
      {isAdmin && <TextField source="id" />}
      {isAdmin && <TextField source="userId" />}
      <TextField source="phoneTemplateId" />
      <StatusField />
      <NumberField source="totalPhones" />
      <NumberField source="successfulCalls" />
      <NumberField source="failedCalls" />
      <TextField source="errorMessage" />
      <DateField showDate showTime source="createdAt" />
    </CommonDatagrid>
  );
};

const Representation = (record) => `Campaign #${record.id}`;

const entity = {
  Datagrid,
  Representation,
  filters,
};

export default getResourceComponents(entity);
