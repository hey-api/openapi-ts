import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import type { SwrPlugin } from '../types';

export const createUseSwr = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: SwrPlugin['Instance'];
  queryFn: string;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const symbolUseSwr = plugin.referenceSymbol({
    category: 'external',
    resource: 'swr',
  });
  const symbolUseQueryFn = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.useSwr,
      name: operation.id,
    }),
  });

  const awaitSdkExpression = tsc.awaitExpression({
    expression: tsc.callExpression({
      functionName: queryFn,
      parameters: [
        tsc.objectExpression({
          multiLine: true,
          obj: [
            // {
            //   spread: optionsParamName,
            // },
            // {
            //   spread: 'queryKey[0]',
            // },
            // {
            //   key: 'signal',
            //   shorthand: true,
            //   value: tsc.identifier({
            //     text: 'signal',
            //   }),
            // },
            {
              key: 'throwOnError',
              value: true,
            },
          ],
        }),
      ],
    }),
  });
  const statements: Array<ts.Statement> = [];
  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push(
      tsc.returnVariable({
        expression: awaitSdkExpression,
      }),
    );
  } else {
    statements.push(
      tsc.constVariable({
        destructure: true,
        expression: awaitSdkExpression,
        name: 'data',
      }),
      tsc.returnVariable({
        expression: 'data',
      }),
    );
  }

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolUseQueryFn.exported,
    expression: tsc.arrowFunction({
      parameters: [
        // {
        //   isRequired: isRequiredOptions,
        //   name: optionsParamName,
        //   type: typeData,
        // },
      ],
      statements: [
        tsc.returnStatement({
          expression: tsc.callExpression({
            functionName: symbolUseSwr.placeholder,
            parameters: [
              tsc.stringLiteral({
                text: operation.path,
              }),
              tsc.arrowFunction({
                async: true,
                statements,
              }),
            ],
          }),
        }),
      ],
    }),
    name: symbolUseQueryFn.placeholder,
  });
  plugin.setSymbolValue(symbolUseQueryFn, statement);
};
