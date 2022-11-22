import crudProvider from 'ra-data-nestjsx-crud';
import { fetchUtils } from 'react-admin';

import { apiUrl } from './constantsProvider';


const fetchJson = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({});
    }
    const token = localStorage.getItem('auth');
    options.headers.set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(url, options);
}

const dataProvider = crudProvider(apiUrl, fetchJson);

export default dataProvider;