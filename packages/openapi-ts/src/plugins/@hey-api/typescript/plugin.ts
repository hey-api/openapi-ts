import ts from 'typescript';

import type { Property } from '../../../compiler';
import { compiler } from '../../../compiler';
import type { IRContext } from '../../../ir/context';
import type {
  IROperationObject,
  IRParameterObject,
  IRSchemaObject,
} from '../../../ir/ir';
import { operationResponsesMap } from '../../../ir/operation';
import { deduplicateSchema } from '../../../ir/schema';
import { escapeComment } from '../../../utils/escape';
import { irRef, isRefOpenApiComponent } from '../../../utils/ref';
import type { Plugin, PluginHandler } from '../../types';
import { operationIrRef } from '../sdk/plugin';
import type { Config } from './types';

interface SchemaWithType<T extends Required<IRSchemaObject>['type']>
  extends Omit<IRSchemaObject, 'type'> {
  type: Extract<Required<IRSchemaObject>['type'], T>;
}

const typesId = 'types';

const digitsRegExp = /^\d+$/;

const parseSchemaJsDoc = ({ schema }: { schema: IRSchemaObject }) => {
  const comments = [
    schema.description && escapeComment(schema.description),
    schema.deprecated && '@deprecated',
  ].filter(Boolean);

  if (!comments.length) {
    return;
  }

  return comments;
};

const addJavaScriptEnum = ({
  $ref,
  context,
  schema,
}: {
  $ref: string;
  context: IRContext;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = context.file({ id: typesId })!.identifier({
    $ref,
    create: true,
    namespace: 'value',
  });

  // TODO: parser - this is the old parser behavior where we would NOT
  // print nested enum identifiers if they already exist. This is a
  // blocker for referencing these identifiers within the file as
  // we cannot guarantee just because they have a duplicate identifier,
  // they have a duplicate value.
  if (!identifier.created) {
    return;
  }

  const enumObject = schemaToEnumObject({ schema });

  const expression = compiler.objectExpression({
    multiLine: true,
    obj: enumObject.obj,
  });
  const node = compiler.constVariable({
    assertion: 'const',
    comment: parseSchemaJsDoc({ schema }),
    exportConst: true,
    expression,
    name: identifier.name || '',
  });
  return node;
};

const schemaToEnumObject = ({ schema }: { schema: IRSchemaObject }) => {
  const typeofItems: Array<
    | 'bigint'
    | 'boolean'
    | 'function'
    | 'number'
    | 'object'
    | 'string'
    | 'symbol'
    | 'undefined'
  > = [];

  const obj = (schema.items ?? []).map((item) => {
    const typeOfItemConst = typeof item.const;

    if (!typeofItems.includes(typeOfItemConst)) {
      // track types of enum values because some modes support
      // only enums with string and number types
      typeofItems.push(typeOfItemConst);
    }

    let key;

    if (item.title) {
      key = item.title;
    } else if (typeOfItemConst === 'number') {
      key = `_${item.const}`;
    } else if (typeOfItemConst === 'boolean') {
      const valid = typeOfItemConst ? 'true' : 'false';
      key = valid.toLocaleUpperCase();
    } else if (typeof item.const === 'string') {
      key = item.const.replace(/(\p{Lowercase})(\p{Uppercase}+)/gu, '$1_$2');
      key = key.toLocaleUpperCase();
    } else if (item.const === null) {
      key = 'null';
      key = key.toLocaleUpperCase();
    }

    return {
      comments: parseSchemaJsDoc({ schema: item }),
      key,
      value: item.const,
    };
  });

  return {
    obj,
    typeofItems,
  };
};

const addTypeEnum = ({
  $ref,
  context,
  plugin,
  schema,
}: {
  $ref: string;
  context: IRContext;
  plugin: Plugin<Config>;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = context.file({ id: typesId })!.identifier({
    $ref,
    create: true,
    namespace: 'type',
  });

  // TODO: parser - this is the old parser behavior where we would NOT
  // print nested enum identifiers if they already exist. This is a
  // blocker for referencing these identifiers within the file as
  // we cannot guarantee just because they have a duplicate identifier,
  // they have a duplicate value.
  if (
    !identifier.created &&
    !isRefOpenApiComponent($ref) &&
    plugin.enums !== 'typescript+namespace'
  ) {
    return;
  }

  const node = compiler.typeAliasDeclaration({
    comment: parseSchemaJsDoc({ schema }),
    exportType: true,
    name: identifier.name || '',
    type: schemaToType({
      context,
      plugin,
      schema: {
        ...schema,
        type: undefined,
      },
    }),
  });
  return node;
};

const addTypeScriptEnum = ({
  $ref,
  context,
  plugin,
  schema,
}: {
  $ref: string;
  context: IRContext;
  plugin: Plugin<Config>;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = context.file({ id: typesId })!.identifier({
    $ref,
    create: true,
    namespace: 'value',
  });

  // TODO: parser - this is the old parser behavior where we would NOT
  // print nested enum identifiers if they already exist. This is a
  // blocker for referencing these identifiers within the file as
  // we cannot guarantee just because they have a duplicate identifier,
  // they have a duplicate value.
  if (!identifier.created && plugin.enums !== 'typescript+namespace') {
    return;
  }

  const enumObject = schemaToEnumObject({ schema });

  // TypeScript enums support only string and number values so we need to fallback to types
  if (
    enumObject.typeofItems.filter(
      (type) => type !== 'number' && type !== 'string',
    ).length
  ) {
    const node = addTypeEnum({
      $ref,
      context,
      plugin,
      schema,
    });
    return node;
  }

  const node = compiler.enumDeclaration({
    leadingComment: parseSchemaJsDoc({ schema }),
    name: identifier.name || '',
    obj: enumObject.obj,
  });
  return node;
};

const arrayTypeToIdentifier = ({
  context,
  namespace,
  plugin,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  plugin: Plugin<Config>;
  schema: SchemaWithType<'array'>;
}) => {
  if (!schema.items) {
    return compiler.typeArrayNode(
      compiler.keywordTypeNode({
        keyword: 'unknown',
      }),
    );
  }

  schema = deduplicateSchema({ schema });

  // at least one item is guaranteed
  const itemTypes = schema.items!.map((item) =>
    schemaToType({
      context,
      namespace,
      plugin,
      schema: item,
    }),
  );

  if (itemTypes.length === 1) {
    return compiler.typeArrayNode(itemTypes[0]);
  }

  if (schema.logicalOperator === 'and') {
    return compiler.typeArrayNode(
      compiler.typeIntersectionNode({ types: itemTypes }),
    );
  }

  return compiler.typeArrayNode(compiler.typeUnionNode({ types: itemTypes }));
};

const booleanTypeToIdentifier = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'boolean'>;
}) => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.ots.boolean(schema.const as boolean),
    });
  }

  return compiler.keywordTypeNode({
    keyword: 'boolean',
  });
};

const enumTypeToIdentifier = ({
  $ref,
  context,
  namespace,
  plugin,
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace: Array<ts.Statement>;
  plugin: Plugin<Config>;
  schema: SchemaWithType<'enum'>;
}): ts.TypeNode => {
  const isRefComponent = $ref ? isRefOpenApiComponent($ref) : false;
  const shouldExportEnum = isRefComponent || Boolean(plugin.exportInlineEnums);

  if ($ref && shouldExportEnum) {
    // when enums are disabled (default), emit only reusable components
    // as types, otherwise the output would be broken if we skipped all enums
    if (!plugin.enums) {
      const typeNode = addTypeEnum({
        $ref,
        context,
        plugin,
        schema,
      });
      if (typeNode) {
        context.file({ id: typesId })!.add(typeNode);
      }
    }

    if (plugin.enums === 'javascript') {
      const typeNode = addTypeEnum({
        $ref,
        context,
        plugin,
        schema,
      });
      if (typeNode) {
        context.file({ id: typesId })!.add(typeNode);
      }

      const objectNode = addJavaScriptEnum({
        $ref,
        context,
        schema,
      });
      if (objectNode) {
        context.file({ id: typesId })!.add(objectNode);
      }
    }

    if (plugin.enums === 'typescript') {
      const enumNode = addTypeScriptEnum({
        $ref,
        context,
        plugin,
        schema,
      });
      if (enumNode) {
        context.file({ id: typesId })!.add(enumNode);
      }
    }

    if (plugin.enums === 'typescript+namespace') {
      const enumNode = addTypeScriptEnum({
        $ref,
        context,
        plugin,
        schema,
      });
      if (enumNode) {
        if (isRefComponent) {
          context.file({ id: typesId })!.add(enumNode);
        } else {
          // emit enum inside TypeScript namespace
          namespace.push(enumNode);
        }
      }
    }
  }

  const type = schemaToType({
    context,
    plugin,
    schema: {
      ...schema,
      type: undefined,
    },
  });
  return type;
};

const numberTypeToIdentifier = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'number'>;
}) => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.ots.number(schema.const as number),
    });
  }

  return compiler.keywordTypeNode({
    keyword: 'number',
  });
};

const objectTypeToIdentifier = ({
  context,
  namespace,
  plugin,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  plugin: Plugin<Config>;
  schema: SchemaWithType<'object'>;
}) => {
  let indexProperty: Property | undefined;
  const schemaProperties: Array<Property> = [];
  let indexPropertyItems: Array<IRSchemaObject> = [];
  const required = schema.required ?? [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name];
    const isRequired = required.includes(name);
    digitsRegExp.lastIndex = 0;
    schemaProperties.push({
      comment: parseSchemaJsDoc({ schema: property }),
      isReadOnly: property.accessScope === 'read',
      isRequired,
      name: digitsRegExp.test(name)
        ? ts.factory.createNumericLiteral(name)
        : name,
      type: schemaToType({
        $ref: `${irRef}${name}`,
        context,
        namespace,
        plugin,
        schema: property,
      }),
    });
    indexPropertyItems.push(property);

    if (!isRequired) {
      hasOptionalProperties = true;
    }
  }

  if (
    schema.additionalProperties &&
    (schema.additionalProperties.type !== 'never' || !indexPropertyItems.length)
  ) {
    if (schema.additionalProperties.type === 'never') {
      indexPropertyItems = [schema.additionalProperties];
    } else {
      indexPropertyItems.unshift(schema.additionalProperties);
    }

    if (hasOptionalProperties) {
      indexPropertyItems.push({
        type: 'undefined',
      });
    }

    indexProperty = {
      isRequired: true,
      name: 'key',
      type: schemaToType({
        context,
        namespace,
        plugin,
        schema:
          indexPropertyItems.length === 1
            ? indexPropertyItems[0]
            : {
                items: indexPropertyItems,
                logicalOperator: 'or',
              },
      }),
    };
  }

  return compiler.typeInterfaceNode({
    indexProperty,
    properties: schemaProperties,
    useLegacyResolution: false,
  });
};

const stringTypeToIdentifier = ({
  context,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'string'>;
}) => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.stringLiteral({ text: schema.const as string }),
    });
  }

  if (schema.format) {
    if (schema.format === 'binary') {
      return compiler.typeUnionNode({
        types: [
          compiler.typeReferenceNode({
            typeName: 'Blob',
          }),
          compiler.typeReferenceNode({
            typeName: 'File',
          }),
        ],
      });
    }

    if (schema.format === 'date-time' || schema.format === 'date') {
      // TODO: parser - add ability to skip type transformers
      if (context.config.plugins['@hey-api/transformers']?.dates) {
        return compiler.typeReferenceNode({ typeName: 'Date' });
      }
    }
  }

  return compiler.keywordTypeNode({
    keyword: 'string',
  });
};

const tupleTypeToIdentifier = ({
  context,
  namespace,
  plugin,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  plugin: Plugin<Config>;
  schema: SchemaWithType<'tuple'>;
}) => {
  const itemTypes: Array<ts.TypeNode> = [];

  for (const item of schema.items ?? []) {
    itemTypes.push(
      schemaToType({
        context,
        namespace,
        plugin,
        schema: item,
      }),
    );
  }

  return compiler.typeTupleNode({
    types: itemTypes,
  });
};

const schemaTypeToIdentifier = ({
  $ref,
  context,
  namespace,
  plugin,
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace: Array<ts.Statement>;
  plugin: Plugin<Config>;
  schema: IRSchemaObject;
}): ts.TypeNode => {
  switch (schema.type as Required<IRSchemaObject>['type']) {
    case 'array':
      return arrayTypeToIdentifier({
        context,
        namespace,
        plugin,
        schema: schema as SchemaWithType<'array'>,
      });
    case 'boolean':
      return booleanTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToIdentifier({
        $ref,
        context,
        namespace,
        plugin,
        schema: schema as SchemaWithType<'enum'>,
      });
    case 'never':
      return compiler.keywordTypeNode({
        keyword: 'never',
      });
    case 'null':
      return compiler.literalTypeNode({
        literal: compiler.null(),
      });
    case 'number':
      return numberTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'number'>,
      });
    case 'object':
      return objectTypeToIdentifier({
        context,
        namespace,
        plugin,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return stringTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      return tupleTypeToIdentifier({
        context,
        namespace,
        plugin,
        schema: schema as SchemaWithType<'tuple'>,
      });
    case 'undefined':
      return compiler.keywordTypeNode({
        keyword: 'undefined',
      });
    case 'unknown':
      return compiler.keywordTypeNode({
        keyword: 'unknown',
      });
    case 'void':
      return compiler.keywordTypeNode({
        keyword: 'void',
      });
  }
};

const irParametersToIrSchema = ({
  parameters,
}: {
  parameters: Record<string, IRParameterObject>;
}): IRSchemaObject => {
  const irSchema: IRSchemaObject = {
    type: 'object',
  };

  if (parameters) {
    const properties: Record<string, IRSchemaObject> = {};
    const required: Array<string> = [];

    for (const name in parameters) {
      const parameter = parameters[name];

      properties[name] = deduplicateSchema({
        schema: parameter.schema,
      });

      if (parameter.required) {
        required.push(name);
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
  context,
  operation,
  plugin,
}: {
  context: IRContext;
  operation: IROperationObject;
  plugin: Plugin<Config>;
}) => {
  const data: IRSchemaObject = {
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

  if (operation.parameters) {
    // TODO: parser - handle cookie parameters

    // do not set headers to never so we can always pass arbitrary values
    if (operation.parameters.header) {
      data.properties.headers = irParametersToIrSchema({
        parameters: operation.parameters.header,
      });

      if (data.properties.headers.required) {
        dataRequired.push('headers');
      }
    }

    if (operation.parameters.path) {
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

  data.properties.url = {
    const: operation.path,
    type: 'string',
  };
  dataRequired.push('url');

  data.required = dataRequired;

  const identifier = context.file({ id: typesId })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'data' }),
    create: true,
    namespace: 'type',
  });
  const node = compiler.typeAliasDeclaration({
    exportType: true,
    name: identifier.name || '',
    type: schemaToType({
      context,
      plugin,
      schema: data,
    }),
  });
  context.file({ id: typesId })!.add(node);
};

const operationToType = ({
  context,
  operation,
  plugin,
}: {
  context: IRContext;
  operation: IROperationObject;
  plugin: Plugin<Config>;
}) => {
  operationToDataType({
    context,
    operation,
    plugin,
  });

  const file = context.file({ id: typesId })!;

  const { error, errors, response, responses } =
    operationResponsesMap(operation);

  if (errors) {
    const identifierErrors = file.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'errors' }),
      create: true,
      namespace: 'type',
    });
    if (identifierErrors.name) {
      const node = compiler.typeAliasDeclaration({
        exportType: true,
        name: identifierErrors.name,
        type: schemaToType({
          context,
          plugin,
          schema: errors,
        }),
      });
      file.add(node);

      if (error) {
        const identifierError = file.identifier({
          $ref: operationIrRef({ id: operation.id, type: 'error' }),
          create: true,
          namespace: 'type',
        });
        if (identifierError.name) {
          const errorsType = compiler.typeReferenceNode({
            typeName: identifierErrors.name,
          });
          const keyofType = ts.factory.createTypeOperatorNode(
            ts.SyntaxKind.KeyOfKeyword,
            errorsType,
          );
          const node = compiler.typeAliasDeclaration({
            exportType: true,
            name: identifierError.name,
            type: compiler.indexedAccessTypeNode({
              indexType: keyofType,
              objectType: errorsType,
            }),
          });
          file.add(node);
        }
      }
    }
  }

  if (responses) {
    const identifierResponses = file.identifier({
      $ref: operationIrRef({ id: operation.id, type: 'responses' }),
      create: true,
      namespace: 'type',
    });
    if (identifierResponses.name) {
      const node = compiler.typeAliasDeclaration({
        exportType: true,
        name: identifierResponses.name,
        type: schemaToType({
          context,
          plugin,
          schema: responses,
        }),
      });
      file.add(node);

      if (response) {
        const identifierResponse = file.identifier({
          $ref: operationIrRef({ id: operation.id, type: 'response' }),
          create: true,
          namespace: 'type',
        });
        if (identifierResponse.name) {
          const responsesType = compiler.typeReferenceNode({
            typeName: identifierResponses.name,
          });
          const keyofType = ts.factory.createTypeOperatorNode(
            ts.SyntaxKind.KeyOfKeyword,
            responsesType,
          );
          const node = compiler.typeAliasDeclaration({
            exportType: true,
            name: identifierResponse.name,
            type: compiler.indexedAccessTypeNode({
              indexType: keyofType,
              objectType: responsesType,
            }),
          });
          file.add(node);
        }
      }
    }
  }
};

export const schemaToType = ({
  $ref,
  context,
  namespace = [],
  plugin,
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace?: Array<ts.Statement>;
  plugin: Plugin<Config>;
  schema: IRSchemaObject;
}): ts.TypeNode => {
  let type: ts.TypeNode | undefined;

  if (schema.$ref) {
    const identifier = context.file({ id: typesId })!.identifier({
      $ref: schema.$ref,
      create: true,
      namespace: 'type',
    });
    type = compiler.typeReferenceNode({
      typeName: identifier.name || '',
    });
  } else if (schema.type) {
    type = schemaTypeToIdentifier({
      $ref,
      context,
      namespace,
      plugin,
      schema,
    });
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });
    if (schema.items) {
      const itemTypes = schema.items.map((item) =>
        schemaToType({
          context,
          namespace,
          plugin,
          schema: item,
        }),
      );
      type =
        schema.logicalOperator === 'and'
          ? compiler.typeIntersectionNode({ types: itemTypes })
          : compiler.typeUnionNode({ types: itemTypes });
    } else {
      type = schemaToType({
        context,
        namespace,
        plugin,
        schema,
      });
    }
  } else {
    // catch-all fallback for failed schemas
    type = schemaTypeToIdentifier({
      context,
      namespace,
      plugin,
      schema: {
        type: 'unknown',
      },
    });
  }

  // emit nodes only if $ref points to a reusable component
  if ($ref && isRefOpenApiComponent($ref)) {
    // emit namespace if it has any members
    if (namespace.length) {
      const identifier = context.file({ id: typesId })!.identifier({
        $ref,
        create: true,
        namespace: 'value',
      });
      const node = compiler.namespaceDeclaration({
        name: identifier.name || '',
        statements: namespace,
      });
      context.file({ id: typesId })!.add(node);
    }

    // enum handler emits its own artifacts
    if (schema.type !== 'enum') {
      const identifier = context.file({ id: typesId })!.identifier({
        $ref,
        create: true,
        namespace: 'type',
      });
      const node = compiler.typeAliasDeclaration({
        comment: parseSchemaJsDoc({ schema }),
        exportType: true,
        name: identifier.name || '',
        type,
      });
      context.file({ id: typesId })!.add(node);
    }
  }

  return type;
};

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  context.createFile({
    id: typesId,
    path: plugin.output,
  });

  context.subscribe('schema', ({ $ref, schema }) => {
    schemaToType({
      $ref,
      context,
      plugin,
      schema,
    });
  });

  context.subscribe('parameter', ({ $ref, parameter }) => {
    schemaToType({
      $ref,
      context,
      plugin,
      schema: parameter.schema,
    });
  });

  context.subscribe('requestBody', ({ $ref, requestBody }) => {
    schemaToType({
      $ref,
      context,
      plugin,
      schema: requestBody.schema,
    });
  });

  context.subscribe('operation', ({ operation }) => {
    operationToType({
      context,
      operation,
      plugin,
    });
  });
};
