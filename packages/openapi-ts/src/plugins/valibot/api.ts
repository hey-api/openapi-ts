import type { Selector } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { Plugin } from '~/plugins';

import type { ValidatorArgs } from './shared/types';
import { createRequestValidatorV1, createResponseValidatorV1 } from './v1/api';

type SelectorType =
  | 'data'
  | 'external'
  | 'ref'
  | 'responses'
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
   *  - `webhook-request`: `operation.id` string
   * @returns Selector array
   * @deprecated
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'valibot'>) {}

  createRequestValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createRequestValidatorV1(args);
  }

  createResponseValidator(args: ValidatorArgs): ts.ArrowFunction | undefined {
    return createResponseValidatorV1(args);
  }

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }
}
