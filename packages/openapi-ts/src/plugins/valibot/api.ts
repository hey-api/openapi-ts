import type ts from "typescript";

import { compiler } from "../../compiler";
import type { TypeScriptFile } from "../../generate/files";
import type { IR } from "../../ir/types";
import type { PluginInstance } from "../shared/utils/instance";
import { identifiers, valibotId } from "./constants";
import type { ValibotPlugin } from "./types";

const createResponseValidator = ({
  file,
  operation,
  plugin,
}: {
  file: TypeScriptFile;
  operation: IR.OperationObject;
  plugin: PluginInstance<ValibotPlugin>;
}): ts.ArrowFunction | undefined => {
  const responses = plugin.getPlugin('valibot')?.config.responses;
  const identifierSchema = plugin.context.file({ id: valibotId })!.identifier({
    // TODO: refactor for better cross-plugin compatibility
    $ref: `#/valibot-response/${operation.id}`,
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
      id: valibotId,
    }),
    name: identifierSchema.name,
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
              compiler.identifier({ text: identifierSchema.name }),
              compiler.identifier({ text: dataParameterName }),
            ],
          }),
        }),
      }),
    ],
  });
}

export type Api = {
  createResponseValidator: (args: {
    file: TypeScriptFile;
    operation: IR.OperationObject;
    plugin: PluginInstance<ValibotPlugin>;
  }) => ts.ArrowFunction | undefined;
};

export const api: Api = {
  createResponseValidator,
};
