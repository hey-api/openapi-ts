import type { Symbol } from '@hey-api/codegen-core';
import type { RequestSchemaContext } from '@hey-api/shared';

import type { $ } from '../../ts-dsl';
import type { Pipe } from './shared/pipes';
import type { ValidatorArgs } from './shared/types';
import type { ValibotPlugin } from './types';
import {
  createRequestSchemaV1,
  createRequestValidatorV1,
  createResponseValidatorV1,
} from './v1/api';

type ArrowFunc = Extract<ReturnType<typeof $.func>, { '~mode': 'arrow' }>;

export type IApi = {
  createRequestSchema: (
    ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
  ) => Symbol | Pipe | undefined;
  createRequestValidator: (
    args: RequestSchemaContext<ValibotPlugin['Instance']>,
  ) => ArrowFunc | undefined;
  createResponseValidator: (args: ValidatorArgs) => ArrowFunc | undefined;
};

export class Api implements IApi {
  createRequestSchema(
    ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
  ): Symbol | Pipe | undefined {
    const { plugin } = ctx;
    if (!plugin.config.requests.enabled) return;
    return createRequestSchemaV1(ctx);
  }

  createRequestValidator(
    args: RequestSchemaContext<ValibotPlugin['Instance']>,
  ): ArrowFunc | undefined {
    const { plugin } = args;
    if (!plugin.config.requests.enabled) return;
    return createRequestValidatorV1(args);
  }

  createResponseValidator(args: ValidatorArgs): ArrowFunc | undefined {
    return createResponseValidatorV1(args);
  }
}
