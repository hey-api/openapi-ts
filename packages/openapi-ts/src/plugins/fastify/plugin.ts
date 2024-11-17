import { compiler, type Property } from '../../compiler';
import type { IRContext } from '../../ir/context';
import type {
  IROperationObject,
  IRPathItemObject,
  IRPathsObject,
} from '../../ir/ir';
import { hasParameterGroupObjectRequired } from '../../ir/parameter';
import { operationDataRef } from '../@hey-api/services/plugin';
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

  const identifierData = context.file({ id: 'types' })!.identifier({
    $ref: operationDataRef({ id: operation.id }),
    namespace: 'type',
  });

  if (identifierData.name) {
    if (operation.body) {
      file.import({
        asType: true,
        module: file.relativePathToFile({ context, id: 'types' }),
        name: identifierData.name,
      });
      properties.push({
        isRequired: operation.body.required,
        name: 'Body',
        type: `${identifierData.name}['body']`,
      });
    }

    if (operation.parameters) {
      if (operation.parameters.header) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierData.name,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.header,
          ),
          name: 'Headers',
          type: `${identifierData.name}['headers']`,
        });
      }

      if (operation.parameters.path) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierData.name,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.path,
          ),
          name: 'Params',
          type: `${identifierData.name}['path']`,
        });
      }

      if (operation.parameters.query) {
        file.import({
          asType: true,
          module: file.relativePathToFile({ context, id: 'types' }),
          name: identifierData.name,
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.query,
          ),
          name: 'Querystring',
          type: `${identifierData.name}['query']`,
        });
      }
    }
  }

  if (operation.responses) {
    const responseProperties: Array<Property> = [];

    for (const code in operation.responses) {
      if (code === 'default') {
        continue;
      }

      const response = operation.responses[code]!;
      // TODO: numeric literal for numbers
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
