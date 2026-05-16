import type { Symbol } from '@hey-api/codegen-core';
import type { RequestSchemaContext } from '@hey-api/shared';

import type { $ } from '../../ts-dsl';
import type { Pipe } from './shared/pipes';
import type { ValidatorArgs } from './shared/types';
import type { ValibotPlugin } from './types';
import {
  createRequestSchemaV1,
  createRequestValidatorV1,
  createResponseHandlersV1,
  createResponseTransformerV1,
  createResponseValidatorV1,
} from './v1/api';

type ArrowFunc = Extract<ReturnType<typeof $.func>, { '~mode': 'arrow' }>;

export type IApi = {
  createRequestSchema: (
    ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
  ) => Symbol | Pipe | undefined;
  createRequestValidator: (
    ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
  ) => ArrowFunc | undefined;
  createResponseHandlers: (ctx: ValidatorArgs) => {
    transformer: ArrowFunc | undefined;
    validator: ArrowFunc | undefined;
  };
  createResponseTransformer: (ctx: ValidatorArgs) => ArrowFunc | undefined;
  createResponseValidator: (ctx: ValidatorArgs) => ArrowFunc | undefined;
};

export class Api implements IApi {
  createRequestSchema(
    ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
  ): ReturnType<IApi['createRequestSchema']> {
    const { plugin } = ctx;
    if (!plugin.config.requests.enabled) return;
    return createRequestSchemaV1(ctx);
  }

  createRequestValidator(
    ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
  ): ReturnType<IApi['createRequestValidator']> {
    const { plugin } = ctx;
    if (!plugin.config.requests.enabled) return;
    return createRequestValidatorV1(ctx);
  }

  createResponseHandlers(ctx: ValidatorArgs): ReturnType<IApi['createResponseHandlers']> {
    return createResponseHandlersV1(ctx);
  }

  createResponseTransformer(ctx: ValidatorArgs): ReturnType<IApi['createResponseTransformer']> {
    return createResponseTransformerV1(ctx);
  }

  createResponseValidator(ctx: ValidatorArgs): ReturnType<IApi['createResponseValidator']> {
    return createResponseValidatorV1(ctx);
  }
}
