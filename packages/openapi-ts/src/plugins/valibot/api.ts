import type ts from 'typescript';

import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV1, createResponseValidatorV1 } from './v1/api';

export type IApi = {
  createRequestValidator: (args: ValidatorArgs) => ts.ArrowFunction | undefined;
  createResponseValidator: (
    args: ValidatorArgs,
  ) => ts.ArrowFunction | undefined;
};

export class Api implements IApi {
  createRequestValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createRequestValidatorV1(args);
  }

  createResponseValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createResponseValidatorV1(args);
  }
}
