import type {
  ICodegenFile,
  ICodegenSymbolSelector,
} from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '../../ir/types';
import { tsc } from '../../tsc';
import type { Plugin } from '../types';
import { identifiers } from './constants';
import type { ValibotPlugin } from './types';

type SelectorType = 'data' | 'import' | 'ref' | 'responses' | 'webhook-request';

type ValidatorArgs = {
  file: ICodegenFile;
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
};

export type IApi = {
  createRequestValidator: (args: ValidatorArgs) => ts.ArrowFunction | undefined;
  createResponseValidator: (
    args: ValidatorArgs,
  ) => ts.ArrowFunction | undefined;
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
  getSelector: (type: SelectorType, value?: string) => ICodegenSymbolSelector;
};

export class Api implements IApi {
  constructor(public meta: Plugin.Name<'valibot'>) {}

  createRequestValidator({
    file,
    operation,
    plugin,
  }: ValidatorArgs): ts.ArrowFunction | undefined {
    const symbol = plugin.gen.selectSymbolFirst(
      plugin.api.getSelector('data', operation.id),
    );
    if (!symbol) return;

    file.addImport({
      from: symbol.file,
      names: [symbol.placeholder],
    });

    const vSymbol = file.ensureSymbol({
      name: 'v',
      selector: plugin.api.getSelector('import', 'valibot'),
    });
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
  }

  createResponseValidator({
    file,
    operation,
    plugin,
  }: ValidatorArgs): ts.ArrowFunction | undefined {
    const symbol = plugin.gen.selectSymbolFirst(
      plugin.api.getSelector('responses', operation.id),
    );
    if (!symbol) return;

    file.addImport({
      from: symbol.file,
      names: [symbol.placeholder],
    });

    const vSymbol = file.ensureSymbol({
      name: 'v',
      selector: plugin.api.getSelector('import', 'valibot'),
    });
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
  }

  getSelector(
    ...args: ReadonlyArray<string | undefined>
  ): ICodegenSymbolSelector {
    return [this.meta.name, ...(args as ICodegenSymbolSelector)];
  }
}
