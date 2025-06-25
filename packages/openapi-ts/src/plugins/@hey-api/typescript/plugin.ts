import ts from 'typescript';

import type { Property } from '../../../compiler';
import { compiler } from '../../../compiler';
import { operationResponsesMap } from '../../../ir/operation';
import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { irRef, isRefOpenApiComponent, refToName } from '../../../utils/ref';
import { numberRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { fieldName } from '../../shared/utils/case';
import { operationIrRef } from '../../shared/utils/ref';
import { createSchemaComment } from '../../shared/utils/schema';
import { createClientOptions } from './clientOptions';
import { typesId } from './ref';
import type { HeyApiTypeScriptPlugin } from './types';

interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

interface State {
  /**
   * If set, we keep the specified properties (read-only or write-only) and
   * strip the other type.
   */
  accessScope?: 'read' | 'write';
  /**
   * Path to the currently processed field. This can be used to generate
   * deduplicated inline types. For example, if two schemas define a different
   * enum `foo`, we want to generate two unique types instead of one.
   */
  path: ReadonlyArray<string>;
}

const scopeToRef = ({
  $ref,
  accessScope,
  plugin,
}: {
  $ref: string;
  accessScope?: 'both' | 'read' | 'write';
  plugin: HeyApiTypeScriptPlugin['Instance'];
}) => {
  if (!accessScope || accessScope === 'both') {
    return $ref;
  }

  const refParts = $ref.split('/');
  const name = refParts.pop()!;
  const nameBuilder =
    accessScope === 'read'
      ? plugin.config.readableNameBuilder
      : plugin.config.writableNameBuilder;
  const processedName = processNameBuilder({ name, nameBuilder });
  refParts.push(processedName);
  return refParts.join('/');
};

const processNameBuilder = ({
  name,
  nameBuilder,
}: {
  name: string;
  nameBuilder: string | undefined;
}) => {
  if (!nameBuilder) {
    return name;
  }

  return nameBuilder.replace('{{name}}', name);
};

const shouldSkipSchema = ({
  schema,
  state,
}: {
  schema: IR.SchemaObject;
  state: State | undefined;
}) => {
  const stateAccessScope = state?.accessScope;

  if (!stateAccessScope) {
    return false;
  }

  if (schema.accessScope && stateAccessScope !== schema.accessScope) {
    return true;
  }

  if (
    schema.$ref &&
    schema.accessScopes &&
    !schema.accessScopes.includes(stateAccessScope) &&
    !schema.accessScopes.includes('both')
  ) {
    return true;
  }

  if (
    (schema.type === 'array' || schema.type === 'tuple') &&
    schema.items &&
    schema.items.every(
      (item) =>
        item.accessScopes &&
        !item.accessScopes.includes(stateAccessScope) &&
        !item.accessScopes.includes('both'),
    )
  ) {
    return true;
  }

  return false;
};

const addJavaScriptEnum = ({
  $ref,
  plugin,
  schema,
}: {
  $ref: string;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}) => {
  const file = plugin.context.file({ id: typesId })!;
  const identifier = file.identifier({
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

  const enumObject = schemaToEnumObject({ plugin, schema });

  // JavaScript enums might want to ignore null values
  if (
    plugin.config.enums.constantsIgnoreNull &&
    enumObject.typeofItems.includes('object')
  ) {
    enumObject.obj = enumObject.obj.filter((item) => item.value !== null);
  }

  const expression = compiler.objectExpression({
    multiLine: true,
    obj: enumObject.obj,
  });
  const node = compiler.constVariable({
    assertion: 'const',
    comment: createSchemaComment({ schema }),
    exportConst: true,
    expression,
    name: identifier.name || '',
  });
  return node;
};

const schemaToEnumObject = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
}) => {
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

  const obj = (schema.items ?? []).map((item, index) => {
    const typeOfItemConst = typeof item.const;

    if (!typeofItems.includes(typeOfItemConst)) {
      // track types of enum values because some modes support
      // only enums with string and number types
      typeofItems.push(typeOfItemConst);
    }

    let key: string | undefined;
    if (item.title) {
      key = item.title;
    } else if (typeOfItemConst === 'number' || typeOfItemConst === 'string') {
      key = `${item.const}`;
    } else if (typeOfItemConst === 'boolean') {
      key = item.const ? 'true' : 'false';
    } else if (item.const === null) {
      key = 'null';
    } else {
      key = `${index}`;
    }

    if (key) {
      key = stringCase({
        case: plugin.config.enums.case,
        stripLeadingSeparators: false,
        value: key,
      });

      numberRegExp.lastIndex = 0;
      // TypeScript enum keys cannot be numbers
      if (
        numberRegExp.test(key) &&
        plugin.config.enums.enabled &&
        (plugin.config.enums.type === 'typescript' ||
          plugin.config.enums.type === 'typescript+namespace')
      ) {
        key = `_${key}`;
      }
    }

    return {
      comments: createSchemaComment({ schema: item }),
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
  plugin,
  schema,
  state,
}: {
  $ref: string;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
  state: State | undefined;
}): ts.TypeAliasDeclaration | undefined => {
  const file = plugin.context.file({ id: typesId })!;
  const identifier = file.identifier({
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
    plugin.config.enums.type !== 'typescript+namespace'
  ) {
    return;
  }

  const type = schemaToType({
    plugin,
    schema: {
      ...schema,
      type: undefined,
    },
    state,
  });

  if (type) {
    const node = compiler.typeAliasDeclaration({
      comment: createSchemaComment({ schema }),
      exportType: true,
      name: identifier.name || '',
      type,
    });
    return node;
  }

  return;
};

const shouldCreateTypeScriptEnum = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}) => {
  const enumObject = schemaToEnumObject({ plugin, schema });
  // TypeScript enums support only string and number values
  return !enumObject.typeofItems.filter(
    (type) => type !== 'number' && type !== 'string',
  ).length;
};

const addTypeScriptEnum = ({
  $ref,
  plugin,
  schema,
  state,
}: {
  $ref: string;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
  state: State | undefined;
}) => {
  const enumObject = schemaToEnumObject({ plugin, schema });

  // fallback to types
  if (!shouldCreateTypeScriptEnum({ plugin, schema })) {
    const node = addTypeEnum({
      $ref,
      plugin,
      schema,
      state,
    });
    return node;
  }

  const file = plugin.context.file({ id: typesId })!;
  const identifier = file.identifier({
    $ref,
    create: true,
    namespace: 'enum',
  });
  const node = compiler.enumDeclaration({
    leadingComment: createSchemaComment({ schema }),
    name: identifier.name || '',
    obj: enumObject.obj,
  });
  return node;
};

const arrayTypeToIdentifier = ({
  namespace,
  plugin,
  schema,
  state,
}: {
  namespace: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  if (!schema.items) {
    return compiler.typeArrayNode(
      compiler.keywordTypeNode({
        keyword: 'unknown',
      }),
    );
  }

  schema = deduplicateSchema({ detectFormat: false, schema });

  const itemTypes: Array<ts.TypeNode> = [];

  for (const item of schema.items!) {
    const type = schemaToType({
      namespace,
      plugin,
      schema: item,
      state,
    });

    if (type) {
      itemTypes.push(type);
    }
  }

  if (!itemTypes.length) {
    return;
  }

  if (itemTypes.length === 1) {
    return compiler.typeArrayNode(itemTypes[0]!);
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
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'boolean'>;
}): ts.TypeNode => {
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
  namespace,
  plugin,
  schema,
  state,
}: {
  $ref?: string;
  namespace: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  const file = plugin.context.file({ id: typesId })!;
  const isRefComponent = $ref ? isRefOpenApiComponent($ref) : false;
  const shouldExportEnum =
    isRefComponent ||
    (plugin.config.enums.enabled && Boolean(plugin.config.enums.exportInline));

  if ($ref && shouldExportEnum) {
    // when enums are disabled (default), emit only reusable components
    // as types, otherwise the output would be broken if we skipped all enums
    if (!plugin.config.enums.enabled) {
      const typeNode = addTypeEnum({
        $ref,
        plugin,
        schema,
        state,
      });
      if (typeNode) {
        file.add(typeNode);
      }
    }

    if (plugin.config.enums.enabled) {
      if (plugin.config.enums.type === 'javascript') {
        const typeNode = addTypeEnum({
          $ref,
          plugin,
          schema,
          state,
        });
        if (typeNode) {
          file.add(typeNode);
        }

        const objectNode = addJavaScriptEnum({
          $ref,
          plugin,
          schema,
        });
        if (objectNode) {
          file.add(objectNode);
        }
      }

      if (plugin.config.enums.type === 'typescript') {
        const enumNode = addTypeScriptEnum({
          $ref,
          plugin,
          schema,
          state,
        });
        if (enumNode) {
          file.add(enumNode);
        }
      }

      if (plugin.config.enums.type === 'typescript+namespace') {
        const enumNode = addTypeScriptEnum({
          $ref,
          plugin,
          schema,
          state,
        });
        if (enumNode) {
          if (isRefComponent) {
            file.add(enumNode);
          } else {
            // emit enum inside TypeScript namespace
            namespace.push(enumNode);
          }
        }
      }
    }
  }

  const type = schemaToType({
    plugin,
    schema: {
      ...schema,
      type: undefined,
    },
    state,
  });
  return type;
};

const numberTypeToIdentifier = ({
  plugin,
  schema,
}: {
  namespace: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'integer' | 'number'>;
}): ts.TypeNode => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.ots.number(schema.const as number),
    });
  }

  if (schema.type === 'integer' && schema.format === 'int64') {
    // TODO: parser - add ability to skip type transformers
    if (plugin.getPlugin('@hey-api/transformers')?.config.bigInt) {
      return compiler.typeReferenceNode({ typeName: 'bigint' });
    }
  }

  return compiler.keywordTypeNode({
    keyword: 'number',
  });
};

const objectTypeToIdentifier = ({
  namespace,
  plugin,
  schema,
  state,
}: {
  namespace: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  // TODO: parser - handle constants
  let indexKey: string | undefined;
  let indexProperty: Property | undefined;
  const schemaProperties: Array<Property> = [];
  let indexPropertyItems: Array<IR.SchemaObject> = [];
  const required = schema.required ?? [];
  let hasOptionalProperties = false;
  let hasSkippedProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;

    const skip = shouldSkipSchema({
      schema: property,
      state,
    });

    if (skip) {
      hasSkippedProperties = true;
      continue;
    }

    const propertyType = schemaToType({
      $ref: state ? [...state.path, name].join('/') : `${irRef}${name}`,
      namespace,
      plugin,
      schema: property,
      state,
    });

    if (!propertyType) {
      continue;
    }

    const isRequired = required.includes(name);
    schemaProperties.push({
      comment: createSchemaComment({ schema: property }),
      isReadOnly: property.accessScope === 'read',
      isRequired,
      name: fieldName({ context: plugin.context, name }),
      type: propertyType,
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
      isRequired: !schema.propertyNames,
      name: 'key',
      type: schemaToType({
        namespace,
        plugin,
        schema:
          indexPropertyItems.length === 1
            ? indexPropertyItems[0]!
            : {
                items: indexPropertyItems,
                logicalOperator: 'or',
              },
        state,
      }),
    };

    if (schema.propertyNames) {
      if (schema.propertyNames.$ref) {
        indexKey = refToName(schema.propertyNames.$ref);
      }
    }
  }

  if (hasSkippedProperties && !schemaProperties.length && !indexProperty) {
    return;
  }

  return compiler.typeInterfaceNode({
    indexKey,
    indexProperty,
    properties: schemaProperties,
    useLegacyResolution: false,
  });
};

const stringTypeToIdentifier = ({
  plugin,
  schema,
}: {
  namespace: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): ts.TypeNode => {
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
      if (plugin.getPlugin('@hey-api/transformers')?.config.dates) {
        return compiler.typeReferenceNode({ typeName: 'Date' });
      }
    }
  }

  return compiler.keywordTypeNode({
    keyword: 'string',
  });
};

const tupleTypeToIdentifier = ({
  namespace,
  plugin,
  schema,
  state,
}: {
  namespace: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  let itemTypes: Array<ts.Expression | ts.TypeNode> = [];

  if (schema.const && Array.isArray(schema.const)) {
    itemTypes = schema.const.map((value) => {
      const expression = compiler.valueToExpression({ value });
      return expression ?? compiler.identifier({ text: 'unknown' });
    });
  } else if (schema.items) {
    for (const item of schema.items) {
      const type = schemaToType({
        namespace,
        plugin,
        schema: item,
        state,
      });

      if (type) {
        itemTypes.push(type);
      }
    }
  }

  if (!itemTypes.length) {
    return;
  }

  return compiler.typeTupleNode({
    types: itemTypes,
  });
};

const schemaTypeToIdentifier = ({
  $ref,
  namespace,
  plugin,
  schema,
  state,
}: {
  $ref?: string;
  namespace: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return arrayTypeToIdentifier({
        namespace,
        plugin,
        schema: schema as SchemaWithType<'array'>,
        state,
      });
    case 'boolean':
      return booleanTypeToIdentifier({
        namespace,
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToIdentifier({
        $ref,
        namespace,
        plugin,
        schema: schema as SchemaWithType<'enum'>,
        state,
      });
    case 'integer':
    case 'number':
      return numberTypeToIdentifier({
        namespace,
        plugin,
        schema: schema as SchemaWithType<'integer' | 'number'>,
      });
    case 'never':
      return compiler.keywordTypeNode({
        keyword: 'never',
      });
    case 'null':
      return compiler.literalTypeNode({
        literal: compiler.null(),
      });
    case 'object':
      return objectTypeToIdentifier({
        namespace,
        plugin,
        schema: schema as SchemaWithType<'object'>,
        state,
      });
    case 'string':
      return stringTypeToIdentifier({
        namespace,
        plugin,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      return tupleTypeToIdentifier({
        namespace,
        plugin,
        schema: schema as SchemaWithType<'tuple'>,
        state,
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
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
}) => {
  const file = plugin.context.file({ id: typesId })!;
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

  const identifier = file.identifier({
    $ref: operationIrRef({
      config: plugin.context.config,
      id: operation.id,
      type: 'data',
    }),
    create: true,
    namespace: 'type',
  });
  const type = schemaToType({
    plugin,
    schema: data,
    state:
      plugin.config.readOnlyWriteOnlyBehavior === 'off'
        ? {
            path: [operation.method, operation.path, 'data'],
          }
        : {
            accessScope: 'write',
            path: [operation.method, operation.path, 'data'],
          },
  });

  if (type) {
    const node = compiler.typeAliasDeclaration({
      exportType: true,
      name: identifier.name || '',
      type,
    });
    file.add(node);
  }
};

const operationToType = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
}) => {
  operationToDataType({ operation, plugin });

  const file = plugin.context.file({ id: typesId })!;

  const { error, errors, response, responses } =
    operationResponsesMap(operation);

  if (errors) {
    const identifierErrors = file.identifier({
      $ref: operationIrRef({
        config: plugin.context.config,
        id: operation.id,
        type: 'errors',
      }),
      create: true,
      namespace: 'type',
    });
    if (identifierErrors.name) {
      const type = schemaToType({
        plugin,
        schema: errors,
        state:
          plugin.config.readOnlyWriteOnlyBehavior === 'off'
            ? {
                path: [operation.method, operation.path, 'errors'],
              }
            : {
                accessScope: 'read',
                path: [operation.method, operation.path, 'errors'],
              },
      });

      if (type) {
        const node = compiler.typeAliasDeclaration({
          exportType: true,
          name: identifierErrors.name,
          type,
        });
        file.add(node);
      }

      if (error) {
        const identifierError = file.identifier({
          $ref: operationIrRef({
            config: plugin.context.config,
            id: operation.id,
            type: 'error',
          }),
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
      $ref: operationIrRef({
        config: plugin.context.config,
        id: operation.id,
        type: 'responses',
      }),
      create: true,
      namespace: 'type',
    });
    if (identifierResponses.name) {
      const type = schemaToType({
        plugin,
        schema: responses,
        state:
          plugin.config.readOnlyWriteOnlyBehavior === 'off'
            ? {
                path: [operation.method, operation.path, 'responses'],
              }
            : {
                accessScope: 'read',
                path: [operation.method, operation.path, 'responses'],
              },
      });

      if (type) {
        const node = compiler.typeAliasDeclaration({
          exportType: true,
          name: identifierResponses.name,
          type,
        });
        file.add(node);
      }

      if (response) {
        const identifierResponse = file.identifier({
          $ref: operationIrRef({
            config: plugin.context.config,
            id: operation.id,
            type: 'response',
          }),
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

/**
 * Is this schema split into a readable and writable variant? We won't split
 * schemas if they don't contain any read-only or write-only fields or if they
 * contain ONLY read-only or write-only fields. We split only when there's a
 * mix of different access scopes for the schema.
 */
const isSchemaSplit = ({ schema }: { schema: IR.SchemaObject }): boolean => {
  const scopes = schema.accessScopes;
  return scopes !== undefined && scopes.length > 1;
};

const hasSchemaScope = ({
  accessScope,
  schema,
}: {
  accessScope: Required<State>['accessScope'];
  schema: IR.SchemaObject;
}): boolean => {
  const scopes = schema.accessScopes;
  return (
    !scopes ||
    (scopes !== undefined &&
      (scopes.includes(accessScope) || scopes.includes('both')))
  );
};

export const schemaToType = ({
  $ref,
  namespace = [],
  plugin,
  schema,
  state,
}: {
  $ref?: string;
  namespace?: Array<ts.Statement>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  const file = plugin.context.file({ id: typesId })!;

  let type: ts.TypeNode | undefined;

  if (schema.$ref) {
    const refSchema = plugin.context.resolveIrRef<IR.SchemaObject>(schema.$ref);

    if (
      !state?.accessScope ||
      hasSchemaScope({ accessScope: state.accessScope, schema: refSchema })
    ) {
      const finalRef = scopeToRef({
        $ref: schema.$ref,
        accessScope: isSchemaSplit({ schema: refSchema })
          ? state?.accessScope
          : undefined,
        plugin,
      });
      const identifier = file.identifier({
        $ref: finalRef,
        create: true,
        namespace:
          refSchema.type === 'enum' &&
          plugin.config.enums.enabled &&
          (plugin.config.enums.type === 'typescript' ||
            plugin.config.enums.type === 'typescript+namespace') &&
          shouldCreateTypeScriptEnum({
            plugin,
            schema: refSchema as SchemaWithType<'enum'>,
          })
            ? 'enum'
            : 'type',
      });
      type = compiler.typeReferenceNode({
        typeName: identifier.name || '',
      });
    }
  } else if (schema.type) {
    type = schemaTypeToIdentifier({
      $ref,
      namespace,
      plugin,
      schema,
      state,
    });
  } else if (schema.items) {
    schema = deduplicateSchema({ detectFormat: false, schema });
    if (schema.items) {
      const itemTypes: Array<ts.TypeNode> = [];

      for (const item of schema.items) {
        // TODO: correctly populate state.path
        const type = schemaToType({
          namespace,
          plugin,
          schema: item,
          state,
        });
        if (type) {
          itemTypes.push(type);
        }
      }

      type =
        schema.logicalOperator === 'and'
          ? compiler.typeIntersectionNode({ types: itemTypes })
          : compiler.typeUnionNode({ types: itemTypes });
    } else {
      // TODO: correctly populate state.path
      type = schemaToType({
        namespace,
        plugin,
        schema,
        state,
      });
    }
  } else {
    // catch-all fallback for failed schemas
    type = schemaTypeToIdentifier({
      namespace,
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
  }

  // emit nodes only if $ref points to a reusable component
  if ($ref && isRefOpenApiComponent($ref)) {
    // emit namespace if it has any members
    if (namespace.length) {
      const identifier = file.identifier({
        $ref,
        create: true,
        namespace: 'value',
      });
      const node = compiler.namespaceDeclaration({
        name: identifier.name || '',
        statements: namespace,
      });
      file.add(node);
    }

    // enum handler emits its own artifacts
    if (schema.type !== 'enum' && type) {
      const identifier = file.identifier({
        $ref,
        create: true,
        namespace: 'type',
      });
      const node = compiler.typeAliasDeclaration({
        comment: createSchemaComment({ schema }),
        exportType: true,
        name: identifier.name || '',
        type,
      });
      file.add(node);
    }
  }

  return type;
};

export const handler: HeyApiTypeScriptPlugin['Handler'] = ({ plugin }) => {
  const file = plugin.createFile({
    id: typesId,
    identifierCase: plugin.config.case,
    path: plugin.output,
  });

  // reserve identifier for ClientOptions
  const clientOptions = file.identifier({
    $ref: 'ClientOptions',
    create: true,
    namespace: 'type',
  });

  const servers: Array<IR.ServerObject> = [];

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'server',
    (event) => {
      if (event.type === 'operation') {
        operationToType({ operation: event.operation, plugin });
      } else if (event.type === 'parameter') {
        schemaToType({
          $ref: event.$ref,
          plugin,
          schema: event.parameter.schema,
          state: {
            // TODO: correctly populate state.path
            path: [],
          },
        });
      } else if (event.type === 'requestBody') {
        schemaToType({
          $ref: event.$ref,
          plugin,
          schema: event.requestBody.schema,
          state:
            plugin.config.readOnlyWriteOnlyBehavior === 'off'
              ? {
                  // TODO: correctly populate state.path
                  path: [],
                }
              : {
                  accessScope: 'write',
                  // TODO: correctly populate state.path
                  path: [],
                },
        });
      } else if (event.type === 'schema') {
        if (
          plugin.config.readOnlyWriteOnlyBehavior === 'off' ||
          !isSchemaSplit({ schema: event.schema })
        ) {
          schemaToType({
            $ref: event.$ref,
            plugin,
            schema: event.schema,
            state: {
              // TODO: correctly populate state.path
              path: [],
            },
          });
          return;
        }

        if (hasSchemaScope({ accessScope: 'read', schema: event.schema })) {
          schemaToType({
            $ref: scopeToRef({
              $ref: event.$ref,
              accessScope: 'read',
              plugin,
            }),
            plugin,
            schema: event.schema,
            state: {
              accessScope: 'read',
              // TODO: correctly populate state.path
              path: [],
            },
          });
        }

        if (hasSchemaScope({ accessScope: 'write', schema: event.schema })) {
          schemaToType({
            $ref: scopeToRef({
              $ref: event.$ref,
              accessScope: 'write',
              plugin,
            }),
            plugin,
            schema: event.schema,
            state: {
              accessScope: 'write',
              // TODO: correctly populate state.path
              path: [],
            },
          });
        }
      } else if (event.type === 'server') {
        servers.push(event.server);
      }
    },
  );

  createClientOptions({ identifier: clientOptions, plugin, servers });
};
