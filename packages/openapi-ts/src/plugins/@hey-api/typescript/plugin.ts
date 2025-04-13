import ts from 'typescript';

import type { Property } from '../../../compiler';
import { compiler } from '../../../compiler';
import { operationResponsesMap } from '../../../ir/operation';
import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';
import { irRef, isRefOpenApiComponent } from '../../../utils/ref';
import { numberRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { fieldName } from '../../shared/utils/case';
import { operationIrRef } from '../../shared/utils/ref';
import type { Plugin } from '../../types';
import { createClientOptions } from './clientOptions';
import { typesId } from './ref';
import type { Config } from './types';

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
}

const parseSchemaJsDoc = ({ schema }: { schema: IR.SchemaObject }) => {
  const comments = [
    schema.description && escapeComment(schema.description),
    schema.deprecated && '@deprecated',
  ].filter(Boolean);

  if (!comments.length) {
    return;
  }

  return comments;
};

const scopeToRef = ({
  $ref,
  accessScope,
  plugin,
}: {
  $ref: string;
  accessScope?: 'read' | 'write';
  plugin: Plugin.Instance<Config>;
}) => {
  if (!accessScope) {
    return $ref;
  }

  const refParts = $ref.split('/');
  const name = refParts.pop()!;
  const nameBuilder =
    accessScope === 'read'
      ? plugin.readableNameBuilder
      : plugin.writableNameBuilder;
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
}) =>
  Boolean(
    state?.accessScope &&
      schema.accessScope &&
      state.accessScope !== schema.accessScope,
  );

const addJavaScriptEnum = ({
  $ref,
  context,
  plugin,
  schema,
}: {
  $ref: string;
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  schema: SchemaWithType<'enum'>;
}) => {
  const file = context.file({ id: typesId })!;
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

const schemaToEnumObject = ({
  plugin,
  schema,
}: {
  plugin: Plugin.Instance<Config>;
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

  const obj = (schema.items ?? []).map((item) => {
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
    }

    if (key) {
      key = stringCase({
        case: plugin.enumsCase,
        stripLeadingSeparators: false,
        value: key,
      });

      numberRegExp.lastIndex = 0;
      // TypeScript enum keys cannot be numbers
      if (
        numberRegExp.test(key) &&
        (plugin.enums === 'typescript' ||
          plugin.enums === 'typescript+namespace')
      ) {
        key = `_${key}`;
      }
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
  state,
}: {
  $ref: string;
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  schema: SchemaWithType<'enum'>;
  state: State | undefined;
}): ts.TypeAliasDeclaration | undefined => {
  const file = context.file({ id: typesId })!;
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
    plugin.enums !== 'typescript+namespace'
  ) {
    return;
  }

  const type = schemaToType({
    context,
    plugin,
    schema: {
      ...schema,
      type: undefined,
    },
    state,
  });

  if (type) {
    const node = compiler.typeAliasDeclaration({
      comment: parseSchemaJsDoc({ schema }),
      exportType: true,
      name: identifier.name || '',
      type,
    });
    return node;
  }
};

const addTypeScriptEnum = ({
  $ref,
  context,
  plugin,
  schema,
  state,
}: {
  $ref: string;
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
  schema: SchemaWithType<'enum'>;
  state: State | undefined;
}) => {
  const file = context.file({ id: typesId })!;
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
  if (!identifier.created && plugin.enums !== 'typescript+namespace') {
    return;
  }

  const enumObject = schemaToEnumObject({ plugin, schema });

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
      state,
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
  state,
}: {
  context: IR.Context;
  namespace: Array<ts.Statement>;
  plugin: Plugin.Instance<Config>;
  schema: SchemaWithType<'array'>;
  state: State | undefined;
}): ts.TypeNode => {
  if (!schema.items) {
    return compiler.typeArrayNode(
      compiler.keywordTypeNode({
        keyword: 'unknown',
      }),
    );
  }

  schema = deduplicateSchema({ schema });

  const itemTypes: Array<ts.TypeNode> = [];

  // at least one item is guaranteed (or at least was before read/write only)
  for (const item of schema.items!) {
    const type = schemaToType({
      context,
      namespace,
      plugin,
      schema: item,
      state,
    });

    if (type) {
      itemTypes.push(type);
    }
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
  context: IR.Context;
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
  context,
  namespace,
  plugin,
  schema,
  state,
}: {
  $ref?: string;
  context: IR.Context;
  namespace: Array<ts.Statement>;
  plugin: Plugin.Instance<Config>;
  schema: SchemaWithType<'enum'>;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  const file = context.file({ id: typesId })!;
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
        state,
      });
      if (typeNode) {
        file.add(typeNode);
      }
    }

    if (plugin.enums === 'javascript') {
      const typeNode = addTypeEnum({
        $ref,
        context,
        plugin,
        schema,
        state,
      });
      if (typeNode) {
        file.add(typeNode);
      }

      const objectNode = addJavaScriptEnum({
        $ref,
        context,
        plugin,
        schema,
      });
      if (objectNode) {
        file.add(objectNode);
      }
    }

    if (plugin.enums === 'typescript') {
      const enumNode = addTypeScriptEnum({
        $ref,
        context,
        plugin,
        schema,
        state,
      });
      if (enumNode) {
        file.add(enumNode);
      }
    }

    if (plugin.enums === 'typescript+namespace') {
      const enumNode = addTypeScriptEnum({
        $ref,
        context,
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

  const type = schemaToType({
    context,
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
  context,
  schema,
}: {
  context: IR.Context;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'integer' | 'number'>;
}): ts.TypeNode => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.ots.number(schema.const as number),
    });
  }

  if (schema.type === 'integer' && schema.format === 'int64') {
    // TODO: parser - add ability to skip type transformers
    if (context.config.plugins['@hey-api/transformers']?.bigInt) {
      return compiler.typeReferenceNode({ typeName: 'bigint' });
    }
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
  state,
}: {
  context: IR.Context;
  namespace: Array<ts.Statement>;
  plugin: Plugin.Instance<Config>;
  schema: SchemaWithType<'object'>;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  // TODO: parser - handle constants
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

    const isRequired = required.includes(name);
    schemaProperties.push({
      comment: parseSchemaJsDoc({ schema: property }),
      isReadOnly: property.accessScope === 'read',
      isRequired,
      name: fieldName({ context, name }),
      type: schemaToType({
        $ref: `${irRef}${name}`,
        context,
        namespace,
        plugin,
        schema: property,
        state,
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
            ? indexPropertyItems[0]!
            : {
                items: indexPropertyItems,
                logicalOperator: 'or',
              },
        state,
      }),
    };
  }

  if (hasSkippedProperties && !schemaProperties.length && !indexProperty) {
    return;
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
  context: IR.Context;
  namespace: Array<ts.Statement>;
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
  state,
}: {
  context: IR.Context;
  namespace: Array<ts.Statement>;
  plugin: Plugin.Instance<Config>;
  schema: SchemaWithType<'tuple'>;
  state: State | undefined;
}): ts.TypeNode => {
  let itemTypes: Array<ts.Expression | ts.TypeNode> = [];

  if (schema.const && Array.isArray(schema.const)) {
    itemTypes = schema.const.map((value) => {
      const expression = compiler.valueToExpression({ value });
      return expression ?? compiler.identifier({ text: 'unknown' });
    });
  } else if (schema.items) {
    for (const item of schema.items) {
      const type = schemaToType({
        context,
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
  state,
}: {
  $ref?: string;
  context: IR.Context;
  namespace: Array<ts.Statement>;
  plugin: Plugin.Instance<Config>;
  schema: IR.SchemaObject;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return arrayTypeToIdentifier({
        context,
        namespace,
        plugin,
        schema: schema as SchemaWithType<'array'>,
        state,
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
        state,
      });
    case 'integer':
    case 'number':
      return numberTypeToIdentifier({
        context,
        namespace,
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
        context,
        namespace,
        plugin,
        schema: schema as SchemaWithType<'object'>,
        state,
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

    for (const name in parameters) {
      const parameter = parameters[name]!;

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
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: typesId })!;
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
    $ref: operationIrRef({ id: operation.id, type: 'data' }),
    create: true,
    namespace: 'type',
  });
  const type = schemaToType({
    context,
    plugin,
    schema: data,
    state:
      plugin.readOnlyWriteOnlyBehavior === 'off'
        ? undefined
        : {
            accessScope: 'write',
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
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
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
      const type = schemaToType({
        context,
        plugin,
        schema: errors,
        state:
          plugin.readOnlyWriteOnlyBehavior === 'off'
            ? undefined
            : {
                accessScope: 'read',
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
      const type = schemaToType({
        context,
        plugin,
        schema: responses,
        state:
          plugin.readOnlyWriteOnlyBehavior === 'off'
            ? undefined
            : {
                accessScope: 'read',
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
  state,
}: {
  $ref?: string;
  context: IR.Context;
  namespace?: Array<ts.Statement>;
  plugin: Plugin.Instance<Config>;
  schema: IR.SchemaObject;
  state: State | undefined;
}): ts.TypeNode | undefined => {
  const file = context.file({ id: typesId })!;

  let type: ts.TypeNode | undefined;

  if (schema.$ref) {
    const refSchema = context.resolveIrRef<IR.SchemaObject>(schema.$ref);
    const finalRef = scopeToRef({
      $ref: schema.$ref,
      accessScope: refSchema.accessScopes?.length
        ? state?.accessScope
        : undefined,
      plugin,
    });
    const identifier = file.identifier({
      $ref: finalRef,
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
      state,
    });
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });
    if (schema.items) {
      const itemTypes: Array<ts.TypeNode> = [];

      for (const item of schema.items) {
        const type = schemaToType({
          context,
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
      type = schemaToType({
        context,
        namespace,
        plugin,
        schema,
        state,
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
        comment: parseSchemaJsDoc({ schema }),
        exportType: true,
        name: identifier.name || '',
        type,
      });
      file.add(node);
    }
  }

  return type;
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: typesId,
    identifierCase: plugin.identifierCase,
    path: plugin.output,
  });

  // reserve identifier for ClientOptions
  const clientOptions = file.identifier({
    $ref: 'ClientOptions',
    create: true,
    namespace: 'type',
  });

  context.subscribe('schema', ({ $ref, schema }) => {
    if (
      !schema.accessScopes?.length ||
      plugin.readOnlyWriteOnlyBehavior === 'off'
    ) {
      schemaToType({
        $ref,
        context,
        plugin,
        schema,
        state: undefined,
      });
      return;
    }

    // we need both scopes because as soon as the schema contains one,
    // it cannot be used for both payloads and responses
    schemaToType({
      $ref: scopeToRef({
        $ref,
        accessScope: 'read',
        plugin,
      }),
      context,
      plugin,
      schema,
      state: {
        accessScope: 'read',
      },
    });
    schemaToType({
      $ref: scopeToRef({
        $ref,
        accessScope: 'write',
        plugin,
      }),
      context,
      plugin,
      schema,
      state: {
        accessScope: 'write',
      },
    });
  });

  context.subscribe('parameter', ({ $ref, parameter }) => {
    schemaToType({
      $ref,
      context,
      plugin,
      schema: parameter.schema,
      state: undefined,
    });
  });

  context.subscribe('requestBody', ({ $ref, requestBody }) => {
    schemaToType({
      $ref,
      context,
      plugin,
      schema: requestBody.schema,
      state:
        plugin.readOnlyWriteOnlyBehavior === 'off'
          ? undefined
          : {
              accessScope: 'write',
            },
    });
  });

  context.subscribe('operation', ({ operation }) => {
    operationToType({
      context,
      operation,
      plugin,
    });
  });

  const servers: Array<IR.ServerObject> = [];

  context.subscribe('server', ({ server }) => {
    servers.push(server);
  });

  context.subscribe('after', () => {
    createClientOptions({
      context,
      identifier: clientOptions,
      plugin,
      servers,
    });
  });
};
