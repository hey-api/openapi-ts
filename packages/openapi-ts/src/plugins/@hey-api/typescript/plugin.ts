import type { ICodegenSymbolOut } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TypeScriptRenderer } from '../../../generate/renderer';
import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { ensureValidIdentifier } from '../../../openApi/shared/utils/identifier';
import { buildName } from '../../../openApi/shared/utils/name';
import type { Property } from '../../../tsc';
import { tsc } from '../../../tsc';
import { refToName } from '../../../utils/ref';
import { stringCase } from '../../../utils/stringCase';
import { fieldName } from '../../shared/utils/case';
import { createSchemaComment } from '../../shared/utils/schema';
import { createClientOptions } from './clientOptions';
import { exportType } from './export';
import { operationToType } from './operation';
import type { HeyApiTypeScriptPlugin, PluginState } from './types';
import { webhookToType } from './webhook';
import { createWebhooks } from './webhooks';

export type OnRef = (symbol: ICodegenSymbolOut) => void;

interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

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
      const f = plugin.gen.ensureFile(plugin.output);
      const typeNode = typeTransformer({ file: f, schema });
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
  const f = plugin.gen.ensureFile(plugin.output);

  if (schema.$ref) {
    const symbol = f.ensureSymbol({
      selector: plugin.api.getSelector('ref', schema.$ref),
    });
    if (onRef) {
      onRef(symbol);
    }
    return tsc.typeReferenceNode({ typeName: symbol.placeholder });
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
  const type = schemaToType({ onRef: undefined, plugin, schema, state });
  const f = plugin.gen.ensureFile(plugin.output);
  const symbol = f
    .ensureSymbol({ selector: plugin.api.getSelector('ref', id) })
    .update({
      name: buildName({
        config: plugin.config.definitions,
        name: refToName(id),
      }),
    });
  exportType({
    plugin,
    schema,
    symbol,
    type,
  });
};

export const handler: HeyApiTypeScriptPlugin['Handler'] = ({ plugin }) => {
  const f = plugin.gen.createFile(plugin.output, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  // reserve identifier for ClientOptions
  const symbolClientOptions = f.addSymbol({
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'ClientOptions',
    }),
    selector: plugin.api.getSelector('ClientOptions'),
  });
  // reserve identifier for Webhooks
  const symbolWebhooks = f.addSymbol({
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'Webhooks',
    }),
    selector: plugin.api.getSelector('Webhooks'),
  });

  const servers: Array<IR.ServerObject> = [];
  const state: PluginState = {
    usedTypeIDs: new Set(),
  };
  const webhookNames: Array<string> = [];

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'server',
    'webhook',
    (event) => {
      switch (event.type) {
        case 'operation':
          operationToType({ operation: event.operation, plugin, state });
          break;
        case 'parameter':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.parameter.schema,
            state,
          });
          break;
        case 'requestBody':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.requestBody.schema,
            state,
          });
          break;
        case 'schema':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.schema,
            state,
          });
          break;
        case 'server':
          servers.push(event.server);
          break;
        case 'webhook':
          webhookNames.push(
            webhookToType({
              operation: event.operation,
              plugin,
              state,
            }),
          );
          break;
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
    const symbolTypeId = f.addSymbol({ name: 'TypeID' });
    const node = tsc.typeAliasDeclaration({
      exportType: true,
      name: symbolTypeId.placeholder,
      type: tsc.templateLiteralType({
        value: [
          tsc.typeReferenceNode({ typeName: 'T' }),
          '_',
          tsc.keywordTypeNode({ keyword: 'string' }),
        ],
      }),
      typeParameters: [typeParameter],
    });
    symbolTypeId.update({ value: node });

    for (const name of state.usedTypeIDs.values()) {
      const symbolTypeName = f.addSymbol({
        name: ensureValidIdentifier(
          stringCase({
            case: plugin.config.case,
            value: `${name}_id`,
          }),
        ),
      });
      const node = tsc.typeAliasDeclaration({
        exportType: true,
        name: symbolTypeName.placeholder,
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.literalTypeNode({
              literal: tsc.stringLiteral({ text: name }),
            }),
          ],
          typeName: symbolTypeId.placeholder,
        }),
      });
      symbolTypeName.update({ value: node });
    }
  }

  createClientOptions({ plugin, servers, symbolClientOptions });
  createWebhooks({ symbolWebhooks, webhookNames });

  if (plugin.config.exportFromIndex && f.hasContent()) {
    const index = plugin.gen.ensureFile('index');
    index.addExport({ from: f, namespaceImport: true });
  }
};
