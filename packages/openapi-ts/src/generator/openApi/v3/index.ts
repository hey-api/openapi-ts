import type { Client } from '../common/interfaces/client';
import type { Config } from '../common/interfaces/config';
import { getServiceVersion } from '../common/parser/service';
import type { OpenApi } from './interfaces/OpenApi';
import { getModels } from './parser/getModels';
import { getOperations } from './parser/getOperations';
import { getServer } from './parser/getServer';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec that we have loaded from disk.
 */
export const parse = ({
  openApi,
  config,
}: {
  config: Config;
  openApi: OpenApi;
}): Client => {
  const version = getServiceVersion(openApi.info.version);
  const server = getServer(openApi);
  const { models, types } = getModels({ config, openApi });
  const { operations, operationIds } = getOperations({
    config,
    openApi,
    types,
  });

  return {
    models,
    operationIds,
    operations,
    server,
    types,
    version,
  };
};
