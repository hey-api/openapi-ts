import type ts from 'typescript';

import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV2, createResponseValidatorV2 } from './v2/api';

export type IApi = {
  createRequestValidator: (args: ValidatorArgs) => ts.ArrowFunction | undefined;
  createResponseValidator: (
    args: ValidatorArgs,
  ) => ts.ArrowFunction | undefined;
};

export class Api implements IApi {
  createRequestValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createRequestValidatorV2(args);
  }

  createResponseValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createResponseValidatorV2(args);
  }
}
