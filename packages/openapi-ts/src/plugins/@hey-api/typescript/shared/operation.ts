import { fromRef } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';
import { operationResponsesMap } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';

import { $ } from '~/ts-dsl';

import { irSchemaToAst } from '../v1/plugin';
import type { IrSchemaToAstOptions } from './types';

const irParametersToIrSchema = ({
  parameters,
}: {
  parameters: Record<string, IR.ParameterObject>;
}): IR.SchemaObject => {
  const irSchema: IR.SchemaObject = {
    type: 'object',
  };

  if (parameters) {
    const properties: Record<string, IR.SchemaObject> = {};
    const required: Array<string> = [];

    for (const key in parameters) {
      const parameter = parameters[key]!;

      properties[parameter.name] = deduplicateSchema({
        detectFormat: false,
        schema: parameter.schema,
      });

      if (parameter.required) {
        required.push(parameter.name);
      }
    }

    irSchema.properties = properties;

    if (required.length) {
      irSchema.required = required;
    }
  }

  return irSchema;
};

const operationToDataType = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}) => {
  const data: IR.SchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];

  if (!data.properties) {
    data.properties = {};
  }

  if (operation.body) {
    data.properties.body = operation.body.schema;

    if (operation.body.required) {
      dataRequired.push('body');
    }
  } else {
    data.properties.body = {
      type: 'never',
    };
  }

  // TODO: parser - handle cookie parameters

  // do not set headers to never so we can always pass arbitrary values
  if (operation.parameters?.header) {
    data.properties.headers = irParametersToIrSchema({
      parameters: operation.parameters.header,
    });

    if (data.properties.headers.required) {
      dataRequired.push('headers');
    }
  }

  if (operation.parameters?.path) {
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

  if (operation.parameters?.query) {
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

  data.properties.url = {
    const: operation.path,
    type: 'string',
  };
  dataRequired.push('url');

  data.required = dataRequired;

  const symbol = plugin.symbol(
    applyNaming(operation.id, plugin.config.requests),
    {
      meta: {
        category: 'type',
        path: fromRef(state.path),
        resource: 'operation',
        resourceId: operation.id,
        role: 'data',
        tags: fromRef(state.tags),
        tool: 'typescript',
      },
    },
  );
  const node = $.type
    .alias(symbol)
    .export()
    .type(
      irSchemaToAst({
        plugin,
        schema: data,
        state,
      }),
    );
  plugin.node(node);
};

export const operationToType = ({
  operation,
  plugin,
  state,
}: IrSchemaToAstOptions & {
  operation: IR.OperationObject;
}) => {
  operationToDataType({ operation, plugin, state });

  const { error, errors, response, responses } =
    operationResponsesMap(operation);

  if (errors) {
    const symbolErrors = plugin.symbol(
      applyNaming(operation.id, plugin.config.errors),
      {
        meta: {
          category: 'type',
          path: fromRef(state.path),
          resource: 'operation',
          resourceId: operation.id,
          role: 'errors',
          tags: fromRef(state.tags),
          tool: 'typescript',
        },
      },
    );
    const node = $.type
      .alias(symbolErrors)
      .export()
      .type(
        irSchemaToAst({
          plugin,
          schema: errors,
          state,
        }),
      );
    plugin.node(node);

    if (error) {
      const symbol = plugin.symbol(
        applyNaming(operation.id, {
          case: plugin.config.errors.case,
          name: plugin.config.errors.error,
        }),
        {
          meta: {
            category: 'type',
            path: fromRef(state.path),
            resource: 'operation',
            resourceId: operation.id,
            role: 'error',
            tags: fromRef(state.tags),
            tool: 'typescript',
          },
        },
      );
      const node = $.type
        .alias(symbol)
        .export()
        .type($.type(symbolErrors).idx($.type(symbolErrors).keyof()));
      plugin.node(node);
    }
  }

  if (responses) {
    const symbolResponses = plugin.symbol(
      applyNaming(operation.id, plugin.config.responses),
      {
        meta: {
          category: 'type',
          path: fromRef(state.path),
          resource: 'operation',
          resourceId: operation.id,
          role: 'responses',
          tags: fromRef(state.tags),
          tool: 'typescript',
        },
      },
    );
    const node = $.type
      .alias(symbolResponses)
      .export()
      .type(
        irSchemaToAst({
          plugin,
          schema: responses,
          state,
        }),
      );
    plugin.node(node);

    if (response) {
      const symbol = plugin.symbol(
        applyNaming(operation.id, {
          case: plugin.config.responses.case,
          name: plugin.config.responses.response,
        }),
        {
          meta: {
            category: 'type',
            path: fromRef(state.path),
            resource: 'operation',
            resourceId: operation.id,
            role: 'response',
            tags: fromRef(state.tags),
            tool: 'typescript',
          },
        },
      );
      const node = $.type
        .alias(symbol)
        .export()
        .type($.type(symbolResponses).idx($.type(symbolResponses).keyof()));
      plugin.node(node);
    }
  }
};
