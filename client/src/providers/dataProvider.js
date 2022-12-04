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

dataProvider.getCount = (resource, params) => {
    // const _a = params.filter || {}, { q: queryParams, $OR: orFilter } = _a, filter = __rest(_a, ["q", "$OR"]);
    // const encodedQueryParams = composeQueryParams(queryParams);
    // const encodedQueryFilter = RequestQueryBuilder.create({
    //     filter: composeFilter(filter),
    //     or: composeFilter(orFilter || {})
    // })
    //     .query();
    // const query = mergeEncodedQueries(encodedQueryParams, encodedQueryFilter);
    const query = '';
    const url = `${apiUrl}/${resource}/get-count?${query}`;
    return fetchJson(url).then(response => response.json).then(({ count }) => count);
};

dataProvider.simulateYemotCall = async (body) => fetchJson(
    apiUrl + '/yemot_call/handle-call',
    {
        method: 'POST',
        body: JSON.stringify(body)
    })

export default dataProvider;