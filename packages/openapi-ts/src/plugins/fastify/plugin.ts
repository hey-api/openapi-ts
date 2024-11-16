import { compiler, type Property } from '../../compiler';
import type { IRContext } from '../../ir/context';
import type {
  IROperationObject,
  IRPathItemObject,
  IRPathsObject,
} from '../../ir/ir';
import { irParametersToIrSchema } from '../../ir/schema';
import type { PluginHandler } from '../types';
import { componentsToType, schemaToType } from '../utils/types';
import type { Config } from './types';

const fastifyId = 'fastify';

const operationToRouteHandler = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
}): Property => {
  const file = context.file({ id: fastifyId })!;

  const properties: Array<Property> = [];

  if (operation.body) {
    properties.push({
      isRequired: operation.body.required,
      name: 'Body',
      type: schemaToType({
        options: { file },
        schema: operation.body.schema,
      }),
    });
  }

  if (operation.parameters) {
    if (operation.parameters.header) {
      const schema = irParametersToIrSchema({
        parameters: operation.parameters.header,
      });
      properties.push({
        isRequired: Boolean(schema.required),
        name: 'Headers',
        type: schemaToType({
          options: { file },
          schema,
        }),
      });
    }

    if (operation.parameters.path) {
      const schema = irParametersToIrSchema({
        parameters: operation.parameters.path,
      });
      properties.push({
        isRequired: Boolean(schema.required),
        name: 'Params',
        type: schemaToType({
          options: { file },
          schema,
        }),
      });
    }

    if (operation.parameters.query) {
      const schema = irParametersToIrSchema({
        parameters: operation.parameters.query,
      });
      properties.push({
        isRequired: Boolean(schema.required),
        name: 'Querystring',
        type: schemaToType({
          options: { file },
          schema,
        }),
      });
    }
  }

  if (operation.responses) {
    const responseProperties: Array<Property> = [];

    for (const code in operation.responses) {
      if (code === 'default') {
        continue;
      }

      const response = operation.responses[code]!;
      responseProperties.push({
        name: code,
        type: schemaToType({
          options: { file },
          schema: response.schema,
        }),
      });
    }

    properties.push({
      name: 'Reply',
      type: compiler.typeInterfaceNode({
        properties: responseProperties,
        useLegacyResolution: false,
      }),
    });
  }

  const routeHandler: Property = {
    name: operation.id,
    type: compiler.typeNode('RouteHandler', [
      compiler.typeInterfaceNode({
        properties,
        useLegacyResolution: false,
      }),
    ]),
  };
  return routeHandler;
};

const processRouteHandlers = ({ context }: { context: IRContext }) => {
  const file = context.file({ id: fastifyId })!;

  const routeHandlers: Array<Property> = [];

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const routeHandler = operationToRouteHandler({ context, operation });
      routeHandlers.push(routeHandler);
    }
  }

  const identifier = file.identifier({
    $ref: 'RouteHandlers',
    create: true,
    namespace: 'type',
  });
  if (identifier.name) {
    file.add(
      compiler.typeAliasDeclaration({
        exportType: true,
        name: identifier.name,
        type: compiler.typeInterfaceNode({
          properties: routeHandlers,
          useLegacyResolution: false,
        }),
      }),
    );
  }
};

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    id: fastifyId,
    path: plugin.output,
  });
  file.import({
    asType: true,
    module: 'fastify',
    name: 'RouteHandler',
  });
  componentsToType({
    context,
    options: {
      file,
    },
  });
  processRouteHandlers({ context });
};
