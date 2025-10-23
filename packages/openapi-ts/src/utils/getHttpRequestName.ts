import type { PluginClientNames } from '~/plugins/types';

/**
 * Generate the HttpRequest filename based on the selected client
 * @param client HTTP client to generate
 */
export const getHttpRequestName = (clientName: PluginClientNames): string => {
  switch (clientName) {
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
