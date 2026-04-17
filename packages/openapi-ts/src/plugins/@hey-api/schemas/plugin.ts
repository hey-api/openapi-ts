import type { Context, OpenApi } from '@hey-api/shared';
import { satisfies } from '@hey-api/shared';
import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@hey-api/spec-types';

import { $ } from '../../../ts-dsl';
import type { HeyApiSchemasPlugin } from './types';

function stripSchema({
  plugin,
  schema,
}: {
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
}) {
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
}

function schemaToJsonSchemaDraft_04({
  context,
  plugin,
  schema: _schema,
}: {
  context: Context;
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenAPIV2.SchemaObject;
}): OpenAPIV2.SchemaObject {
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
}

function schemaToJsonSchemaDraft_05({
  context,
  plugin,
  schema: _schema,
}: {
  context: Context;
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
}): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject {
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
}

function schemaToJsonSchema2020_12({
  context,
  plugin,
  schema: _schema,
}: {
  context: Context;
  plugin: HeyApiSchemasPlugin['Instance'];
  schema: OpenAPIV3_1.SchemaObject;
}): OpenAPIV3_1.SchemaObject {
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
}

function schemaName({
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
}): string {
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
}

function schemasV2_0_X({
  context,
  plugin,
}: {
  context: Context<OpenApi.V2_0_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) {
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
}

function schemasV3_0_X({
  context,
  plugin,
}: {
  context: Context<OpenApi.V3_0_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) {
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
}

function schemasV3_1_X({
  context,
  plugin,
}: {
  context: Context<OpenApi.V3_1_X>;
  plugin: HeyApiSchemasPlugin['Instance'];
}) {
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
}

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
