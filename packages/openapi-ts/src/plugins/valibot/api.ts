import type { TsDsl } from '~/ts-dsl';

import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV1, createResponseValidatorV1 } from './v1/api';

export type IApi = {
  createRequestValidator: (args: ValidatorArgs) => TsDsl | undefined;
  createResponseValidator: (args: ValidatorArgs) => TsDsl | undefined;
};

export class Api implements IApi {
  createRequestValidator(args: ValidatorArgs): TsDsl | undefined {
    return createRequestValidatorV1(args);
  }

  createResponseValidator(args: ValidatorArgs): TsDsl | undefined {
    return createResponseValidatorV1(args);
  }
}
