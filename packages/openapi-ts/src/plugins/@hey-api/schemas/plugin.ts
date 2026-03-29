import type { Context, OpenApi } from '@hey-api/shared';
import { satisfies, toCase } from '@hey-api/shared';
import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@hey-api/spec-types';

import { $ } from '../../../ts-dsl';
import type { HeyApiSchemasPlugin } from './types';

const httpMethods = ['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'] as const;

const paramLocations = [
  { location: 'cookie', suffix: 'Cookies' },
  { location: 'header', suffix: 'Headers' },
  { location: 'path', suffix: 'Path' },
  { location: 'query', suffix: 'Query' },
] as const;

const stripSchema = ({
  plugin,
  schema,
}: {
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
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
  schema: OpenAPIV2.SchemaObject;
}): OpenAPIV2.SchemaObject => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchemaDraft_04({
        context,
        plugin,
        schema: item,
      }),
    ) as unknown as OpenAPIV2.SchemaObject;
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
      schema: schema.items as OpenAPIV2.SchemaObject,
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
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
}): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: item,
      }),
    ) as unknown as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
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
  schema: OpenAPIV3_1.SchemaObject;
}): OpenAPIV3_1.SchemaObject => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: item,
      }),
    ) as unknown as OpenAPIV3_1.SchemaObject;
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
    | OpenAPIV2.SchemaObject
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.SchemaObject
    | OpenAPIV3_1.SchemaObject;
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
        | OpenAPIV2.OperationObject
        | undefined;
      if (!operation) {
        continue;
      }

      const irOperation = context.ir.paths?.[path as `/${string}`]?.[method];
      if (!irOperation) {
        continue;
      }

      for (const { location, suffix } of paramLocations) {
        const params = new Map<string, OpenAPIV2.ParameterObject>();

        for (const param of pathItem.parameters ?? []) {
          if ('$ref' in param || param.in !== location) {
            continue;
          }
          params.set(param.name, param as OpenAPIV2.ParameterObject);
        }

        for (const param of operation.parameters ?? []) {
          if ('$ref' in param || param.in !== location) {
            continue;
          }
          params.set(param.name, param as OpenAPIV2.ParameterObject);
        }

        if (params.size === 0) {
          continue;
        }

        const properties: Record<string, OpenAPIV2.SchemaObject> = {};
        const required: Array<string> = [];
        for (const [paramName, param] of params) {
          if (!('type' in param)) {
            continue;
          }
          const propSchema: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(param)) {
            if (key === 'allowEmptyValue' || key === 'in' || key === 'name' || key === 'required') {
              continue;
            }
            propSchema[key] = value;
          }
          properties[paramName] = propSchema as OpenAPIV2.SchemaObject;
          if (param.required) {
            required.push(paramName);
          }
        }

        const locationSchema = {
          properties,
          ...(required.length && { required }),
          type: 'object',
        } as OpenAPIV2.SchemaObject;

        const name = `${toCase(irOperation.id, 'PascalCase')}${suffix}`;
        const symbol = plugin.symbol(schemaName({ name, plugin, schema: locationSchema }), {
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
          schema: locationSchema,
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
        | OpenAPIV3.OperationObject
        | undefined;
      if (!operation) {
        continue;
      }

      const irOperation = context.ir.paths?.[path as `/${string}`]?.[method];
      if (!irOperation) {
        continue;
      }

      for (const { location, suffix } of paramLocations) {
        const params = new Map<string, OpenAPIV3.ParameterObject>();

        for (const param of pathItem.parameters ?? []) {
          if ('$ref' in param || param.in !== location) {
            continue;
          }
          params.set(param.name, param);
        }

        for (const param of operation.parameters ?? []) {
          if ('$ref' in param || param.in !== location) {
            continue;
          }
          params.set(param.name, param);
        }

        if (params.size === 0) {
          continue;
        }

        const properties: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {};
        const required: Array<string> = [];
        for (const [paramName, param] of params) {
          let propSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined;
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
          if (param.required) {
            required.push(paramName);
          }
        }

        const locationSchema = {
          properties,
          ...(required.length && { required }),
          type: 'object',
        } as OpenAPIV3.SchemaObject;

        const name = `${toCase(irOperation.id, 'PascalCase')}${suffix}`;
        const symbol = plugin.symbol(schemaName({ name, plugin, schema: locationSchema }), {
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
          schema: locationSchema,
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
        | OpenAPIV3_1.OperationObject
        | undefined;
      if (!operation) {
        continue;
      }

      const irOperation = context.ir.paths?.[path as `/${string}`]?.[method];
      if (!irOperation) {
        continue;
      }

      for (const { location, suffix } of paramLocations) {
        const params = new Map<string, OpenAPIV3_1.ParameterObject>();

        for (const param of pathItem.parameters ?? []) {
          if ('$ref' in param || param.in !== location) {
            continue;
          }
          params.set(param.name, param);
        }

        for (const param of operation.parameters ?? []) {
          if ('$ref' in param || param.in !== location) {
            continue;
          }
          params.set(param.name, param);
        }

        if (params.size === 0) {
          continue;
        }

        const properties: Record<string, OpenAPIV3_1.SchemaObject> = {};
        const required: Array<string> = [];
        for (const [paramName, param] of params) {
          let propSchema: OpenAPIV3_1.SchemaObject | undefined;
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
          if (param.required) {
            required.push(paramName);
          }
        }

        const locationSchema = {
          properties,
          ...(required.length && { required }),
          type: 'object',
        } as OpenAPIV3_1.SchemaObject;

        const name = `${toCase(irOperation.id, 'PascalCase')}${suffix}`;
        const symbol = plugin.symbol(schemaName({ name, plugin, schema: locationSchema }), {
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
          schema: locationSchema,
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
