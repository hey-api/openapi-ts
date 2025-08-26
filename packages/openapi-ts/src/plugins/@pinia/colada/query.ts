import type ts from 'typescript';

import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import { handleMeta } from './meta';
import type { PluginState } from './state';
import type { PiniaColadaPlugin } from './types';
import { useTypeData } from './utils';

export const createQueryOptions = ({
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
    !plugin.config.queryOptions.enabled ||
    !plugin.hooks.operation.isQuery(operation)
  ) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!state.hasQueries) {
    state.hasQueries = true;
  }

  state.hasUsedQueryFn = true;

  const typeData = useTypeData({ file, operation, plugin });

  const identifierQueryOptions = file.identifier({
    $ref: `#/pinia-colada-query-options/${operation.id}`,
    case: plugin.config.queryOptions.case,
    create: true,
    nameTransformer: plugin.config.queryOptions.name,
    namespace: 'value',
  });

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
              key: 'signal',
              value: tsc.identifier({
                text: 'context.signal',
              }),
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

  const queryOptionsObj: Array<{ key: string; value: ts.Expression }> = [
    {
      key: 'key',
      value: tsc.arrayLiteralExpression({
        elements: [
          tsc.stringLiteral({ text: operation.id || '' }),
          tsc.identifier({ text: 'options?.path' }),
        ],
      }),
    },
    {
      key: 'query',
      value: tsc.arrowFunction({
        async: true,
        multiLine: true,
        parameters: [
          {
            name: 'context',
            type: tsc.typeReferenceNode({
              typeName: '{ signal: AbortSignal }',
            }),
          },
        ],
        statements,
      }),
    },
  ];

  const meta = handleMeta(plugin, operation, 'queryOptions');

  if (meta) {
    queryOptionsObj.push({
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
          isRequired: isRequiredOptions,
          name: 'options',
          type: typeData,
        },
      ],
      statements: [
        tsc.returnStatement({
          expression: tsc.objectExpression({
            obj: queryOptionsObj,
          }),
        }),
      ],
    }),
    name: identifierQueryOptions.name || '',
  });

  file.add(statement);
};
