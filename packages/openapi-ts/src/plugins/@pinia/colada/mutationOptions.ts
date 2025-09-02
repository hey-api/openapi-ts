import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import { tsc } from '../../../tsc';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { handleMeta } from './meta';
import type { PluginState } from './state';
import type { PiniaColadaPlugin } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

export const createMutationOptions = ({
  operation,
  plugin,
  queryFn,
  state,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
  state: PluginState;
}): void => {
  const f = plugin.gen.ensureFile(plugin.output);

  if (!state.hasMutations) {
    state.hasMutations = true;
  }

  const symbolMutationOptionsType = f.ensureSymbol({
    name: 'UseMutationOptions',
    selector: plugin.api.getSelector('UseMutationOptions'),
  });
  f.addImport({
    from: plugin.name,
    typeNames: [symbolMutationOptionsType.name],
  });

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  // TODO: better types syntax
  const mutationType = `${symbolMutationOptionsType.placeholder}<${typeResponse}, ${typeData}, ${typeError}>`;

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

  const isRequiredOptionsForMutation = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  const symbolMutationOptions = f.addSymbol({
    name: buildName({
      config: plugin.config.mutationOptions,
      name: operation.id,
    }),
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptionsForMutation,
          name: 'options',
          type: typeData,
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
  symbolMutationOptions.update({ value: statement });
};
