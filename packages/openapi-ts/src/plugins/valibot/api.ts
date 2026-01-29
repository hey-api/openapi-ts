import type { $ } from '../../ts-dsl';
import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV1, createResponseValidatorV1 } from './v1/api';

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
    return createRequestValidatorV1(args);
  }

  createResponseValidator(
    args: ValidatorArgs,
  ): ReturnType<typeof $.func> | undefined {
    return createResponseValidatorV1(args);
  }
}
