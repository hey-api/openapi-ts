import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import type {
  ReferenceObject as OpenApiV3_0_XReferenceObject,
  SchemaObject as OpenApiV3_0_XSchemaObject,
} from '../../../openApi/3.0.x/types/spec';
import type { SchemaObject as OpenApiV3_1_XSchemaObject } from '../../../openApi/3.1.x/types/spec';
import { ensureValidIdentifier } from '../../../openApi/shared/utils/identifier';
import type { OpenApi } from '../../../openApi/types';
import type { Plugin } from '../../types';
import type { Config } from './types';

const schemasId = 'schemas';

const stripSchema = ({
  plugin,
  schema,
}: {
  plugin: Plugin.Instance<Config>;
  schema: OpenApiV3_0_XSchemaObject | OpenApiV3_1_XSchemaObject;
}) => {
  if (plugin.type === 'form') {
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

const schemaToJsonSchemaDraft_05 = ({
  context,
  plugin,
  schema: _schema,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  schema: OpenApiV3_0_XSchemaObject | OpenApiV3_0_XReferenceObject;
}): object => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        plugin,
        schema: item,
      }),
    );
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
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  schema: OpenApiV3_1_XSchemaObject;
}): object => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        plugin,
        schema: item,
      }),
    );
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
  plugin: Plugin.Instance<Config>;
  schema:
    | OpenApiV3_0_XReferenceObject
    | OpenApiV3_0_XSchemaObject
    | OpenApiV3_1_XSchemaObject;
}): string => {
  const customName = plugin.nameBuilder?.(name, schema) ?? `${name}Schema`;
  return ensureValidIdentifier(customName);
};

const schemasV3_0_X = ({
  context,
  plugin,
}: {
  context: IR.Context<OpenApi.V3_0_X>;
  plugin: Plugin.Instance<Config>;
}) => {
  if (!context.spec.components) {
    return;
  }

  for (const name in context.spec.components.schemas) {
    const schema = context.spec.components.schemas[name]!;
    const obj = schemaToJsonSchemaDraft_05({
      context,
      plugin,
      schema,
    });
    const statement = compiler.constVariable({
      assertion: 'const',
      exportConst: true,
      expression: compiler.objectExpression({ obj }),
      name: schemaName({ name, plugin, schema }),
    });
    context.file({ id: schemasId })!.add(statement);
  }
};

const schemasV3_1_X = ({
  context,
  plugin,
}: {
  context: IR.Context<OpenApi.V3_1_X>;
  plugin: Plugin.Instance<Config>;
}) => {
  if (!context.spec.components) {
    return;
  }

  for (const name in context.spec.components.schemas) {
    const schema = context.spec.components.schemas[name]!;
    const obj = schemaToJsonSchema2020_12({
      context,
      plugin,
      schema,
    });
    const statement = compiler.constVariable({
      assertion: 'const',
      exportConst: true,
      expression: compiler.objectExpression({ obj }),
      name: schemaName({ name, plugin, schema }),
    });
    context.file({ id: schemasId })!.add(statement);
  }
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: schemasId,
    path: plugin.output,
  });

  if (context.spec.openapi) {
    const ctx = context as IR.Context<OpenApi.V3_0_X | OpenApi.V3_1_X>;
    switch (ctx.spec.openapi) {
      // TODO: parser - handle Swagger 2.0
      case '3.0.0':
      case '3.0.1':
      case '3.0.2':
      case '3.0.3':
      case '3.0.4':
        schemasV3_0_X({
          context: context as IR.Context<OpenApi.V3_0_X>,
          plugin,
        });
        break;
      case '3.1.0':
      case '3.1.1':
        schemasV3_1_X({
          context: context as IR.Context<OpenApi.V3_1_X>,
          plugin,
        });
        break;
      default:
        break;
    }
  }

  // OpenAPI 2.0
  // if ('swagger' in openApi) {
  //   Object.entries(openApi.definitions ?? {}).forEach(([name, definition]) => {
  //     addSchema(name, definition);
  //   });
  // }
};
