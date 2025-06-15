import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { operationIrRef } from '../../shared/utils/ref';
import type { Plugin } from '../../types';
import { valibotId } from '../../valibot/constants';
import { zodId } from '../../zod/plugin';
import { sdkId } from './constants';
import type { Config } from './types';

const identifiers = {
  data: compiler.identifier({ text: 'data' }),
  parseAsync: compiler.identifier({ text: 'parseAsync' }),
  v: compiler.identifier({ text: 'v' }),
};

const valibotResponseValidator = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}) => {
  const file = context.file({ id: sdkId })!;

  const identifierSchema = context.file({ id: valibotId })!.identifier({
    $ref: operationIrRef({
      case: 'camelCase',
      config: context.config,
      id: operation.id,
      type: 'response',
    }),
    namespace: 'value',
  });

  if (!identifierSchema.name) {
    return;
  }

  file.import({
    module: file.relativePathToFile({
      context,
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
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}) => {
  const file = context.file({ id: sdkId })!;

  const identifierSchema = context.file({ id: zodId })!.identifier({
    $ref: operationIrRef({
      case: 'camelCase',
      config: context.config,
      id: operation.id,
      type: 'response',
    }),
    namespace: 'value',
  });

  if (!identifierSchema.name) {
    return;
  }

  file.import({
    module: file.relativePathToFile({
      context,
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
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  switch (plugin.config.validator) {
    case 'valibot':
      return valibotResponseValidator({ context, operation });
    case 'zod':
      return zodResponseValidator({ context, operation });
    default:
      return;
  }
};
