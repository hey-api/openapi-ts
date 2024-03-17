import type { Options } from '../client/interfaces/Options';

/**
 * Generate the HttpRequest filename based on the selected client
 * @param client The selected HTTP client (fetch, xhr, node or axios)
 */
export const getHttpRequestName = (client: Options['client']): string => {
    switch (client) {
        case 'angular':
            return 'AngularHttpRequest';
        case 'axios':
            return 'AxiosHttpRequest';
        case 'node':
            return 'NodeHttpRequest';
        case 'xhr':
            return 'XHRHttpRequest';
        case 'fetch':
        default:
            return 'FetchHttpRequest';
    }
};
