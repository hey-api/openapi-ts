import { compiler } from '../../../compiler';
import type { IRContext } from '../../../ir/context';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../../../openApi';
import type { OpenApiV3_0_X } from '../../../openApi/3.0.x';
import type {
  ReferenceObject as OpenApiV3_0_XReferenceObject,
  SchemaObject as OpenApiV3_0_XSchemaObject,
} from '../../../openApi/3.0.x/types/spec';
import type { OpenApiV3_1_X } from '../../../openApi/3.1.x';
import type { SchemaObject as OpenApiV3_1_XSchemaObject } from '../../../openApi/3.1.x/types/spec';
import type { PluginHandler } from '../../types';
import type { Config } from './types';

const schemasId = 'schemas';

const stripSchema = ({
  context,
  schema,
}: {
  context: IRContext;
  schema: OpenApiV3_0_XSchemaObject | OpenApiV3_1_XSchemaObject;
}) => {
  if (context.config.plugins['@hey-api/schemas']?.type === 'form') {
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
  schema: _schema,
}: {
  context: IRContext;
  schema: OpenApiV3_0_XSchemaObject | OpenApiV3_0_XReferenceObject;
}): object => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        schema: item,
      }),
    );
  }

  const schema = structuredClone(_schema);

  if ('$ref' in schema) {
    // refs are encoded probably by json-schema-ref-parser, didn't investigate
    // further
    schema.$ref = decodeURIComponent(schema.$ref);
    return schema;
  }

  stripSchema({ context, schema });

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties !== 'boolean'
  ) {
    schema.additionalProperties = schemaToJsonSchemaDraft_05({
      context,
      schema: schema.additionalProperties,
    });
  }

  if (schema.allOf) {
    schema.allOf = schema.allOf.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        schema: item,
      }),
    );
  }

  if (schema.anyOf) {
    schema.anyOf = schema.anyOf.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        schema: item,
      }),
    );
  }

  if (schema.items) {
    schema.items = schemaToJsonSchemaDraft_05({
      context,
      schema: schema.items,
    });
  }

  if (schema.oneOf) {
    schema.oneOf = schema.oneOf.map((item) =>
      schemaToJsonSchemaDraft_05({
        context,
        schema: item,
      }),
    );
  }

  if (schema.properties) {
    for (const name in schema.properties) {
      const property = schema.properties[name];

      if (typeof property !== 'boolean') {
        schema.properties[name] = schemaToJsonSchemaDraft_05({
          context,
          schema: property,
        });
      }
    }
  }

  return schema;
};

const schemaToJsonSchema2020_12 = ({
  context,
  schema: _schema,
}: {
  context: IRContext;
  schema: OpenApiV3_1_XSchemaObject;
}): object => {
  if (Array.isArray(_schema)) {
    return _schema.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        schema: item,
      }),
    );
  }

  const schema = structuredClone(_schema);

  stripSchema({ context, schema });

  if (schema.$ref) {
    // refs are encoded probably by json-schema-ref-parser, didn't investigate
    // further
    schema.$ref = decodeURIComponent(schema.$ref);
  }

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties !== 'boolean'
  ) {
    schema.additionalProperties = schemaToJsonSchema2020_12({
      context,
      schema: schema.additionalProperties,
    });
  }

  if (schema.allOf) {
    schema.allOf = schema.allOf.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        schema: item,
      }),
    );
  }

  if (schema.anyOf) {
    schema.anyOf = schema.anyOf.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        schema: item,
      }),
    );
  }

  if (schema.items) {
    schema.items = schemaToJsonSchema2020_12({
      context,
      schema: schema.items,
    });
  }

  if (schema.oneOf) {
    schema.oneOf = schema.oneOf.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        schema: item,
      }),
    );
  }

  if (schema.prefixItems) {
    schema.prefixItems = schema.prefixItems.map((item) =>
      schemaToJsonSchema2020_12({
        context,
        schema: item,
      }),
    );
  }

  if (schema.properties) {
    for (const name in schema.properties) {
      const property = schema.properties[name];

      if (typeof property !== 'boolean') {
        schema.properties[name] = schemaToJsonSchema2020_12({
          context,
          schema: property,
        });
      }
    }
  }

  return schema;
};

const schemaName = ({
  context,
  name,
  schema,
}: {
  context: IRContext;
  name: string;
  schema:
    | OpenApiV3_0_XReferenceObject
    | OpenApiV3_0_XSchemaObject
    | OpenApiV3_1_XSchemaObject;
}): string => {
  const validName = ensureValidTypeScriptJavaScriptIdentifier(name);

  if (context.config.plugins['@hey-api/schemas']?.nameBuilder) {
    return context.config.plugins['@hey-api/schemas'].nameBuilder(
      validName,
      schema,
    );
  }

  return `${validName}Schema`;
};

const schemasV3_0_X = (context: IRContext<OpenApiV3_0_X>) => {
  if (!context.spec.components) {
    return;
  }

  for (const name in context.spec.components.schemas) {
    const schema = context.spec.components.schemas[name];
    const obj = schemaToJsonSchemaDraft_05({
      context,
      schema,
    });
    const statement = compiler.constVariable({
      assertion: 'const',
      exportConst: true,
      expression: compiler.objectExpression({ obj }),
      name: schemaName({ context, name, schema }),
    });
    context.file({ id: schemasId })!.add(statement);
  }
};

const schemasV3_1_X = (context: IRContext<OpenApiV3_1_X>) => {
  if (!context.spec.components) {
    return;
  }

  for (const name in context.spec.components.schemas) {
    const schema = context.spec.components.schemas[name];
    const obj = schemaToJsonSchema2020_12({
      context,
      schema,
    });
    const statement = compiler.constVariable({
      assertion: 'const',
      exportConst: true,
      expression: compiler.objectExpression({ obj }),
      name: schemaName({ context, name, schema }),
    });
    context.file({ id: schemasId })!.add(statement);
  }
};

export const handler: PluginHandler<Config> = ({ context }) => {
  context.createFile({
    id: schemasId,
    path: 'schemas',
  });

  if (context.spec.openapi) {
    const ctx = context as IRContext<OpenApiV3_0_X | OpenApiV3_1_X>;
    switch (ctx.spec.openapi) {
      // TODO: parser - handle Swagger 2.0
      case '3.0.0':
      case '3.0.1':
      case '3.0.2':
      case '3.0.3':
      case '3.0.4':
        schemasV3_0_X(context as IRContext<OpenApiV3_0_X>);
        break;
      case '3.1.0':
      case '3.1.1':
        schemasV3_1_X(context as IRContext<OpenApiV3_1_X>);
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
