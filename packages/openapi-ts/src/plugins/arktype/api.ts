import type { TsDsl } from '~/ts-dsl';

import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV2, createResponseValidatorV2 } from './v2/api';

export type IApi = {
  createRequestValidator: (args: ValidatorArgs) => TsDsl | undefined;
  createResponseValidator: (args: ValidatorArgs) => TsDsl | undefined;
};

export class Api implements IApi {
  createRequestValidator(args: ValidatorArgs): TsDsl | undefined {
    return createRequestValidatorV2(args);
  }

  createResponseValidator(args: ValidatorArgs): TsDsl | undefined {
    return createResponseValidatorV2(args);
  }
}
