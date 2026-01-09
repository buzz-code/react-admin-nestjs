import { connectToOpenobserve } from '@shared/utils/openobserveRumUtil';
import packageJson from '../package.json';

const isDevMode = location.href.includes('dev') || location.href.includes('localhost') || location.href.includes('127.0.0.1');
const options = {
    clientToken: '32363366626236332d333131632d343665642d616433372d316332366563386566313330',
    applicationId: 'demo-yoman-online',
    site: 'api.openobserve.ai',
    service: 'demo-frontend',
    env: isDevMode ? 'development' : 'production',
    version: packageJson.version,
    organizationIdentifier: 'hadasa_organization_50794_yN95E6myGED9AWO',
    insecureHTTP: false,
    apiVersion: 'v1',
};

connectToOpenobserve(options);
