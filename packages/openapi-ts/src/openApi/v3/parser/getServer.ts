import type { OpenApi } from '../interfaces/OpenApi';

export const getServer = (openApi: OpenApi): string => {
  const server = openApi.servers?.[0];
  const variables = server?.variables || {};
  let url = server?.url || '';
  Object.entries(variables).forEach(([name, variable]) => {
    url = url.replace(`{${name}}`, variable.default);
  });
  return url.replace(/\/$/g, '');
};
