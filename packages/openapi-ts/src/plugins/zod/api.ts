import type { Symbol } from '@hey-api/codegen-core';
import type { RequestSchemaContext } from '@hey-api/shared';

import type { $ } from '../../ts-dsl';
import {
  createRequestSchemaMini,
  createRequestValidatorMini,
  createResponseTransformerMini,
  createResponseValidatorMini,
} from './mini/api';
import type { Chain } from './shared/chain';
import type { ValidatorArgs } from './shared/types';
import type { ZodPlugin } from './types';
import {
  createRequestSchemaV3,
  createRequestValidatorV3,
  createResponseTransformerV3,
  createResponseValidatorV3,
} from './v3/api';
import {
  createRequestSchemaV4,
  createRequestValidatorV4,
  createResponseTransformerV4,
  createResponseValidatorV4,
} from './v4/api';

type ArrowFunc = Extract<ReturnType<typeof $.func>, { '~mode': 'arrow' }>;

export type IApi = {
  createRequestSchema: (
    ctx: RequestSchemaContext<ZodPlugin['Instance']>,
  ) => Symbol | Chain | undefined;
  createRequestValidator: (
    ctx: RequestSchemaContext<ZodPlugin['Instance']>,
  ) => ArrowFunc | undefined;
  createResponseTransformer: (ctx: ValidatorArgs) => ArrowFunc | undefined;
  createResponseValidator: (ctx: ValidatorArgs) => ArrowFunc | undefined;
};

export class Api implements IApi {
  createRequestSchema(
    ctx: RequestSchemaContext<ZodPlugin['Instance']>,
  ): Symbol | Chain | undefined {
    const { plugin } = ctx;
    if (!plugin.config.requests.enabled) return;
    switch (plugin.config.compatibilityVersion) {
      case 3:
        return createRequestSchemaV3(ctx);
      case 'mini':
        return createRequestSchemaMini(ctx);
      case 4:
      default:
        return createRequestSchemaV4(ctx);
    }
  }

  createRequestValidator(ctx: RequestSchemaContext<ZodPlugin['Instance']>): ArrowFunc | undefined {
    const { plugin } = ctx;
    if (!plugin.config.requests.enabled) return;
    switch (plugin.config.compatibilityVersion) {
      case 3:
        return createRequestValidatorV3(ctx);
      case 'mini':
        return createRequestValidatorMini(ctx);
      case 4:
      default:
        return createRequestValidatorV4(ctx);
    }
  }

  createResponseTransformer(ctx: ValidatorArgs): ArrowFunc | undefined {
    const { plugin } = ctx;
    switch (plugin.config.compatibilityVersion) {
      case 3:
        return createResponseTransformerV3(ctx);
      case 'mini':
        return createResponseTransformerMini(ctx);
      case 4:
      default:
        return createResponseTransformerV4(ctx);
    }
  }

  createResponseValidator(ctx: ValidatorArgs): ArrowFunc | undefined {
    const { plugin } = ctx;
    switch (plugin.config.compatibilityVersion) {
      case 3:
        return createResponseValidatorV3(ctx);
      case 'mini':
        return createResponseValidatorMini(ctx);
      case 4:
      default:
        return createResponseValidatorV4(ctx);
    }
  }
}
