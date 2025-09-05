import type ts from 'typescript';

import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { createOperationComment } from '../../shared/utils/operation';
import { handleMeta } from './meta';
import type { PluginState } from './state';
import type { PiniaColadaPlugin } from './types';
import {
  getPublicTypeData,
  useTypeData,
  useTypeError,
  useTypeResponse,
} from './utils';

const mutationOptionsType = 'UseMutationOptions';

export const createMutationOptions = ({
  file,
  operation,
  plugin,
  queryFn,
  state,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
  queryFn: string;
  state: PluginState;
}): void => {
  if (
    !plugin.config.mutationOptions.enabled ||
    !plugin.hooks.operation.isMutation(operation)
  ) {
    return;
  }

  if (!state.hasMutations) {
    state.hasMutations = true;

    file.import({
      asType: true,
      module: plugin.name,
      name: mutationOptionsType,
    });
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ file, operation, plugin });
  const typeError = useTypeError({ file, operation, plugin });
  const typeResponse = useTypeResponse({ file, operation, plugin });
  const { isNuxtClient, strippedTypeData } = getPublicTypeData({
    plugin,
    typeData,
  });

  const identifierMutationOptions = file.identifier({
    $ref: `#/pinia-colada-mutation-options/${operation.id}`,
    case: plugin.config.mutationOptions.case,
    create: true,
    nameTransformer: plugin.config.mutationOptions.name,
    namespace: 'value',
  });

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

  if (plugin.getPlugin('@hey-api/sdk')?.config.responseStyle === 'data') {
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

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createOperationComment({ operation })
      : undefined,
    exportConst: true,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: false,
          name: 'options',
          type: `Partial<${strippedTypeData}>`,
        },
      ],
      returnType: isNuxtClient
        ? `${mutationOptionsType}<${typeResponse}, ${strippedTypeData}, ${typeError.name}>`
        : `${mutationOptionsType}<${typeResponse}, ${typeData}, ${typeError.name}>`,
      statements: [
        tsc.returnStatement({
          expression: tsc.objectExpression({
            obj: mutationOptionsObj,
          }),
        }),
      ],
    }),
    name: identifierMutationOptions.name || '',
  });

  file.add(statement);
};
