import { 
  DateField, 
  DateInput,
  FunctionField,
  ReferenceField,
  SelectInput, 
  TextField, 
  TextInput,
  List,
  Show,
  Datagrid,
  ShowButton,
  SimpleShowLayout,
  useNotify,
  useRefresh,
  Button,
  NumberField,
  ChipField,
} from 'react-admin';
import { CommonRepresentation } from '@shared/components/CommonRepresentation';
import RefreshIcon from '@mui/icons-material/Refresh';

const statusChoices = [
  { id: 'pending', name: 'resources.phone_campaign.statuses.pending' },
  { id: 'running', name: 'resources.phone_campaign.statuses.running' },
  { id: 'completed', name: 'resources.phone_campaign.statuses.completed' },
  { id: 'failed', name: 'resources.phone_campaign.statuses.failed' },
  { id: 'cancelled', name: 'resources.phone_campaign.statuses.cancelled' },
];

const filters = [
  <SelectInput 
    source="status" 
    label="resources.phone_campaign.fields.status" 
    choices={statusChoices}
  />,
  <TextInput 
    source="phoneTemplateId" 
    label="resources.phone_campaign.fields.phoneTemplateId"
  />,
  <DateInput 
    source="createdAt:$gte" 
    label="resources.phone_campaign.fields.dateFrom"
  />,
  <DateInput 
    source="createdAt:$lte" 
    label="resources.phone_campaign.fields.dateTo"
  />,
];

const RefreshStatusButton = ({ record }) => {
  const notify = useNotify();
  const refresh = useRefresh();

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/phone_campaign/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refresh-status',
          campaignId: record.id,
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        notify(result.error, { type: 'error' });
      } else {
        notify('resources.phone_campaign.notifications.status_refreshed', { type: 'success' });
        refresh();
      }
    } catch (error) {
      notify('resources.phone_campaign.notifications.refresh_failed', { type: 'error' });
    }
  };

  return (
    <Button
      label="resources.phone_campaign.actions.refresh"
      onClick={handleRefresh}
      disabled={!record.yemotCampaignId}
    >
      <RefreshIcon />
    </Button>
  );
};

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

const PhoneCampaignList = (props) => (
  <List {...props} filters={filters} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <ReferenceField 
        source="phoneTemplateId" 
        reference="phone_template"
        label="resources.phone_campaign.fields.template"
      />
      <FunctionField 
        label="resources.phone_campaign.fields.status"
        render={record => <StatusField record={record} />}
      />
      <NumberField 
        source="totalPhones" 
        label="resources.phone_campaign.fields.totalPhones"
      />
      <NumberField 
        source="successfulCalls" 
        label="resources.phone_campaign.fields.successfulCalls"
      />
      <NumberField 
        source="failedCalls" 
        label="resources.phone_campaign.fields.failedCalls"
      />
      <DateField 
        source="createdAt" 
        showTime 
        label="resources.phone_campaign.fields.createdAt"
      />
      <FunctionField
        render={record => <RefreshStatusButton record={record} />}
      />
      <ShowButton />
    </Datagrid>
  </List>
);

const PhoneCampaignShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <ReferenceField 
        source="phoneTemplateId" 
        reference="phone_template"
        label="resources.phone_campaign.fields.template"
      />
      <FunctionField 
        label="resources.phone_campaign.fields.status"
        render={record => <StatusField record={record} />}
      />
      <TextField 
        source="yemotCampaignId" 
        label="resources.phone_campaign.fields.yemotCampaignId"
      />
      <NumberField 
        source="totalPhones" 
        label="resources.phone_campaign.fields.totalPhones"
      />
      <NumberField 
        source="successfulCalls" 
        label="resources.phone_campaign.fields.successfulCalls"
      />
      <NumberField 
        source="failedCalls" 
        label="resources.phone_campaign.fields.failedCalls"
      />
      <FunctionField
        label="resources.phone_campaign.fields.successRate"
        render={record => {
          if (!record.totalPhones) return '0%';
          const rate = (record.successfulCalls / record.totalPhones * 100).toFixed(1);
          return `${rate}%`;
        }}
      />
      <TextField 
        source="errorMessage" 
        label="resources.phone_campaign.fields.errorMessage"
      />
      <DateField 
        source="createdAt" 
        showTime 
        label="resources.phone_campaign.fields.createdAt"
      />
      <DateField 
        source="completedAt" 
        showTime 
        label="resources.phone_campaign.fields.completedAt"
      />
      <FunctionField
        render={record => <RefreshStatusButton record={record} />}
      />
    </SimpleShowLayout>
  </Show>
);

export default {
  list: PhoneCampaignList,
  show: PhoneCampaignShow,
  recordRepresentation: (record) => `Campaign #${record.id}`,
};
