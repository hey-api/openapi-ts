import type ts from 'typescript';

import { deduplicateSchema } from '../../../ir/schema';
import type { IR } from '../../../ir/types';
import { buildName } from '../../../openApi/shared/utils/name';
import type { Property } from '../../../tsc';
import { tsc } from '../../../tsc';
import { refToName } from '../../../utils/ref';
import { stringCase } from '../../../utils/stringCase';
import { fieldName } from '../../shared/utils/case';
import { createSchemaComment } from '../../shared/utils/schema';
import type { SchemaWithType } from '../../zod/shared/types';
import { createClientOptions } from './clientOptions';
import { exportType } from './export';
import { operationToType } from './operation';
import type { HeyApiTypeScriptPlugin } from './types';
import { webhookToType } from './webhook';
import { createWebhooks } from './webhooks';

const arrayTypeToIdentifier = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'array'>;
}): ts.TypeNode => {
  if (!schema.items) {
    return tsc.typeArrayNode(
      tsc.keywordTypeNode({ keyword: plugin.config.topType }),
    );
  }

  schema = deduplicateSchema({ detectFormat: true, schema });

  const itemTypes: Array<ts.TypeNode> = [];

  for (const item of schema.items!) {
    const type = schemaToType({
      plugin,
      schema: item,
    });
    itemTypes.push(type);
  }

  // Handle non-empty arrays with minItems >= 1 and no maxItems
  if (
    schema.minItems &&
    schema.minItems >= 1 &&
    !schema.maxItems &&
    schema.minItems <= 100 &&
    itemTypes.length === 1
  ) {
    return tsc.nonEmptyArrayTupleNode(itemTypes[0]!, schema.minItems);
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
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): ts.TypeNode => {
  const type = schemaToType({
    plugin,
    schema: {
      ...schema,
      type: undefined,
    },
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
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'object'>;
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
      plugin,
      schema: property,
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
              plugin,
              schema: indexPropertyItems[0]!,
            })
          : schemaToType({
              plugin,
              schema: { items: indexPropertyItems, logicalOperator: 'or' },
            }),
    };

    if (schema.propertyNames?.$ref) {
      indexKey = schemaToType({
        plugin,
        schema: {
          $ref: schema.propertyNames.$ref,
        },
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
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'string'>;
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

      const selector = plugin.api.getSelector('TypeID', type);
      if (!plugin.getSymbol(selector)) {
        const selectorTypeId = plugin.api.getSelector('TypeID');

        if (!plugin.getSymbol(selectorTypeId)) {
          const symbolTypeId = plugin.registerSymbol({
            exported: true,
            meta: {
              kind: 'type',
            },
            name: 'TypeID',
            selector: selectorTypeId,
          });
          const nodeTypeId = tsc.typeAliasDeclaration({
            exportType: symbolTypeId.exported,
            name: symbolTypeId.placeholder,
            type: tsc.templateLiteralType({
              value: [
                tsc.typeReferenceNode({ typeName: 'T' }),
                '_',
                tsc.keywordTypeNode({ keyword: 'string' }),
              ],
            }),
            typeParameters: [
              tsc.typeParameterDeclaration({
                constraint: tsc.keywordTypeNode({
                  keyword: 'string',
                }),
                name: 'T',
              }),
            ],
          });
          plugin.setSymbolValue(symbolTypeId, nodeTypeId);
        }

        const symbolTypeId = plugin.referenceSymbol(selectorTypeId);
        const symbolTypeName = plugin.registerSymbol({
          exported: true,
          meta: {
            kind: 'type',
          },
          name: stringCase({
            case: plugin.config.case,
            value: `${type}_id`,
          }),
          selector,
        });
        const node = tsc.typeAliasDeclaration({
          exportType: symbolTypeName.exported,
          name: symbolTypeName.placeholder,
          type: tsc.typeReferenceNode({
            typeArguments: [
              tsc.literalTypeNode({
                literal: tsc.stringLiteral({ text: type }),
              }),
            ],
            typeName: symbolTypeId.placeholder,
          }),
        });
        plugin.setSymbolValue(symbolTypeName, node);
      }
      const symbol = plugin.referenceSymbol(selector);
      return tsc.typeReferenceNode({ typeName: symbol.placeholder });
    }
  }

  return tsc.keywordTypeNode({
    keyword: 'string',
  });
};

const tupleTypeToIdentifier = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
}): ts.TypeNode => {
  let itemTypes: Array<ts.Expression | ts.TypeNode> = [];

  if (schema.const && Array.isArray(schema.const)) {
    itemTypes = schema.const.map((value) => {
      const expression = tsc.valueToExpression({ value });
      return expression ?? tsc.identifier({ text: plugin.config.topType });
    });
  } else if (schema.items) {
    for (const item of schema.items) {
      const type = schemaToType({
        plugin,
        schema: item,
      });
      itemTypes.push(type);
    }
  }

  return tsc.typeTupleNode({
    types: itemTypes,
  });
};

const schemaTypeToIdentifier = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
}): ts.TypeNode => {
  const transformersPlugin = plugin.getPlugin('@hey-api/transformers');
  if (transformersPlugin?.config.typeTransformers) {
    for (const typeTransformer of transformersPlugin.config.typeTransformers) {
      const typeNode = typeTransformer({ schema });
      if (typeNode) {
        return typeNode;
      }
    }
  }

  switch (schema.type as Required<IR.SchemaObject>['type']) {
    case 'array':
      return arrayTypeToIdentifier({
        plugin,
        schema: schema as SchemaWithType<'array'>,
      });
    case 'boolean':
      return booleanTypeToIdentifier({
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToIdentifier({
        plugin,
        schema: schema as SchemaWithType<'enum'>,
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
        plugin,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return stringTypeToIdentifier({
        plugin,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      return tupleTypeToIdentifier({
        plugin,
        schema: schema as SchemaWithType<'tuple'>,
      });
    case 'undefined':
      return tsc.keywordTypeNode({
        keyword: 'undefined',
      });
    case 'unknown':
      return tsc.keywordTypeNode({
        keyword: plugin.config.topType,
      });
    case 'void':
      return tsc.keywordTypeNode({
        keyword: 'void',
      });
  }
};

export const schemaToType = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
}): ts.TypeNode => {
  if (schema.$ref) {
    const symbol = plugin.referenceSymbol(
      plugin.api.getSelector('ref', schema.$ref),
    );
    return tsc.typeReferenceNode({ typeName: symbol.placeholder });
  }

  if (schema.type) {
    return schemaTypeToIdentifier({ plugin, schema });
  }

  if (schema.items) {
    schema = deduplicateSchema({ detectFormat: false, schema });
    if (schema.items) {
      const itemTypes: Array<ts.TypeNode> = [];

      for (const item of schema.items) {
        const type = schemaToType({ plugin, schema: item });
        itemTypes.push(type);
      }

      return schema.logicalOperator === 'and'
        ? tsc.typeIntersectionNode({ types: itemTypes })
        : tsc.typeUnionNode({ types: itemTypes });
    }

    return schemaToType({ plugin, schema });
  }

  // catch-all fallback for failed schemas
  return schemaTypeToIdentifier({
    plugin,
    schema: {
      type: 'unknown',
    },
  });
};

const handleComponent = ({
  id,
  plugin,
  schema,
}: {
  id: string;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
}) => {
  const type = schemaToType({ plugin, schema });

  // Don't tag enums as 'type' since they export runtime artifacts (values)
  const isEnum = schema.type === 'enum' && plugin.config.enums.enabled;

  const symbol = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: isEnum ? undefined : 'type',
    },
    name: buildName({
      config: plugin.config.definitions,
      name: refToName(id),
    }),
    selector: plugin.api.getSelector('ref', id),
  });
  exportType({
    plugin,
    schema,
    symbol,
    type,
  });
};

export const handler: HeyApiTypeScriptPlugin['Handler'] = ({ plugin }) => {
  // reserve identifier for ClientOptions
  const symbolClientOptions = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
    },
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'ClientOptions',
    }),
    selector: plugin.api.getSelector('ClientOptions'),
  });
  // reserve identifier for Webhooks
  const symbolWebhooks = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
    },
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'Webhooks',
    }),
    selector: plugin.api.getSelector('Webhooks'),
  });

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
      switch (event.type) {
        case 'operation':
          operationToType({ operation: event.operation, plugin });
          break;
        case 'parameter':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.parameter.schema,
          });
          break;
        case 'requestBody':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.requestBody.schema,
          });
          break;
        case 'schema':
          handleComponent({
            id: event.$ref,
            plugin,
            schema: event.schema,
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
            }),
          );
          break;
      }
    },
  );

  createClientOptions({ plugin, servers, symbolClientOptions });
  createWebhooks({ plugin, symbolWebhooks, webhookNames });
};
