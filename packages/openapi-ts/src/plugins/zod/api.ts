import type ts from 'typescript';

import {
  createRequestValidatorMini,
  createResponseValidatorMini,
} from './mini/api';
import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV3, createResponseValidatorV3 } from './v3/api';
import { createRequestValidatorV4, createResponseValidatorV4 } from './v4/api';

export type IApi = {
  createRequestValidator: (args: ValidatorArgs) => ts.ArrowFunction | undefined;
  createResponseValidator: (
    args: ValidatorArgs,
  ) => ts.ArrowFunction | undefined;
};

export class Api implements IApi {
  createRequestValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    const { plugin } = args;
    switch (plugin.config.compatibilityVersion) {
      case 3:
        return createRequestValidatorV3(args);
      case 'mini':
        return createRequestValidatorMini(args);
      case 4:
      default:
        return createRequestValidatorV4(args);
    }
  }

  createResponseValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    const { plugin } = args;
    switch (plugin.config.compatibilityVersion) {
      case 3:
        return createResponseValidatorV3(args);
      case 'mini':
        return createResponseValidatorMini(args);
      case 4:
      default:
        return createResponseValidatorV4(args);
    }
  }
}
