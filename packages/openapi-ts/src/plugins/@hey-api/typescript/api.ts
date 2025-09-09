import type { ICodegenSymbolSelector } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { Plugin } from '../../types';
import { schemaToType } from './plugin';

type SelectorType =
  | 'ClientOptions'
  | 'data'
  | 'error'
  | 'errors'
  | 'ref'
  | 'response'
  | 'responses'
  | 'webhook-payload'
  | 'webhook-request'
  | 'Webhooks';

type SchemaToTypeArgs = Omit<Parameters<typeof schemaToType>[0], 'onRef'> &
  Pick<Partial<Parameters<typeof schemaToType>[0]>, 'onRef'>;

export type IApi = {
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
   *  - `webhook-payload`: `operation.id` string
   *  - `webhook-request`: `operation.id` string
   *  - `Webhooks`: never
   * @returns Selector array
   */
  getSelector: (type: SelectorType, value?: string) => ICodegenSymbolSelector;
  schemaToType: (args: SchemaToTypeArgs) => ts.TypeNode;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'@hey-api/typescript'>) {}

  getSelector(
    ...args: ReadonlyArray<string | undefined>
  ): ICodegenSymbolSelector {
    return [this.meta.name, ...(args as ICodegenSymbolSelector)];
  }

  schemaToType(args: SchemaToTypeArgs): ts.TypeNode {
    return schemaToType({ onRef: undefined, ...args });
  }
}
