import type ts from 'typescript';

import { TypeScriptRenderer } from '../../generate/renderer';
import { operationResponsesMap } from '../../ir/operation';
import { hasParameterGroupObjectRequired } from '../../ir/parameter';
import type { IR } from '../../ir/types';
import { type Property, tsc } from '../../tsc';
import type { FastifyPlugin } from './types';

const operationToRouteHandler = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: FastifyPlugin['Instance'];
}): Property | undefined => {
  const f = plugin.gen.ensureFile(plugin.output);

  const properties: Array<Property> = [];

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolDataType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('data', operation.id),
  );
  if (symbolDataType) {
    if (operation.body) {
      f.addImport({
        from: symbolDataType.file,
        typeNames: [symbolDataType.placeholder],
      });
      properties.push({
        isRequired: operation.body.required,
        name: 'Body',
        type: `${symbolDataType.placeholder}['body']`,
      });
    }

    if (operation.parameters) {
      if (operation.parameters.header) {
        f.addImport({
          from: symbolDataType.file,
          typeNames: [symbolDataType.placeholder],
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.header,
          ),
          name: 'Headers',
          type: `${symbolDataType.placeholder}['headers']`,
        });
      }

      if (operation.parameters.path) {
        f.addImport({
          from: symbolDataType.file,
          typeNames: [symbolDataType.placeholder],
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.path,
          ),
          name: 'Params',
          type: `${symbolDataType.placeholder}['path']`,
        });
      }

      if (operation.parameters.query) {
        f.addImport({
          from: symbolDataType.file,
          typeNames: [symbolDataType.placeholder],
        });
        properties.push({
          isRequired: hasParameterGroupObjectRequired(
            operation.parameters.query,
          ),
          name: 'Querystring',
          type: `${symbolDataType.placeholder}['query']`,
        });
      }
    }
  }

  const { errors, responses } = operationResponsesMap(operation);

  let errorsTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const symbolErrorType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('errors', operation.id),
  );
  if (symbolErrorType && errors && errors.properties) {
    const keys = Object.keys(errors.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        f.addImport({
          from: symbolErrorType.file,
          typeNames: [symbolErrorType.placeholder],
        });
        errorsTypeReference = tsc.typeReferenceNode({
          typeName: symbolErrorType.placeholder,
        });
      } else if (keys.length > 1) {
        f.addImport({
          from: symbolErrorType.file,
          typeNames: [symbolErrorType.placeholder],
        });
        const errorsType = tsc.typeReferenceNode({
          typeName: symbolErrorType.placeholder,
        });
        const defaultType = tsc.literalTypeNode({
          literal: tsc.stringLiteral({ text: 'default' }),
        });
        errorsTypeReference = tsc.typeReferenceNode({
          typeArguments: [errorsType, defaultType],
          typeName: 'Omit',
        });
      }
    }
  }

  let responsesTypeReference: ts.TypeReferenceNode | undefined = undefined;
  const symbolResponseType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('responses', operation.id),
  );
  if (symbolResponseType && responses && responses.properties) {
    const keys = Object.keys(responses.properties);
    if (keys.length) {
      const hasDefaultResponse = keys.includes('default');
      if (!hasDefaultResponse) {
        f.addImport({
          from: symbolResponseType.file,
          typeNames: [symbolResponseType.placeholder],
        });
        responsesTypeReference = tsc.typeReferenceNode({
          typeName: symbolResponseType.placeholder,
        });
      } else if (keys.length > 1) {
        f.addImport({
          from: symbolResponseType.file,
          typeNames: [symbolResponseType.placeholder],
        });
        const responsesType = tsc.typeReferenceNode({
          typeName: symbolResponseType.placeholder,
        });
        const defaultType = tsc.literalTypeNode({
          literal: tsc.stringLiteral({ text: 'default' }),
        });
        responsesTypeReference = tsc.typeReferenceNode({
          typeArguments: [responsesType, defaultType],
          typeName: 'Omit',
        });
      }
    }
  }

  const replyTypes = [errorsTypeReference, responsesTypeReference].filter(
    Boolean,
  );
  if (replyTypes.length) {
    properties.push({
      name: 'Reply',
      type: tsc.typeIntersectionNode({
        types: replyTypes,
      }),
    });
  }

  if (!properties.length) {
    return;
  }

  const symbolRouteHandler = f.ensureSymbol({
    selector: plugin.api.getSelector('RouteHandler'),
  });
  const routeHandler: Property = {
    name: operation.id,
    type: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeInterfaceNode({
          properties,
          useLegacyResolution: false,
        }),
      ],
      typeName: symbolRouteHandler.placeholder,
    }),
  };
  return routeHandler;
};

export const handler: FastifyPlugin['Handler'] = ({ plugin }) => {
  const f = plugin.gen.createFile(plugin.output, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  const routeHandlers: Array<Property> = [];

  plugin.forEach('operation', ({ operation }) => {
    const routeHandler = operationToRouteHandler({ operation, plugin });
    if (routeHandler) {
      routeHandlers.push(routeHandler);
    }
  });

  const symbolRouteHandlers = f.addSymbol({ name: 'RouteHandlers' });

  if (routeHandlers.length) {
    const symbolRouteHandler = f
      .ensureSymbol({ selector: plugin.api.getSelector('RouteHandler') })
      .update({ name: 'RouteHandler' });
    f.addImport({
      from: 'fastify',
      typeNames: [symbolRouteHandler.name],
    });
  }

  const node = tsc.typeAliasDeclaration({
    exportType: true,
    name: symbolRouteHandlers.placeholder,
    type: tsc.typeInterfaceNode({
      properties: routeHandlers,
      useLegacyResolution: false,
    }),
  });
  symbolRouteHandlers.update({ value: node });
};
