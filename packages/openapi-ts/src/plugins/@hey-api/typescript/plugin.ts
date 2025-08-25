import ts from 'typescript';

import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { ensureValidIdentifier } from '../../../openApi/shared/utils/identifier';
import { buildName } from '../../../openApi/shared/utils/name';
import type { Property } from '../../../tsc';
import { tsc } from '../../../tsc';
import { refToName } from '../../../utils/ref';
import { numberRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { fieldName } from '../../shared/utils/case';
import { createSchemaComment } from '../../shared/utils/schema';
import { createClientOptions } from './clientOptions';
import { operationToType } from './operation';
import { typesId } from './ref';
import type { HeyApiTypeScriptPlugin, PluginState } from './types';
import { webhookToType } from './webhook';
import { createWebhooks } from './webhooks';

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
    return tsc.typeArrayNode(
      tsc.keywordTypeNode({
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
    return tsc.typeArrayNode(itemTypes[0]!);
  }

  if (schema.logicalOperator === 'and') {
    return tsc.typeArrayNode(tsc.typeIntersectionNode({ types: itemTypes }));
  }

  return tsc.typeArrayNode(tsc.typeUnionNode({ types: itemTypes }));
};

const booleanTypeToIdentifier = ({
  schema,
}: {
  schema: SchemaWithType<'boolean'>;
}): ts.TypeNode => {
  if (schema.const !== undefined) {
    return tsc.literalTypeNode({
      literal: tsc.ots.boolean(schema.const as boolean),
    });
  }

  return tsc.keywordTypeNode({
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
    return tsc.literalTypeNode({
      literal: tsc.ots.number(schema.const as number),
    });
  }

  if (schema.type === 'integer' && schema.format === 'int64') {
    // TODO: parser - add ability to skip type transformers
    if (plugin.getPlugin('@hey-api/transformers')?.config.bigInt) {
      return tsc.typeReferenceNode({ typeName: 'bigint' });
    }
  }

  return tsc.keywordTypeNode({
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

  // include pattern value schemas into the index union
  if (schema.patternProperties) {
    for (const pattern in schema.patternProperties) {
      const ir = schema.patternProperties[pattern]!;
      indexPropertyItems.unshift(ir);
    }
  }

  const hasPatterns =
    !!schema.patternProperties &&
    Object.keys(schema.patternProperties).length > 0;

  const addPropsRaw = schema.additionalProperties;
  const addPropsObj =
    addPropsRaw !== false && addPropsRaw
      ? (addPropsRaw as IR.SchemaObject)
      : undefined;
  const shouldCreateIndex =
    hasPatterns ||
    (!!addPropsObj &&
      (addPropsObj.type !== 'never' || !indexPropertyItems.length));

  if (shouldCreateIndex) {
    // only inject additionalProperties when it’s not "never"
    const addProps = addPropsObj;
    if (addProps && addProps.type !== 'never') {
      indexPropertyItems.unshift(addProps);
    } else if (
      !hasPatterns &&
      !indexPropertyItems.length &&
      addProps &&
      addProps.type === 'never'
    ) {
      // keep "never" only when there are NO patterns and NO explicit properties
      indexPropertyItems = [addProps];
    }

    if (hasOptionalProperties) {
      indexPropertyItems.push({
        type: 'undefined',
      });
    }

    indexProperty = {
      isRequired: !schema.propertyNames,
      name: 'key',
      type:
        indexPropertyItems.length === 1
          ? schemaToType({
              onRef,
              plugin,
              schema: indexPropertyItems[0]!,
              state,
            })
          : schemaToType({
              onRef,
              plugin,
              schema: { items: indexPropertyItems, logicalOperator: 'or' },
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

  // removed duplicate legacy block

  return tsc.typeInterfaceNode({
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
    return tsc.literalTypeNode({
      literal: tsc.stringLiteral({ text: schema.const as string }),
    });
  }

  if (schema.format) {
    if (schema.format === 'binary') {
      return tsc.typeUnionNode({
        types: [
          tsc.typeReferenceNode({
            typeName: 'Blob',
          }),
          tsc.typeReferenceNode({
            typeName: 'File',
          }),
        ],
      });
    }

    if (schema.format === 'date-time' || schema.format === 'date') {
      // TODO: parser - add ability to skip type transformers
      if (plugin.getPlugin('@hey-api/transformers')?.config.dates) {
        return tsc.typeReferenceNode({ typeName: 'Date' });
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
      return tsc.typeReferenceNode({
        typeName,
      });
    }
  }

  return tsc.keywordTypeNode({
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
      const expression = tsc.valueToExpression({ value });
      return expression ?? tsc.identifier({ text: 'unknown' });
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

  return tsc.typeTupleNode({
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
  const transformersPlugin = plugin.getPlugin('@hey-api/transformers');
  if (transformersPlugin?.config.typeTransformers) {
    for (const typeTransformer of transformersPlugin.config.typeTransformers) {
      const file = plugin.context.file({ id: typesId })!;
      const typeNode = typeTransformer({ file, schema });
      if (typeNode) {
        return typeNode;
      }
    }
  }

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
      return tsc.keywordTypeNode({
        keyword: 'never',
      });
    case 'null':
      return tsc.literalTypeNode({
        literal: tsc.null(),
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
      return tsc.keywordTypeNode({
        keyword: 'undefined',
      });
    case 'unknown':
      return tsc.keywordTypeNode({
        keyword: 'unknown',
      });
    case 'void':
      return tsc.keywordTypeNode({
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
        ? tsc.typeIntersectionNode({ types: itemTypes })
        : tsc.typeUnionNode({ types: itemTypes });
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

      const objectNode = tsc.constVariable({
        assertion: 'const',
        comment: createSchemaComment({ schema }),
        exportConst: nodeInfo.exported,
        expression: tsc.objectExpression({
          multiLine: true,
          obj: enumObject.obj,
        }),
        name: nodeInfo.node,
      });
      file.add(objectNode);

      // TODO: https://github.com/hey-api/openapi-ts/issues/2289
      const typeofType = tsc.typeOfExpression({
        text: nodeInfo.node.typeName as unknown as string,
      }) as unknown as ts.TypeNode;
      const keyofType = ts.factory.createTypeOperatorNode(
        ts.SyntaxKind.KeyOfKeyword,
        typeofType,
      );
      const node = tsc.typeAliasDeclaration({
        comment: createSchemaComment({ schema }),
        exportType: nodeInfo.exported,
        name: nodeInfo.node,
        type: tsc.indexedAccessTypeNode({
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
        const enumNode = tsc.enumDeclaration({
          leadingComment: createSchemaComment({ schema }),
          name: nodeInfo.node,
          obj: enumObject.obj,
        });
        file.add(enumNode);
        return;
      }
    }
  }

  const node = tsc.typeAliasDeclaration({
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
  // reserve identifier for Webhooks
  const webhooksName = buildName({
    config: {
      case: plugin.config.case,
    },
    name: 'Webhooks',
  });
  const webhooksNodeInfo = file.updateNode(
    plugin.api.getId({ type: 'Webhooks' }),
    {
      exported: true,
      name: webhooksName,
    },
  );

  const servers: Array<IR.ServerObject> = [];
  const webhookNames: Array<string> = [];

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'server',
    'webhook',
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
      } else if (event.type === 'webhook') {
        const webhookName = webhookToType({
          operation: event.operation,
          plugin,
          state,
        });
        webhookNames.push(webhookName);
      }
    },
  );

  if (state.usedTypeIDs.size) {
    const typeParameter = tsc.typeParameterDeclaration({
      constraint: tsc.keywordTypeNode({
        keyword: 'string',
      }),
      name: 'T',
    });
    const node = tsc.typeAliasDeclaration({
      exportType: true,
      name: 'TypeID',
      type: tsc.templateLiteralType({
        value: [
          tsc.typeReferenceNode({
            typeName: 'T',
          }),
          '_',
          tsc.keywordTypeNode({
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
      const node = tsc.typeAliasDeclaration({
        exportType: true,
        name: typeName,
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.literalTypeNode({
              literal: tsc.stringLiteral({ text: name }),
            }),
          ],
          typeName: 'TypeID',
        }),
      });
      file.add(node);
    }
  }

  createClientOptions({ nodeInfo: clientOptionsNodeInfo, plugin, servers });
  createWebhooks({ nodeInfo: webhooksNodeInfo, plugin, webhookNames });
};
