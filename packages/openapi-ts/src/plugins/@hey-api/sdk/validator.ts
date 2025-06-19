import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { operationIrRef } from '../../shared/utils/ref';
import type { Plugin } from '../../types';
import { valibotId } from '../../valibot/constants';
import { nameTransformer } from '../../valibot/plugin';
import { zodId } from '../../zod/plugin';
import { sdkId } from './constants';
import type { Config } from './types';

const identifiers = {
  data: compiler.identifier({ text: 'data' }),
  parseAsync: compiler.identifier({ text: 'parseAsync' }),
  v: compiler.identifier({ text: 'v' }),
};

const valibotResponseValidator = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = plugin.context.file({ id: sdkId })!;

  const identifierSchema = plugin.context.file({ id: valibotId })!.identifier({
    $ref: operationIrRef({
      case: 'camelCase',
      config: plugin.context.config,
      id: operation.id,
      type: 'response',
    }),
    // TODO: refactor to not have to define nameTransformer
    nameTransformer,
    namespace: 'value',
  });

  if (!identifierSchema.name) {
    return;
  }

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: valibotId,
    }),
    name: identifierSchema.name,
  });

  file.import({
    alias: identifiers.v.text,
    module: 'valibot',
    name: '*',
  });

  return compiler.arrowFunction({
    async: true,
    parameters: [
      {
        name: 'data',
      },
    ],
    statements: [
      compiler.returnStatement({
        expression: compiler.awaitExpression({
          expression: compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: identifiers.v,
              name: identifiers.parseAsync,
            }),
            parameters: [
              compiler.identifier({ text: identifierSchema.name }),
              identifiers.data,
            ],
          }),
        }),
      }),
    ],
  });
};

const zodResponseValidator = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = plugin.context.file({ id: sdkId })!;

  const responses = plugin.getPlugin('zod')?.config.responses;
  const identifierSchema = plugin.context.file({ id: zodId })!.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/zod-response/${operation.id}`,
    // TODO: refactor to not have to define nameTransformer
    nameTransformer: typeof responses === 'object' ? responses.name : undefined,
    namespace: 'value',
  });

  if (!identifierSchema.name) {
    return;
  }

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: zodId,
    }),
    name: identifierSchema.name,
  });

  return compiler.arrowFunction({
    async: true,
    parameters: [
      {
        name: 'data',
      },
    ],
    statements: [
      compiler.returnStatement({
        expression: compiler.awaitExpression({
          expression: compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: compiler.identifier({ text: identifierSchema.name }),
              name: identifiers.parseAsync,
            }),
            parameters: [identifiers.data],
          }),
        }),
      }),
    ],
  });
};

export const createResponseValidator = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  switch (plugin.config.validator) {
    case 'valibot':
      return valibotResponseValidator({ operation, plugin });
    case 'zod':
      return zodResponseValidator({ operation, plugin });
    default:
      return;
  }
};
