
import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';
import packageJson from '../package.json';

const options = {
  clientToken: '32363366626236332d333131632d343665642d616433372d316332366563386566313330',
  applicationId: 'demo-yoman-online',
  site: 'api.openobserve.ai',
  service: 'frontend',
  env: 'production',
  version: packageJson.version,
  organizationIdentifier: 'hadasa_organization_50794_yN95E6myGED9AWO',
  insecureHTTP: false,
  apiVersion: 'v1',
};

openobserveRum.init({
  applicationId: options.applicationId, // required, any string identifying your application
  clientToken: options.clientToken,
  site: options.site,
  organizationIdentifier: options.organizationIdentifier,
  service: options.service,
  env: options.env,
  version: options.version,
  trackResources: true,
  trackLongTasks: true,
  trackUserInteractions: true,
  apiVersion: options.apiVersion,
  insecureHTTP: options.insecureHTTP,
  defaultPrivacyLevel: 'allow' // 'allow' or 'mask-user-input' or 'mask'. Use one of the 3 values.
});

openobserveLogs.init({
  clientToken: options.clientToken,
  site: options.site,
  organizationIdentifier: options.organizationIdentifier,
  service: options.service,
  env: options.env,
  version: options.version,
  forwardErrorsToLogs: true,
  insecureHTTP: options.insecureHTTP,
  apiVersion: options.apiVersion,
});

openobserveRum.startSessionReplayRecording();