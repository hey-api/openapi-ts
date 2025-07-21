import type ts from 'typescript';

import { compiler } from '../../compiler';
import type { GeneratedFile } from '../../generate/file';
import type { IR } from '../../ir/types';
import { identifiers, valibotId } from './constants';
import type { ValibotPlugin } from './types';

const createRequestValidator = ({
  file,
  operation,
  plugin,
}: {
  file: GeneratedFile;
  operation: IR.OperationObject;
  plugin: ValibotPlugin['Instance'];
}): ts.ArrowFunction | undefined => {
  const { requests } = plugin.config;
  const schemaIdentifier = plugin.context.file({ id: valibotId })!.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/valibot-response/${operation.id}`,
    // TODO: refactor to not have to define nameTransformer
    nameTransformer: typeof requests === 'object' ? requests.name : undefined,
    namespace: 'value',
  });

  if (!schemaIdentifier.name) {
    return;
  }

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: valibotId,
    }),
    name: schemaIdentifier.name,
  });

  file.import({
    alias: identifiers.v.text,
    module: 'valibot',
    name: '*',
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
              expression: identifiers.v,
              name: identifiers.async.parseAsync,
            }),
            parameters: [
              compiler.identifier({ text: schemaIdentifier.name }),
              compiler.identifier({ text: dataParameterName }),
            ],
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
  plugin: ValibotPlugin['Instance'];
}): ts.ArrowFunction | undefined => {
  const { responses } = plugin.config;
  const schemaIdentifier = plugin.context.file({ id: valibotId })!.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/valibot-response/${operation.id}`,
    // TODO: refactor to not have to define nameTransformer
    nameTransformer: typeof responses === 'object' ? responses.name : undefined,
    namespace: 'value',
  });

  if (!schemaIdentifier.name) {
    return;
  }

  file.import({
    module: file.relativePathToFile({
      context: plugin.context,
      id: valibotId,
    }),
    name: schemaIdentifier.name,
  });

  file.import({
    alias: identifiers.v.text,
    module: 'valibot',
    name: '*',
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
              expression: identifiers.v,
              name: identifiers.async.parseAsync,
            }),
            parameters: [
              compiler.identifier({ text: schemaIdentifier.name }),
              compiler.identifier({ text: dataParameterName }),
            ],
          }),
        }),
      }),
    ],
  });
};

export type Api = {
  createRequestValidator: (args: {
    file: GeneratedFile;
    operation: IR.OperationObject;
    plugin: ValibotPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
  createResponseValidator: (args: {
    file: GeneratedFile;
    operation: IR.OperationObject;
    plugin: ValibotPlugin['Instance'];
  }) => ts.ArrowFunction | undefined;
};

export const api: Api = {
  createRequestValidator,
  createResponseValidator,
};
