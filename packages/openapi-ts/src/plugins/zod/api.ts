import type { ICodegenFile } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '../../ir/types';
import { tsc } from '../../tsc';
import { identifiers } from './constants';
import type { ZodPlugin } from './types';

export type Api = {
  createRequestValidator: (args: {
    file: ICodegenFile;
    operation: IR.OperationObject;
    plugin: ZodPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
  createResponseValidator: (args: {
    file: ICodegenFile;
    operation: IR.OperationObject;
    plugin: ZodPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `data`: `operation.id` string
   *  - `import`: headless symbols representing module imports
   *  - `ref`: `$ref` JSON pointer
   *  - `responses`: `operation.id` string
   *  - `type-infer-data`: `operation.id` string
   *  - `type-infer-ref`: `$ref` JSON pointer
   *  - `type-infer-responses`: `operation.id` string
   *  - `type-infer-webhook-request`: `operation.id` string
   *  - `webhook-request`: `operation.id` string
   * @returns Selector array
   */
  getSelector: (
    type:
      | 'data'
      | 'import'
      | 'ref'
      | 'responses'
      | 'type-infer-data'
      | 'type-infer-ref'
      | 'type-infer-responses'
      | 'type-infer-webhook-request'
      | 'webhook-request',
    value: string,
  ) => ReadonlyArray<string>;
};

const createRequestValidator: Api['createRequestValidator'] = ({
  file,
  operation,
  plugin,
}) => {
  const symbol = plugin.gen.selectSymbolFirst(
    plugin.api.getSelector('data', operation.id),
  );
  if (!symbol) return;

  file.addImport({
    from: plugin.gen.getFileBySymbol(symbol),
    names: [symbol.placeholder],
  });

  const dataParameterName = 'data';

  return tsc.arrowFunction({
    async: true,
    parameters: [
      {
        name: dataParameterName,
      },
    ],
    statements: [
      tsc.returnStatement({
        expression: tsc.awaitExpression({
          expression: tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: symbol.placeholder,
              name: identifiers.parseAsync,
            }),
            parameters: [tsc.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};

const createResponseValidator: Api['createResponseValidator'] = ({
  file,
  operation,
  plugin,
}) => {
  const symbol = plugin.gen.selectSymbolFirst(
    plugin.api.getSelector('responses', operation.id),
  );
  if (!symbol) return;

  file.addImport({
    from: plugin.gen.getFileBySymbol(symbol),
    names: [symbol.placeholder],
  });

  const dataParameterName = 'data';

  return tsc.arrowFunction({
    async: true,
    parameters: [
      {
        name: dataParameterName,
      },
    ],
    statements: [
      tsc.returnStatement({
        expression: tsc.awaitExpression({
          expression: tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: symbol.placeholder,
              name: identifiers.parseAsync,
            }),
            parameters: [tsc.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};

const getSelector: Api['getSelector'] = (...args) => ['zod', ...args];

export const api: Api = {
  createRequestValidator,
  createResponseValidator,
  getSelector,
};
