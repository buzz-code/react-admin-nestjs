import { connectToOpenobserve } from '@shared/utils/openobserveRumUtil';
import packageJson from '../package.json';

const isDevMode =
    location.href.includes('dev') || location.href.includes('localhost') || location.href.includes('127.0.0.1');
const options = {
    clientToken: 'rumT5Tp2puIid9oSnTE',
    applicationId: 'demo-yoman-online',
    site: 'o2.yoman.online',
    service: 'demo-frontend',
    env: isDevMode ? 'development' : 'production',
    version: packageJson.version,
    organizationIdentifier: 'default',
    insecureHTTP: false,
    apiVersion: 'v1',
};

if (!isDevMode) {
    connectToOpenobserve(options);
}
