import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import { handleMeta } from './meta';
import type { PiniaColadaPlugin } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';
import { getPublicTypeData } from './utils';

export const createMutationOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
}): void => {
  const symbolMutationOptionsType = plugin.referenceSymbol(
    plugin.api.selector('UseMutationOptions'),
  );

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  const { isNuxtClient, strippedTypeData } = getPublicTypeData({
    plugin,
    typeData,
  });
  // TODO: better types syntax
  const mutationType = isNuxtClient
    ? `${symbolMutationOptionsType.placeholder}<${typeResponse}, ${strippedTypeData}, ${typeError}>`
    : `${symbolMutationOptionsType.placeholder}<${typeResponse}, ${typeData}, ${typeError}>`;

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
      key: 'mutation',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [
          isNuxtClient
            ? {
                name: fnOptions,
                type: `Partial<${strippedTypeData}>`,
              }
            : { name: fnOptions },
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
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: false,
          name: 'options',
          type: `Partial<${strippedTypeData}>`,
        },
      ],
      returnType: mutationType,
      statements: [
        tsc.returnStatement({
          expression: tsc.objectExpression({
            obj: mutationOptionsObj,
          }),
        }),
      ],
    }),
    name: symbolMutationOptions.placeholder,
  });
  plugin.setSymbolValue(symbolMutationOptions, statement);
};
