import type { Client } from './common/interfaces/client';
import type { Config } from './common/interfaces/config';
import type { OpenApi } from './common/interfaces/OpenApi';
import { parse as parseV2 } from './v2/index';
import { parse as parseV3 } from './v3/index';

export type * from './common/interfaces/client';
export type { OpenApi, OpenApiSchema } from './common/interfaces/OpenApi';
export type { OpenApiSchema as OpenApiSchemaV2 } from './v2/interfaces/OpenApiSchema';
export type { OpenApiSchema as OpenApiSchemaV3 } from './v3/interfaces/OpenApiSchema';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec that we have loaded from disk.
 */
export function parse({
  openApi,
  config,
}: {
  config: Config;
  openApi: OpenApi;
}): Client {
  if ('openapi' in openApi) {
    return parseV3({ config, openApi });
  }

  if ('swagger' in openApi) {
    return parseV2({ config, openApi });
  }

  throw new Error(
    `Unsupported Open API specification: ${JSON.stringify(openApi, null, 2)}`,
  );
}
