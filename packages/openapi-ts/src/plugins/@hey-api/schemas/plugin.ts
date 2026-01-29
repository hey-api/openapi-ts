import type {
  Context,
  OpenApi,
  OpenApiV2_0_XTypes,
  OpenApiV3_0_XTypes,
  OpenApiV3_1_XTypes,
} from '@hey-api/shared';
import { satisfies } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type { HeyApiSchemasPlugin } from './types';

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

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties !== 'boolean'
  ) {
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
  schema:
    | OpenApiV3_0_XTypes['SchemaObject']
    | OpenApiV3_0_XTypes['ReferenceObject'];
}):
  | OpenApiV3_0_XTypes['SchemaObject']
  | OpenApiV3_0_XTypes['ReferenceObject'] => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: item,
      }),
    ) as unknown as
      | OpenApiV3_0_XTypes['SchemaObject']
      | OpenApiV3_0_XTypes['ReferenceObject'];
  }

  const schema = structuredClone(_schema);

  if ('$ref' in schema) {
    // refs using unicode characters become encoded, didn't investigate why
    // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
    schema.$ref = decodeURI(schema.$ref);
    return schema;
  }

  stripSchema({ plugin, schema });

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties !== 'boolean'
  ) {
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

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties !== 'boolean'
  ) {
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
  if (!context.spec.definitions) {
    return;
  }

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
};

const schemasV3_0_X = ({
  context,
  plugin,
}: {
  context: Context<OpenApi.V3_0_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) => {
  if (!context.spec.components) {
    return;
  }

  for (const name in context.spec.components.schemas) {
    const schema = context.spec.components.schemas[name]!;
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
};

const schemasV3_1_X = ({
  context,
  plugin,
}: {
  context: Context<OpenApi.V3_1_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) => {
  if (!context.spec.components) {
    return;
  }

  for (const name in context.spec.components.schemas) {
    const schema = context.spec.components.schemas[name]!;
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
