import { getConfig } from '../../../utils/config';
import { getClientPlugin } from '../../@hey-api/client-core/utils';

// TODO: this function could be moved so other plugins can reuse it
export const getClientBaseUrlKey = () => {
  const config = getConfig();
  const client = getClientPlugin(config);
  return client.name === '@hey-api/client-axios' ? 'baseURL' : 'baseUrl';
};
