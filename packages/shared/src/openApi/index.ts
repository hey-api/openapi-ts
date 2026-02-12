import { satisfies } from '../config/utils/dependencies';
import type { Context } from '../ir/context';
import { parseV2_0_X } from './2.0.x';
import { parseV3_0_X } from './3.0.x';
import { parseV3_1_X } from './3.1.x';
import type { OpenApi } from './types';

/**
 * @internal
 * Parse the resolved OpenAPI specification. This will populate and return
 * `context` with intermediate representation obtained from the parsed spec.
 */
export function parseOpenApiSpec(context: Context): Context {
  if ('swagger' in context.spec) {
    parseV2_0_X(context as Context<OpenApi.V2_0_X>);
    return context;
  }

  if (satisfies(context.spec.openapi, '>=3.0.0 <3.1.0')) {
    parseV3_0_X(context as Context<OpenApi.V3_0_X>);
    return context;
  }

  if (satisfies(context.spec.openapi, '>=3.1.0')) {
    parseV3_1_X(context as Context<OpenApi.V3_1_X>);
    return context;
  }

  throw new Error('Unsupported OpenAPI specification');
}
