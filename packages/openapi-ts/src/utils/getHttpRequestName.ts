import type { Config } from '../types/config';

/**
 * Generate the HttpRequest filename based on the selected client
 * @param client HTTP client to generate
 */
export const getHttpRequestName = (client: Config['client']): string => {
  switch (client.name) {
    case 'angular':
      return 'AngularHttpRequest';
    case 'axios':
      return 'AxiosHttpRequest';
    case 'fetch':
      return 'FetchHttpRequest';
    case 'node':
      return 'NodeHttpRequest';
    case 'xhr':
      return 'XHRHttpRequest';
    default:
      return '';
  }
};
