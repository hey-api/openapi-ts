import type { Selector } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { Plugin } from '~/plugins';

import { irSchemaToAstV1 } from './v1/api';

type SelectorType =
  | 'ClientOptions'
  | 'data'
  | 'error'
  | 'errors'
  | 'ref'
  | 'response'
  | 'responses'
  | 'TypeID'
  | 'webhook-payload'
  | 'webhook-request'
  | 'Webhooks';

export type IApi = {
  schemaToType: (args: Parameters<typeof irSchemaToAstV1>[0]) => ts.TypeNode;
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `ClientOptions`: never
   *  - `data`: `operation.id` string
   *  - `error`: `operation.id` string
   *  - `errors`: `operation.id` string
   *  - `ref`: `$ref` JSON pointer
   *  - `response`: `operation.id` string
   *  - `responses`: `operation.id` string
   *  - `TypeID`: `type` name string
   *  - `webhook-payload`: `operation.id` string
   *  - `webhook-request`: `operation.id` string
   *  - `Webhooks`: never
   * @returns Selector array
   */
  selector: (type: SelectorType, value?: string) => Selector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/typescript'>) {}

  selector(...args: ReadonlyArray<string | undefined>): Selector {
    return [this.meta.name, ...(args as Selector)];
  }

  schemaToType(args: Parameters<typeof irSchemaToAstV1>[0]): ts.TypeNode {
    return irSchemaToAstV1(args);
  }
}
