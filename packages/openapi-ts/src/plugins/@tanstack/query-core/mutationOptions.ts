import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import { createOperationComment } from '../../shared/utils/operation';
import { handleMeta } from './meta';
import type { PluginInstance } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

export const createMutationOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
}): void => {
  const symbolMutationOptionsType = plugin.referenceSymbol(
    plugin.api.getSelector('MutationOptions'),
  );

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  // TODO: better types syntax
  const mutationType = `${symbolMutationOptionsType.placeholder}<${typeResponse}, ${typeError}, ${typeData}>`;

  const fnOptions = 'fnOptions';

  const awaitSdkExpression = tsc.awaitExpression({
    expression: tsc.callExpression({
      functionName: queryFn,
      parameters: [
        tsc.objectExpression({
          multiLine: true,
          obj: [
            {
              spread: 'options',
            },
            {
              spread: fnOptions,
            },
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

  const mutationOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'mutationFn',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [
          {
            name: fnOptions,
          },
        ],
        statements,
      }),
    },
  ];

  const meta = handleMeta(plugin, operation, 'mutationOptions');

  if (meta) {
    mutationOptionsObj.push({
      key: 'meta',
      value: meta,
    });
  }

  const mutationOptionsFn = 'mutationOptions';
  const expression = tsc.arrowFunction({
    parameters: [
      {
        isRequired: false,
        name: 'options',
        type: `Partial<${typeData}>`,
      },
    ],
    returnType: mutationType,
    statements: [
      tsc.constVariable({
        expression: tsc.objectExpression({
          obj: mutationOptionsObj,
        }),
        name: mutationOptionsFn,
        typeName: mutationType,
      }),
      tsc.returnVariable({
        expression: mutationOptionsFn,
      }),
    ],
  });
  const symbolMutationOptions = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.mutationOptions,
      name: operation.id,
    }),
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: symbolMutationOptions.exported,
    expression,
    name: symbolMutationOptions.placeholder,
  });
  plugin.setSymbolValue(symbolMutationOptions, statement);
};
