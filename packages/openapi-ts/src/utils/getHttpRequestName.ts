import type { Config } from '../types/config';

/**
 * Generate the HttpRequest filename based on the selected client
 * @param client HTTP client to generate
 */
export const getHttpRequestName = (client: Config['client']): string => {
  switch (client.name) {
    case 'legacy/angular':
      return 'AngularHttpRequest';
    case 'legacy/axios':
      return 'AxiosHttpRequest';
    case 'legacy/fetch':
      return 'FetchHttpRequest';
    case 'legacy/node':
      return 'NodeHttpRequest';
    case 'legacy/xhr':
      return 'XHRHttpRequest';
    default:
      return '';
  }
};
