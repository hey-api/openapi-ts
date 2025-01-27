import type { CreateClientConfig } from '@hey-api/client-fetch';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  // set default base url for requests
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  // set default headers for requests
  headers: {
    Authorization: 'Bearer <token_from_internal_client>',
  },
});
