import type { Logger } from '@hey-api/codegen-core';

import type { Config } from '~/config/types';
import { satisfies } from '~/config/utils/package';
import { Context } from '~/ir/context';
import { parseV2_0_X } from '~/openApi/2.0.x';
import { parseV3_0_X } from '~/openApi/3.0.x';
import { parseV3_1_X } from '~/openApi/3.1.x';
import type { OpenApi } from '~/openApi/types';

/**
 * @internal
 * Parse the resolved OpenAPI specification. This will populate and return
 * `context` with intermediate representation obtained from the parsed spec.
 */
export const parseOpenApiSpec = ({
  config,
  dependencies,
  logger,
  spec,
}: {
  config: Config;
  dependencies: Record<string, string>;
  logger: Logger;
  spec: unknown;
}): Context => {
  const context = new Context({
    config,
    dependencies,
    logger,
    spec: spec as OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X,
  });

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
};
