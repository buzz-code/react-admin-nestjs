// Smoke-tests every React Admin resource page registered in this app's App.
import { createResourceTests } from '@shared/utils/testing/createResourceTests';
import App from 'src/App';

createResourceTests(App);
