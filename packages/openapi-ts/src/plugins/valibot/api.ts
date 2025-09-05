import type { ICodegenFile } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '../../ir/types';
import { tsc } from '../../tsc';
import { identifiers } from './constants';
import type { ValibotPlugin } from './types';

export type Api = {
  createRequestValidator: (args: {
    file: ICodegenFile;
    operation: IR.OperationObject;
    plugin: ValibotPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
  createResponseValidator: (args: {
    file: ICodegenFile;
    operation: IR.OperationObject;
    plugin: ValibotPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `data`: `operation.id` string
   *  - `import`: headless symbols representing module imports
   *  - `ref`: `$ref` JSON pointer
   *  - `responses`: `operation.id` string
   *  - `webhook-request`: `operation.id` string
   * @returns Selector array
   */
  getSelector: (
    type: 'data' | 'import' | 'ref' | 'responses' | 'webhook-request',
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

  const selector = plugin.api.getSelector('import', 'valibot');
  const vSymbol = file.ensureSymbol({ name: 'v', selector });
  file.addImport({ from: 'valibot', namespaceImport: vSymbol.placeholder });

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
              expression: vSymbol.placeholder,
              name: identifiers.async.parseAsync,
            }),
            parameters: [
              tsc.identifier({ text: symbol.placeholder }),
              tsc.identifier({ text: dataParameterName }),
            ],
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

  const selector = plugin.api.getSelector('import', 'valibot');
  const vSymbol = file.ensureSymbol({ name: 'v', selector });
  file.addImport({ from: 'valibot', namespaceImport: vSymbol.placeholder });

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
              expression: vSymbol.placeholder,
              name: identifiers.async.parseAsync,
            }),
            parameters: [
              tsc.identifier({ text: symbol.placeholder }),
              tsc.identifier({ text: dataParameterName }),
            ],
          }),
        }),
      }),
    ],
  });
};

const getSelector: Api['getSelector'] = (...args) => ['valibot', ...args];

export const api: Api = {
  createRequestValidator,
  createResponseValidator,
  getSelector,
};
