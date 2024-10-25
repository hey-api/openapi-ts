import { IRContext } from '../ir/context';
import type { Config } from '../types/config';
import { type OpenApiV3_0_3, parseV3_0_3 } from './3.0.3';
import { type OpenApiV3_1_0, parseV3_1_0 } from './3.1.0';
import type { Client } from './common/interfaces/client';
import type { OpenApi } from './common/interfaces/OpenApi';
import type { ParserConfig } from './config';
import { setParserConfig } from './config';
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
export function parseLegacy({
  openApi,
  parserConfig,
}: {
  openApi: OpenApi;
  parserConfig: ParserConfig;
}): Client {
  setParserConfig(parserConfig);

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

export type ParserOpenApiSpec = OpenApiV3_0_3 | OpenApiV3_1_0;

// TODO: parser - add JSDoc comment
export const parseExperimental = ({
  config,
  parserConfig,
  spec,
}: {
  config: Config;
  parserConfig: ParserConfig;
  spec: unknown;
}): IRContext | undefined => {
  const context = new IRContext({
    config,
    parserConfig,
    spec: spec as ParserOpenApiSpec,
  });

  switch (context.spec.openapi) {
    case '3.0.3':
      parseV3_0_3(context as IRContext<OpenApiV3_0_3>);
      break;
    case '3.1.0':
      parseV3_1_0(context as IRContext<OpenApiV3_1_0>);
      break;
    default:
      // TODO: parser - uncomment after removing legacy parser.
      // For now, we fall back to legacy parser if spec version
      // is not supported
      // throw new Error('Unsupported OpenAPI specification');
      break;
  }

  if (!Object.keys(context.ir).length) {
    return;
  }

  return context;
};
