import { compiler } from '../../../compiler';
import type { IRContext } from '../../../ir/context';
import {
  ensureValidTypeScriptJavaScriptIdentifier,
  type ParserOpenApiSpec,
} from '../../../openApi';
import type { OpenApiV3_1_0 } from '../../../openApi/3.1.0';
import type { SchemaObject as OpenApiV3_1_0SchemaObject } from '../../../openApi/3.1.0/types/spec';

const schemasId = 'schemas';

const stripSchema = ({
  context,
  schema,
}: {
  context: IRContext;
  schema: OpenApiV3_1_0SchemaObject;
}) => {
  if (context.config.schemas.type === 'form') {
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

const schemaToJsonSchema2020_12 = ({
  context,
  schema: _schema,
}: {
  context: IRContext;
  schema: OpenApiV3_1_0SchemaObject;
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

  if (schema.additionalProperties) {
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
  schema: OpenApiV3_1_0SchemaObject;
}): string => {
  const validName = ensureValidTypeScriptJavaScriptIdentifier(name);

  if (context.config.schemas.name) {
    return context.config.schemas.name(validName, schema);
  }

  return `${validName}Schema`;
};

const schemasV3_1_0 = (context: IRContext<OpenApiV3_1_0>) => {
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

export const generateSchemas = ({
  context,
}: {
  context: IRContext<ParserOpenApiSpec>;
}): void => {
  // TODO: parser - once schemas are a plugin, this logic can be simplified
  if (!context.config.schemas.export) {
    return;
  }

  context.createFile({
    id: schemasId,
    path: 'schemas',
  });

  // TODO: parser - copy-pasted from experimental parser for now
  switch (context.spec.openapi) {
    case '3.0.3':
      // ...
      break;
    case '3.1.0':
      schemasV3_1_0(context as IRContext<OpenApiV3_1_0>);
      break;
    default:
      break;
  }

  // OpenAPI 2.0
  // if ('swagger' in openApi) {
  //   Object.entries(openApi.definitions ?? {}).forEach(([name, definition]) => {
  //     addSchema(name, definition);
  //   });
  // }
};
