import type { Client } from '../common/interfaces/client';
import { getServiceVersion } from '../common/parser/service';
import type { OpenApi } from './interfaces/OpenApi';
import { getModels } from './parser/getModels';
import { getOperations } from './parser/getOperations';
import { getServer } from './parser/getServer';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, operations and schema's we should output.
 * @param openApi The OpenAPI spec that we have loaded from disk.
 */
export const parse = (openApi: OpenApi): Omit<Client, 'config'> => {
  const version = getServiceVersion(openApi.info.version);
  const server = getServer(openApi);
  const { models, types } = getModels(openApi);
  const operations = getOperations({ openApi, types });

  return {
    models,
    operations,
    server,
    types,
    version,
  };
};
