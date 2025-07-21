import type ts from 'typescript';

import { compiler } from '../../compiler';
import type { GeneratedFile } from '../../generate/file';
import type { IR } from '../../ir/types';
import { identifiers, zodId } from './constants';
import type { ZodPlugin } from './types';

const createRequestValidator = ({
  file,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: ZodPlugin['Instance'];
}): ts.ArrowFunction | undefined => {
  const zodFile = plugin.context.file({ id: zodId })!;
  const name = zodFile.getName(plugin.api.getId({ operation, type: 'data' }));
  if (!name) return;

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: zodId,
    }),
    name,
  });

  const dataParameterName = 'data';

  return compiler.arrowFunction({
    async: true,
    parameters: [
      {
        name: dataParameterName,
      },
    ],
    statements: [
      compiler.returnStatement({
        expression: compiler.awaitExpression({
          expression: compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: compiler.identifier({ text: name }),
              name: identifiers.parseAsync,
            }),
            parameters: [compiler.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};

const createResponseValidator = ({
  file,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: ZodPlugin['Instance'];
}): ts.ArrowFunction | undefined => {
  const zodFile = plugin.context.file({ id: zodId })!;
  const name = zodFile.getName(
    plugin.api.getId({ operation, type: 'responses' }),
  );
  if (!name) return;

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: zodId,
    }),
    name,
  });

  const dataParameterName = 'data';

  return compiler.arrowFunction({
    async: true,
    parameters: [
      {
        name: dataParameterName,
      },
    ],
    statements: [
      compiler.returnStatement({
        expression: compiler.awaitExpression({
          expression: compiler.callExpression({
            functionName: compiler.propertyAccessExpression({
              expression: compiler.identifier({ text: name }),
              name: identifiers.parseAsync,
            }),
            parameters: [compiler.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};

type GetIdArgs =
  | {
      operation: IR.OperationObject;
      type: 'data' | 'responses' | 'type-infer-data' | 'type-infer-responses';
    }
  | {
      type: 'ref' | 'type-infer-ref';
      value: string;
    };

const getId = (args: GetIdArgs): string => {
  switch (args.type) {
    case 'data':
    case 'responses':
    case 'type-infer-data':
    case 'type-infer-responses':
      return `${args.operation.id}-${args.type}`;
    case 'ref':
    case 'type-infer-ref':
    default:
      return `${args.type}-${args.value}`;
  }
};

export type Api = {
  createRequestValidator: (args: {
    file: GeneratedFile;
    operation: IR.OperationObject;
    plugin: ZodPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
  createResponseValidator: (args: {
    file: GeneratedFile;
    operation: IR.OperationObject;
    plugin: ZodPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
  getId: (args: GetIdArgs) => string;
};

export const api: Api = {
  createRequestValidator,
  createResponseValidator,
  getId,
};
