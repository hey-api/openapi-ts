import { type OpenApiV3_0_3, parseV3_0_3 } from './3.0.3';
import { type OpenApiV3_1, parseV3_1 } from './3.1';
import type { Client } from './common/interfaces/client';
import type { Config } from './common/interfaces/config';
import type { OpenApi } from './common/interfaces/OpenApi';
import { setConfig } from './config';
import { parse as parseV2 } from './v2';
import { parse as parseV3 } from './v3';

export type {
  Client,
  Enum,
  Method,
  Model,
  ModelMeta,
  Operation,
  OperationParameter,
  OperationResponse,
} from './common/interfaces/client';
export type { Config } from './common/interfaces/config';
export type { OpenApi } from './common/interfaces/OpenApi';
export { isOperationParameterRequired } from './common/parser/operation';
export {
  ensureValidTypeScriptJavaScriptIdentifier,
  sanitizeNamespaceIdentifier,
  sanitizeOperationParameterName,
} from './common/parser/sanitize';
export { getType } from './common/parser/type';
export type { OpenApiSchema as OpenApiV2Schema } from './v2/interfaces/OpenApiSchema';
export type { OpenApiSchema as OpenApiV3Schema } from './v3/interfaces/OpenApiSchema';

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
  setConfig(config);

  if ('openapi' in openApi) {
    return parseV3(openApi);
  }

  if ('swagger' in openApi) {
    return parseV2(openApi);
  }

  throw new Error(
    `Unsupported OpenAPI specification: ${JSON.stringify(openApi, null, 2)}`,
  );
}

export const parseExperimental = ({ spec }: { spec: unknown }) => {
  const s = spec as OpenApiV3_0_3 | OpenApiV3_1;

  switch (s.openapi) {
    case '3.0.3':
      return parseV3_0_3(s);
    case '3.1.0':
      return parseV3_1(s);
    default:
      throw new Error('Unsupported OpenAPI specification');
  }
};
