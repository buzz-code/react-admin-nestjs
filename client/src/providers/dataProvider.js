// import jsonServerProvider from 'ra-data-json-server';
// import crudProvider from 'ra-data-nestjsx-crud'
import crudProvider from '@fusionworks/ra-data-nest-crud';
import { apiUrl } from './constantsProvider';

// const dataProvider = jsonServerProvider('http://localhost:3000');
// const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
const dataProvider = crudProvider(apiUrl);

export default dataProvider;