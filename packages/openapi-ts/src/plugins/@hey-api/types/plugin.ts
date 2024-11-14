import { compiler } from '../../../compiler';
import type { IRContext } from '../../../ir/context';
import type {
  IROperationObject,
  IRPathItemObject,
  IRPathsObject,
  IRSchemaObject,
} from '../../../ir/ir';
import { operationResponsesMap } from '../../../ir/operation';
import { irParametersToIrSchema } from '../../../ir/schema';
import type { PluginHandler } from '../../types';
import {
  componentsToType,
  schemaToType,
  type SchemaToTypeOptions,
} from '../../utils/types';
import {
  operationDataRef,
  operationErrorRef,
  operationResponseRef,
} from '../services/plugin';
import type { Config } from './types';

export const typesId = 'types';

const operationToDataType = ({
  context,
  operation,
  options,
}: {
  context: IRContext;
  operation: IROperationObject;
  options: SchemaToTypeOptions;
}) => {
  const data: IRSchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];
  let hasAnyProperties = false;

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    hasAnyProperties = true;
    data.properties.body = operation.body.schema;

    if (operation.body.required) {
      dataRequired.push('body');
    }
  } else {
    data.properties.body = {
      type: 'never',
    };
  }

  if (operation.parameters) {
    // TODO: parser - handle cookie parameters

    // do not set headers to never so we can always pass arbitrary values
    if (operation.parameters.header) {
      hasAnyProperties = true;
      data.properties.headers = irParametersToIrSchema({
        parameters: operation.parameters.header,
      });

      if (data.properties.headers.required) {
        dataRequired.push('headers');
      }
    }

    if (operation.parameters.path) {
      hasAnyProperties = true;
      data.properties.path = irParametersToIrSchema({
        parameters: operation.parameters.path,
      });

      if (data.properties.path.required) {
        dataRequired.push('path');
      }
    } else {
      data.properties.path = {
        type: 'never',
      };
    }

    if (operation.parameters.query) {
      hasAnyProperties = true;
      data.properties.query = irParametersToIrSchema({
        parameters: operation.parameters.query,
      });

      if (data.properties.query.required) {
        dataRequired.push('query');
      }
    } else {
      data.properties.query = {
        type: 'never',
      };
    }
  }

  data.required = dataRequired;

  if (hasAnyProperties) {
    const identifier = context.file({ id: typesId })!.identifier({
      $ref: operationDataRef({ id: operation.id }),
      create: true,
      namespace: 'type',
    });
    const node = compiler.typeAliasDeclaration({
      exportType: true,
      name: identifier.name || '',
      type: schemaToType({
        options,
        schema: data,
      }),
    });
    context.file({ id: typesId })!.add(node);
  }
};

const operationToType = ({
  context,
  operation,
  options,
}: {
  context: IRContext;
  operation: IROperationObject;
  options: SchemaToTypeOptions;
}) => {
  operationToDataType({
    context,
    operation,
    options,
  });

  const { error, response } = operationResponsesMap(operation);

  if (error) {
    const identifier = context.file({ id: typesId })!.identifier({
      $ref: operationErrorRef({ id: operation.id }),
      create: true,
      namespace: 'type',
    });
    const node = compiler.typeAliasDeclaration({
      exportType: true,
      name: identifier.name || '',
      type: schemaToType({
        options,
        schema: error,
      }),
    });
    context.file({ id: typesId })!.add(node);
  }

  if (response) {
    const identifier = context.file({ id: typesId })!.identifier({
      $ref: operationResponseRef({ id: operation.id }),
      create: true,
      namespace: 'type',
    });
    const node = compiler.typeAliasDeclaration({
      exportType: true,
      name: identifier.name || '',
      type: schemaToType({
        options,
        schema: response,
      }),
    });
    context.file({ id: typesId })!.add(node);
  }
};

export const handler: PluginHandler<Config> = ({ context }) => {
  const file = context.createFile({
    id: typesId,
    path: 'types',
  });
  const options: SchemaToTypeOptions = {
    enums: context.config.plugins['@hey-api/types']?.enums,
    file,
    useTransformersDate: context.config.plugins['@hey-api/transformers']?.dates,
  };

  componentsToType({ context, options });

  // TODO: parser - once types are a plugin, this logic can be simplified
  // provide config option on types to generate path types and services
  // will set it to true if needed
  if (
    context.config.plugins['@hey-api/services'] ||
    context.config.plugins['@hey-api/types']?.tree
  ) {
    for (const path in context.ir.paths) {
      const pathItem = context.ir.paths[path as keyof IRPathsObject];

      for (const _method in pathItem) {
        const method = _method as keyof IRPathItemObject;
        const operation = pathItem[method]!;

        operationToType({
          context,
          operation,
          options,
        });
      }
    }

    // TODO: parser - document removal of tree? migrate it?
  }
};
