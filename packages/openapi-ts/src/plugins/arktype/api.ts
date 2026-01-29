import type { $ } from '../../ts-dsl';
import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV2, createResponseValidatorV2 } from './v2/api';

export type IApi = {
  createRequestValidator: (
    args: ValidatorArgs,
  ) => ReturnType<typeof $.func> | undefined;
  createResponseValidator: (
    args: ValidatorArgs,
  ) => ReturnType<typeof $.func> | undefined;
};

export class Api implements IApi {
  createRequestValidator(
    args: ValidatorArgs,
  ): ReturnType<typeof $.func> | undefined {
    return createRequestValidatorV2(args);
  }

  createResponseValidator(
    args: ValidatorArgs,
  ): ReturnType<typeof $.func> | undefined {
    return createResponseValidatorV2(args);
  }
}
