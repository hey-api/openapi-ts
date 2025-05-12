import ts from 'typescript';

import type { Property } from '../../../compiler';
import { compiler } from '../../../compiler';
import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { ensureValidIdentifier } from '../../../openApi/shared/utils/identifier';
import { buildName } from '../../../openApi/shared/utils/name';
import { refToName } from '../../../utils/ref';
import { numberRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { fieldName } from '../../shared/utils/case';
import { createSchemaComment } from '../../shared/utils/schema';
import { createClientOptions } from './clientOptions';
import { operationToType } from './operation';
import { typesId } from './ref';
import type { HeyApiTypeScriptPlugin, PluginState } from './types';

export type OnRef = (id: string) => void;

interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

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
        plugin.config.enums.mode === 'typescript'
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

const arrayTypeToIdentifier = ({
  onRef,
  plugin,
  schema,
  state,
}: {
  onRef: OnRef | undefined;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  state: PluginState;
}): ts.TypeNode => {
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
      onRef,
      plugin,
      schema: item,
      state,
    });
    itemTypes.push(type);
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
  onRef,
  plugin,
  schema,
  state,
}: {
  onRef: OnRef | undefined;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
  state: PluginState;
}): ts.TypeNode => {
  const type = schemaToType({
    onRef,
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
  onRef,
  plugin,
  schema,
  state,
}: {
  onRef: OnRef | undefined;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  state: PluginState;
}): ts.TypeNode => {
  // TODO: parser - handle constants
  let indexKey: ts.TypeReferenceNode | undefined;
  let indexProperty: Property | undefined;
  const schemaProperties: Array<Property> = [];
  let indexPropertyItems: Array<IR.SchemaObject> = [];
  const required = schema.required ?? [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const propertyType = schemaToType({
      onRef,
      plugin,
      schema: property,
      state,
    });
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
        onRef,
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

    if (schema.propertyNames?.$ref) {
      indexKey = schemaToType({
        onRef,
        plugin,
        schema: {
          $ref: schema.propertyNames.$ref,
        },
        state,
      }) as ts.TypeReferenceNode;
    }
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
  state,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'string'>;
  state: PluginState;
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

    if (schema.format === 'typeid' && typeof schema.example === 'string') {
      const parts = String(schema.example).split('_');
      parts.pop(); // remove the ID part
      const type = parts.join('_');
      state.usedTypeIDs.add(type);
      const typeName = ensureValidIdentifier(
        stringCase({
          case: plugin.config.case,
          value: type + '_id',
        }),
      );
      return compiler.typeReferenceNode({
        typeName,
      });
    }
  }

  return compiler.keywordTypeNode({
    keyword: 'string',
  });
};

const tupleTypeToIdentifier = ({
  onRef,
  plugin,
  schema,
  state,
}: {
  onRef: OnRef | undefined;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  state: PluginState;
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
        onRef,
        plugin,
        schema: item,
        state,
      });
      itemTypes.push(type);
    }
  }

  return compiler.typeTupleNode({
    types: itemTypes,
  });
};

const schemaTypeToIdentifier = ({
  onRef,
  plugin,
  schema,
  state,
}: {
  onRef: OnRef | undefined;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
  state: PluginState;
}): ts.TypeNode => {
  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return arrayTypeToIdentifier({
        onRef,
        plugin,
        schema: schema as SchemaWithType<'array'>,
        state,
      });
    case 'boolean':
      return booleanTypeToIdentifier({
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToIdentifier({
        onRef,
        plugin,
        schema: schema as SchemaWithType<'enum'>,
        state,
      });
    case 'integer':
    case 'number':
      return numberTypeToIdentifier({
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
        onRef,
        plugin,
        schema: schema as SchemaWithType<'object'>,
        state,
      });
    case 'string':
      return stringTypeToIdentifier({
        plugin,
        schema: schema as SchemaWithType<'string'>,
        state,
      });
    case 'tuple':
      return tupleTypeToIdentifier({
        onRef,
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

export const schemaToType = ({
  onRef,
  plugin,
  schema,
  state,
}: {
  /**
   * Callback that can be used to perform side-effects when we encounter a
   * reference. For example, we might want to import the referenced type.
   */
  onRef: OnRef | undefined;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
  state: PluginState;
}): ts.TypeNode => {
  const file = plugin.context.file({ id: typesId })!;

  if (schema.$ref) {
    if (onRef) {
      onRef(plugin.api.getId({ type: 'ref', value: schema.$ref }));
    }
    return file.getNode(plugin.api.getId({ type: 'ref', value: schema.$ref }))
      .node;
  }

  if (schema.type) {
    return schemaTypeToIdentifier({ onRef, plugin, schema, state });
  }

  if (schema.items) {
    schema = deduplicateSchema({ detectFormat: false, schema });
    if (schema.items) {
      const itemTypes: Array<ts.TypeNode> = [];

      for (const item of schema.items) {
        const type = schemaToType({ onRef, plugin, schema: item, state });
        itemTypes.push(type);
      }

      return schema.logicalOperator === 'and'
        ? compiler.typeIntersectionNode({ types: itemTypes })
        : compiler.typeUnionNode({ types: itemTypes });
    }

    return schemaToType({ onRef, plugin, schema, state });
  }

  // catch-all fallback for failed schemas
  return schemaTypeToIdentifier({
    onRef,
    plugin,
    schema: {
      type: 'unknown',
    },
    state,
  });
};

const exportType = ({
  id,
  plugin,
  schema,
  type,
}: {
  id: string;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
  type: ts.TypeNode;
}) => {
  const file = plugin.context.file({ id: typesId })!;

  const nodeInfo = file.getNode(plugin.api.getId({ type: 'ref', value: id }));

  // root enums have an additional export
  if (schema.type === 'enum' && plugin.config.enums.enabled) {
    const enumObject = schemaToEnumObject({ plugin, schema });

    if (plugin.config.enums.mode === 'javascript') {
      // JavaScript enums might want to ignore null values
      if (
        plugin.config.enums.constantsIgnoreNull &&
        enumObject.typeofItems.includes('object')
      ) {
        enumObject.obj = enumObject.obj.filter((item) => item.value !== null);
      }

      const objectNode = compiler.constVariable({
        assertion: 'const',
        comment: createSchemaComment({ schema }),
        exportConst: nodeInfo.exported,
        expression: compiler.objectExpression({
          multiLine: true,
          obj: enumObject.obj,
        }),
        name: nodeInfo.node,
      });
      file.add(objectNode);

      // TODO: https://github.com/hey-api/openapi-ts/issues/2289
      const typeofType = compiler.typeOfExpression({
        text: nodeInfo.node.typeName as unknown as string,
      }) as unknown as ts.TypeNode;
      const keyofType = ts.factory.createTypeOperatorNode(
        ts.SyntaxKind.KeyOfKeyword,
        typeofType,
      );
      const node = compiler.typeAliasDeclaration({
        comment: createSchemaComment({ schema }),
        exportType: nodeInfo.exported,
        name: nodeInfo.node,
        type: compiler.indexedAccessTypeNode({
          indexType: keyofType,
          objectType: typeofType,
        }),
      });
      file.add(node);
      return;
    } else if (plugin.config.enums.mode === 'typescript') {
      // TypeScript enums support only string and number values
      const shouldCreateTypeScriptEnum = !enumObject.typeofItems.some(
        (type) => type !== 'number' && type !== 'string',
      );
      if (shouldCreateTypeScriptEnum) {
        const enumNode = compiler.enumDeclaration({
          leadingComment: createSchemaComment({ schema }),
          name: nodeInfo.node,
          obj: enumObject.obj,
        });
        file.add(enumNode);
        return;
      }
    }
  }

  const node = compiler.typeAliasDeclaration({
    comment: createSchemaComment({ schema }),
    exportType: nodeInfo.exported,
    name: nodeInfo.node,
    type,
  });
  file.add(node);
};

const handleComponent = ({
  id,
  plugin,
  schema,
  state,
}: {
  id: string;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
  state: PluginState;
}) => {
  const file = plugin.context.file({ id: typesId })!;
  const type = schemaToType({ onRef: undefined, plugin, schema, state });
  const name = buildName({
    config: plugin.config.definitions,
    name: refToName(id),
  });
  file.updateNode(plugin.api.getId({ type: 'ref', value: id }), {
    exported: true,
    name,
  });
  exportType({
    id,
    plugin,
    schema,
    type,
  });
};

export const handler: HeyApiTypeScriptPlugin['Handler'] = ({ plugin }) => {
  const state: PluginState = {
    usedTypeIDs: new Set(),
  };

  const file = plugin.createFile({
    case: plugin.config.case,
    id: typesId,
    path: plugin.output,
  });

  // reserve identifier for ClientOptions
  const clientOptionsName = buildName({
    config: {
      case: plugin.config.case,
    },
    name: 'ClientOptions',
  });
  const clientOptionsNodeInfo = file.updateNode(
    plugin.api.getId({ type: 'ClientOptions' }),
    {
      exported: true,
      name: clientOptionsName,
    },
  );

  const servers: Array<IR.ServerObject> = [];

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'server',
    (event) => {
      if (event.type === 'operation') {
        operationToType({ operation: event.operation, plugin, state });
      } else if (event.type === 'parameter') {
        handleComponent({
          id: event.$ref,
          plugin,
          schema: event.parameter.schema,
          state,
        });
      } else if (event.type === 'requestBody') {
        handleComponent({
          id: event.$ref,
          plugin,
          schema: event.requestBody.schema,
          state,
        });
      } else if (event.type === 'schema') {
        handleComponent({
          id: event.$ref,
          plugin,
          schema: event.schema,
          state,
        });
      } else if (event.type === 'server') {
        servers.push(event.server);
      }
    },
  );

  if (state.usedTypeIDs.size) {
    const typeParameter = compiler.typeParameterDeclaration({
      constraint: compiler.keywordTypeNode({
        keyword: 'string',
      }),
      name: 'T',
    });
    const node = compiler.typeAliasDeclaration({
      exportType: true,
      name: 'TypeID',
      type: compiler.templateLiteralType({
        value: [
          compiler.typeReferenceNode({
            typeName: 'T',
          }),
          '_',
          compiler.keywordTypeNode({
            keyword: 'string',
          }),
        ],
      }),
      typeParameters: [typeParameter],
    });
    file.add(node);

    for (const name of state.usedTypeIDs.values()) {
      const typeName = ensureValidIdentifier(
        stringCase({
          case: plugin.config.case,
          value: name + '_id',
        }),
      );
      const node = compiler.typeAliasDeclaration({
        exportType: true,
        name: typeName,
        type: compiler.typeReferenceNode({
          typeArguments: [
            compiler.literalTypeNode({
              literal: compiler.stringLiteral({ text: name }),
            }),
          ],
          typeName: 'TypeID',
        }),
      });
      file.add(node);
    }
  }

  createClientOptions({ nodeInfo: clientOptionsNodeInfo, plugin, servers });
};
