import type {
  Context,
  OpenApi,
  OpenApiV2_0_XTypes,
  OpenApiV3_0_XTypes,
  OpenApiV3_1_XTypes,
} from '@hey-api/shared';
import { satisfies, toCase } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { HeyApiSchemasPlugin } from './types';

const httpMethods = ['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'] as const;

const stripSchema = ({
  plugin,
  schema,
}: {
  plugin: HeyApiSchemasPlugin['Instance'];
  schema:
    | OpenApiV2_0_XTypes['SchemaObject']
    | OpenApiV3_0_XTypes['SchemaObject']
    | OpenApiV3_1_XTypes['SchemaObject'];
}) => {
  if (plugin.config.type === 'form') {
    if (schema.description) {
      delete schema.description;
    }

    if (schema['x-enum-descriptions']) {
      delete schema['x-enum-descriptions'];
    }

    if (schema['x-enum-varnames']) {
      delete schema['x-enum-varnames'];
    }

    if (schema['x-enumNames']) {
      delete schema['x-enumNames'];
    }

    if (schema.title) {
      delete schema.title;
    }
  }
};

const schemaToJsonSchemaDraft_04 = ({
  context,
  plugin,
  schema: _schema,
}: {
  context: Context;
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenApiV2_0_XTypes['SchemaObject'];
}): OpenApiV2_0_XTypes['SchemaObject'] => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchemaDraft_04({
        context,
        plugin,
        schema: item,
      }),
    ) as unknown as OpenApiV2_0_XTypes['SchemaObject'];
  }

  const schema = structuredClone(_schema);

  if (schema.$ref) {
    // refs using unicode characters become encoded, didn't investigate why
    // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
    schema.$ref = decodeURI(schema.$ref);
    return schema;
  }

  stripSchema({ plugin, schema });

  if (schema.additionalProperties && typeof schema.additionalProperties !== 'boolean') {
    schema.additionalProperties = schemaToJsonSchemaDraft_04({
      context,
      plugin,
      schema: schema.additionalProperties,
    });
  }

  if (schema.allOf) {
    schema.allOf = schema.allOf.map((item) =>
      schemaToJsonSchemaDraft_04({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.items) {
    schema.items = schemaToJsonSchemaDraft_04({
      context,
      plugin,
      schema: schema.items as OpenApiV2_0_XTypes['SchemaObject'],
    });
  }

  if (schema.properties) {
    for (const name in schema.properties) {
      const property = schema.properties[name]!;

      if (typeof property !== 'boolean') {
        schema.properties[name] = schemaToJsonSchemaDraft_04({
          context,
          plugin,
          schema: property,
        });
      }
    }
  }

  return schema;
};

const schemaToJsonSchemaDraft_05 = ({
  context,
  plugin,
  schema: _schema,
}: {
  context: Context;
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenApiV3_0_XTypes['SchemaObject'] | OpenApiV3_0_XTypes['ReferenceObject'];
}): OpenApiV3_0_XTypes['SchemaObject'] | OpenApiV3_0_XTypes['ReferenceObject'] => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: item,
      }),
    ) as unknown as OpenApiV3_0_XTypes['SchemaObject'] | OpenApiV3_0_XTypes['ReferenceObject'];
  }

  const schema = structuredClone(_schema);

  if ('$ref' in schema) {
    // refs using unicode characters become encoded, didn't investigate why
    // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
    schema.$ref = decodeURI(schema.$ref);
    return schema;
  }

  stripSchema({ plugin, schema });

  if (schema.additionalProperties && typeof schema.additionalProperties !== 'boolean') {
    schema.additionalProperties = schemaToJsonSchemaDraft_05({
      context,
      plugin,
      schema: schema.additionalProperties,
    });
  }

  if (schema.allOf) {
    schema.allOf = schema.allOf.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.anyOf) {
    schema.anyOf = schema.anyOf.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.items) {
    schema.items = schemaToJsonSchemaDraft_05({
      context,
      plugin,
      schema: schema.items,
    });
  }

  if (schema.oneOf) {
    schema.oneOf = schema.oneOf.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.properties) {
    for (const name in schema.properties) {
      const property = schema.properties[name]!;

      if (typeof property !== 'boolean') {
        schema.properties[name] = schemaToJsonSchemaDraft_05({
          context,
          plugin,
          schema: property,
        });
      }
    }
  }

  return schema;
};

const schemaToJsonSchema2020_12 = ({
  context,
  plugin,
  schema: _schema,
}: {
  context: Context;
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenApiV3_1_XTypes['SchemaObject'];
}): OpenApiV3_1_XTypes['SchemaObject'] => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: item,
      }),
    ) as unknown as OpenApiV3_1_XTypes['SchemaObject'];
  }

  const schema = structuredClone(_schema);

  stripSchema({ plugin, schema });

  if (schema.$ref) {
    // refs using unicode characters become encoded, didn't investigate why
    // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
    schema.$ref = decodeURI(schema.$ref);
  }

  if (schema.additionalProperties && typeof schema.additionalProperties !== 'boolean') {
    schema.additionalProperties = schemaToJsonSchema2020_12({
      context,
      plugin,
      schema: schema.additionalProperties,
    });
  }

  if (schema.allOf) {
    schema.allOf = schema.allOf.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.anyOf) {
    schema.anyOf = schema.anyOf.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.items) {
    schema.items = schemaToJsonSchema2020_12({
      context,
      plugin,
      schema: schema.items,
    });
  }

  if (schema.oneOf) {
    schema.oneOf = schema.oneOf.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.prefixItems) {
    schema.prefixItems = schema.prefixItems.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: item,
      }),
    );
  }

  if (schema.properties) {
    for (const name in schema.properties) {
      const property = schema.properties[name]!;

      if (typeof property !== 'boolean') {
        schema.properties[name] = schemaToJsonSchema2020_12({
          context,
          plugin,
          schema: property,
        });
      }
    }
  }

  return schema;
};

const schemaName = ({
  name,
  plugin,
  schema,
}: {
  name: string;
  plugin: HeyApiSchemasPlugin['Instance'];
  schema:
    | OpenApiV2_0_XTypes['SchemaObject']
    | OpenApiV3_0_XTypes['ReferenceObject']
    | OpenApiV3_0_XTypes['SchemaObject']
    | OpenApiV3_1_XTypes['SchemaObject'];
}): string => {
  let customName = '';

  if (plugin.config.nameBuilder) {
    if (typeof plugin.config.nameBuilder === 'function') {
      customName = plugin.config.nameBuilder(name, schema);
    } else {
      customName = plugin.config.nameBuilder.replace('{{name}}', name);
    }
  }

  if (!customName) {
    customName = `${name}Schema`;
  }

  return customName;
};

const schemasV2_0_X = ({
  context,
  plugin,
}: {
  context: Context<OpenApi.V2_0_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) => {
  for (const name in context.spec.definitions) {
    const schema = context.spec.definitions[name]!;
    const symbol = plugin.symbol(schemaName({ name, plugin, schema }), {
      meta: {
        category: 'schema',
        resource: 'definition',
        resourceId: name,
        tool: 'json-schema',
      },
    });
    const obj = schemaToJsonSchemaDraft_04({
      context,
      plugin,
      schema,
    });
    const statement = $.const(symbol)
      .export()
      .assign(
        $(
          $.fromValue(obj, {
            layout: 'pretty',
          }),
        ).as('const'),
      );
    plugin.node(statement);
  }

  for (const path in context.spec.paths) {
    if (path.startsWith('x-')) {
      continue;
    }

    const pathItem = context.spec.paths[path as `/${string}`]!;

    for (const method of httpMethods) {
      const operation = pathItem[method as keyof typeof pathItem] as
        | OpenApiV2_0_XTypes['OperationObject']
        | undefined;
      if (!operation) {
        continue;
      }

      const irOperation = context.ir.paths?.[path as `/${string}`]?.[method];
      if (!irOperation) {
        continue;
      }

      const queryParams = new Map<string, { description?: string; type: string }>();

      for (const param of pathItem.parameters ?? []) {
        if ('$ref' in param || param.in !== 'query') {
          continue;
        }
        queryParams.set(param.name, param);
      }

      for (const param of operation.parameters ?? []) {
        if ('$ref' in param || param.in !== 'query') {
          continue;
        }
        queryParams.set(param.name, param);
      }

      if (queryParams.size === 0) {
        continue;
      }

      const properties: Record<string, OpenApiV2_0_XTypes['SchemaObject']> = {};
      for (const [paramName, param] of queryParams) {
        if (!param.type) {
          continue;
        }
        const propSchema: Record<string, unknown> = {};
        if (param.description) {
          propSchema.description = param.description;
        }
        propSchema.type = param.type;
        properties[paramName] = propSchema as OpenApiV2_0_XTypes['SchemaObject'];
      }

      const querySchema = {
        properties,
        type: 'object',
      } as OpenApiV2_0_XTypes['SchemaObject'];

      const name = `${toCase(irOperation.id, 'PascalCase')}Query`;
      const symbol = plugin.symbol(schemaName({ name, plugin, schema: querySchema }), {
        meta: {
          category: 'schema',
          resource: 'operation',
          resourceId: irOperation.id,
          tool: 'json-schema',
        },
      });
      const obj = schemaToJsonSchemaDraft_04({
        context,
        plugin,
        schema: querySchema,
      });
      const statement = $.const(symbol)
        .export()
        .assign(
          $(
            $.fromValue(obj, {
              layout: 'pretty',
            }),
          ).as('const'),
        );
      plugin.node(statement);
    }
  }
};

const schemasV3_0_X = ({
  context,
  plugin,
}: {
  context: Context<OpenApi.V3_0_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) => {
  for (const name in context.spec.components?.schemas) {
    const schema = context.spec.components!.schemas![name]!;
    const symbol = plugin.symbol(schemaName({ name, plugin, schema }), {
      meta: {
        category: 'schema',
        resource: 'definition',
        resourceId: name,
        tool: 'json-schema',
      },
    });
    const obj = schemaToJsonSchemaDraft_05({
      context,
      plugin,
      schema,
    });
    const statement = $.const(symbol)
      .export()
      .assign(
        $(
          $.fromValue(obj, {
            layout: 'pretty',
          }),
        ).as('const'),
      );
    plugin.node(statement);
  }

  for (const path in context.spec.paths) {
    if (path.startsWith('x-')) {
      continue;
    }

    const pathItem = context.spec.paths[path as `/${string}`]!;

    for (const method of httpMethods) {
      const operation = pathItem[method as keyof typeof pathItem] as
        | OpenApiV3_0_XTypes['OperationObject']
        | undefined;
      if (!operation) {
        continue;
      }

      const irOperation = context.ir.paths?.[path as `/${string}`]?.[method];
      if (!irOperation) {
        continue;
      }

      const queryParams = new Map<string, OpenApiV3_0_XTypes['ParameterObject']>();

      for (const param of pathItem.parameters ?? []) {
        if ('$ref' in param || param.in !== 'query') {
          continue;
        }
        queryParams.set(param.name, param);
      }

      for (const param of operation.parameters ?? []) {
        if ('$ref' in param || param.in !== 'query') {
          continue;
        }
        queryParams.set(param.name, param);
      }

      if (queryParams.size === 0) {
        continue;
      }

      const properties: Record<
        string,
        OpenApiV3_0_XTypes['SchemaObject'] | OpenApiV3_0_XTypes['ReferenceObject']
      > = {};
      for (const [paramName, param] of queryParams) {
        let propSchema:
          | OpenApiV3_0_XTypes['SchemaObject']
          | OpenApiV3_0_XTypes['ReferenceObject']
          | undefined;
        if (param.schema) {
          propSchema = { ...param.schema };
          if (param.description && !('$ref' in propSchema)) {
            propSchema.description = param.description;
          }
        } else if (param.content) {
          const mediaType = Object.values(param.content)[0];
          if (mediaType?.schema) {
            propSchema = { ...mediaType.schema };
          }
        }
        if (propSchema) {
          properties[paramName] = propSchema;
        }
      }

      const querySchema = {
        properties,
        type: 'object',
      } as OpenApiV3_0_XTypes['SchemaObject'];

      const name = `${toCase(irOperation.id, 'PascalCase')}Query`;
      const symbol = plugin.symbol(schemaName({ name, plugin, schema: querySchema }), {
        meta: {
          category: 'schema',
          resource: 'operation',
          resourceId: irOperation.id,
          tool: 'json-schema',
        },
      });
      const obj = schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: querySchema,
      });
      const statement = $.const(symbol)
        .export()
        .assign(
          $(
            $.fromValue(obj, {
              layout: 'pretty',
            }),
          ).as('const'),
        );
      plugin.node(statement);
    }
  }
};

const schemasV3_1_X = ({
  context,
  plugin,
}: {
  context: Context<OpenApi.V3_1_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) => {
  for (const name in context.spec.components?.schemas) {
    const schema = context.spec.components!.schemas![name]!;
    const symbol = plugin.symbol(schemaName({ name, plugin, schema }), {
      meta: {
        category: 'schema',
        resource: 'definition',
        resourceId: name,
        tool: 'json-schema',
      },
    });
    const obj = schemaToJsonSchema2020_12({
      context,
      plugin,
      schema,
    });
    const statement = $.const(symbol)
      .export()
      .assign(
        $(
          $.fromValue(obj, {
            layout: 'pretty',
          }),
        ).as('const'),
      );
    plugin.node(statement);
  }

  for (const path in context.spec.paths) {
    if (path.startsWith('x-')) {
      continue;
    }

    const pathItem = context.spec.paths![path as `/${string}`]!;

    for (const method of httpMethods) {
      const operation = pathItem[method as keyof typeof pathItem] as
        | OpenApiV3_1_XTypes['OperationObject']
        | undefined;
      if (!operation) {
        continue;
      }

      const irOperation = context.ir.paths?.[path as `/${string}`]?.[method];
      if (!irOperation) {
        continue;
      }

      const queryParams = new Map<string, OpenApiV3_1_XTypes['ParameterObject']>();

      for (const param of pathItem.parameters ?? []) {
        if ('$ref' in param || param.in !== 'query') {
          continue;
        }
        queryParams.set(param.name, param);
      }

      for (const param of operation.parameters ?? []) {
        if ('$ref' in param || param.in !== 'query') {
          continue;
        }
        queryParams.set(param.name, param);
      }

      if (queryParams.size === 0) {
        continue;
      }

      const properties: Record<string, OpenApiV3_1_XTypes['SchemaObject']> = {};
      for (const [paramName, param] of queryParams) {
        let propSchema: OpenApiV3_1_XTypes['SchemaObject'] | undefined;
        if (param.schema) {
          propSchema = { ...param.schema };
          if (param.description) {
            propSchema.description = param.description;
          }
        } else if (param.content) {
          const mediaType = Object.values(param.content)[0];
          if (mediaType?.schema) {
            propSchema = { ...mediaType.schema };
          }
        }
        if (propSchema) {
          properties[paramName] = propSchema;
        }
      }

      const querySchema = {
        properties,
        type: 'object',
      } as OpenApiV3_1_XTypes['SchemaObject'];

      const name = `${toCase(irOperation.id, 'PascalCase')}Query`;
      const symbol = plugin.symbol(schemaName({ name, plugin, schema: querySchema }), {
        meta: {
          category: 'schema',
          resource: 'operation',
          resourceId: irOperation.id,
          tool: 'json-schema',
        },
      });
      const obj = schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: querySchema,
      });
      const statement = $.const(symbol)
        .export()
        .assign(
          $(
            $.fromValue(obj, {
              layout: 'pretty',
            }),
          ).as('const'),
        );
      plugin.node(statement);
    }
  }
};

export const handler: HeyApiSchemasPlugin['Handler'] = ({ plugin }) => {
  if ('swagger' in plugin.context.spec) {
    schemasV2_0_X({
      context: plugin.context as Context<OpenApi.V2_0_X>,
      plugin,
    });
    return;
  }

  if (satisfies(plugin.context.spec.openapi, '>=3.0.0 <3.1.0')) {
    schemasV3_0_X({
      context: plugin.context as Context<OpenApi.V3_0_X>,
      plugin,
    });
    return;
  }

  if (satisfies(plugin.context.spec.openapi, '>=3.1.0')) {
    schemasV3_1_X({
      context: plugin.context as Context<OpenApi.V3_1_X>,
      plugin,
    });
    return;
  }

  throw new Error('Unsupported OpenAPI specification');
};
