import { getConfig } from '../../../utils/config';

// TODO: this function could be moved so other plugins can reuse it
export const getClientBaseUrlKey = () => {
  const config = getConfig();
  return config.client.name === '@hey-api/client-axios' ? 'baseURL' : 'baseUrl';
};
