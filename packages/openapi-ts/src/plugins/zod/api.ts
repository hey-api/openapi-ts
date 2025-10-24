import type { Selector } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { Plugin } from '~/plugins';

import {
  createRequestValidatorMini,
  createResponseValidatorMini,
} from './mini/api';
import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV3, createResponseValidatorV3 } from './v3/api';
import { createRequestValidatorV4, createResponseValidatorV4 } from './v4/api';

type SelectorType =
  | 'data'
  | 'external'
  | 'ref'
  | 'responses'
  | 'type-infer-data'
  | 'type-infer-ref'
  | 'type-infer-responses'
  | 'type-infer-webhook-request'
  | 'webhook-request';

export type IApi = {
  createRequestValidator: (args: ValidatorArgs) => ts.ArrowFunction | undefined;
  createResponseValidator: (
    args: ValidatorArgs,
  ) => ts.ArrowFunction | undefined;
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `data`: `operation.id` string
   *  - `external`: external modules
   *  - `ref`: `$ref` JSON pointer
   *  - `responses`: `operation.id` string
   *  - `type-infer-data`: `operation.id` string
   *  - `type-infer-ref`: `$ref` JSON pointer
   *  - `type-infer-responses`: `operation.id` string
   *  - `type-infer-webhook-request`: `operation.id` string
   *  - `webhook-request`: `operation.id` string
   * @returns Selector array
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'zod'>) {}

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

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}
