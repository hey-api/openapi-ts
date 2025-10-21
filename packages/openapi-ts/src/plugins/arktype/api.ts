import type { Selector } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { Plugin } from '../types';
import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV2, createResponseValidatorV2 } from './v2/api';

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
  getSelector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'arktype'>) {}

  createRequestValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createRequestValidatorV2(args);
  }

  createResponseValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createResponseValidatorV2(args);
  }

  getSelector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}
