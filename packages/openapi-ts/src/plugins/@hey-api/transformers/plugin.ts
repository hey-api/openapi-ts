import type { SymbolMeta } from '@hey-api/codegen-core';
import ts from 'typescript';

import { createOperationKey, operationResponsesMap } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { $, isTsDsl } from '~/ts-dsl';
import { refToName } from '~/utils/ref';

import type { HeyApiTransformersPlugin } from './types';

const dataVariableName = 'data';

// Track symbols that are currently being built so recursive references
// can emit calls to transformers that will be implemented later.
const buildingSymbols = new Set<number>();

type Expr = ReturnType<typeof $.fromValue | typeof $.return | typeof $.if>;

const ensureStatements = (
  nodes: Array<Expr | ts.Expression | ts.Statement>,
): Array<ts.Statement | ReturnType<typeof $.return>> =>
  nodes.map((node) => $.stmt(node).$render());

const isNodeReturnStatement = ({
  node,
}: {
  node: ts.Expression | ts.Statement | Expr;
}) => {
  if (isTsDsl(node)) {
    node = node.$render();
  }
  return node.kind === ts.SyntaxKind.ReturnStatement;
};

const schemaResponseTransformerNodes = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTransformersPlugin['Instance'];
  schema: IR.SchemaObject;
}): Array<ts.Expression | ts.Statement | Expr> => {
  const nodes = processSchemaType({
    dataExpression: $(dataVariableName),
    plugin,
    schema,
  });
  // append return statement if one does not already exist
  if (nodes.length) {
    const last = nodes[nodes.length - 1]!;
    if (!isNodeReturnStatement({ node: last })) {
      nodes.push($.return(dataVariableName));
    }
  }
  return nodes;
};

const processSchemaType = ({
  dataExpression,
  plugin,
  schema,
}: {
  dataExpression?:
    | ts.Expression
    | string
    | ReturnType<typeof $.attr | typeof $.expr>;
  plugin: HeyApiTransformersPlugin['Instance'];
  schema: IR.SchemaObject;
}): Array<Expr | ts.Expression | ts.Statement> => {
  if (schema.$ref) {
    const query: SymbolMeta = {
      category: 'transform',
      resource: 'definition',
      resourceId: schema.$ref,
    };

    let symbol = plugin.getSymbol(query);

    if (!symbol) {
      // Register a placeholder symbol immediately and set its value to null
      // as a stop token to prevent infinite recursion for self-referential
      // schemas. We also mark this symbol as "building" so that nested
      // references to it can emit calls that will be implemented later.
      symbol = plugin.registerSymbol({
        meta: query,
        name: buildName({
          config: {
            case: 'camelCase',
            name: '{{name}}SchemaResponseTransformer',
          },
          name: refToName(schema.$ref),
        }),
      });
      plugin.setSymbolValue(symbol, null);
    }

    // Only compute the implementation if the symbol isn't already being built.
    // This prevents infinite recursion on self-referential schemas. We still
    // allow emitting a call when the symbol is currently being built so
    // parent nodes can reference the transformer that will be emitted later.
    const existingValue = plugin.gen.symbols.getValue(symbol.id);
    if (!existingValue && !buildingSymbols.has(symbol.id)) {
      buildingSymbols.add(symbol.id);
      try {
        const refSchema = plugin.context.resolveIrRef<IR.SchemaObject>(
          schema.$ref,
        );
        const nodes = schemaResponseTransformerNodes({
          plugin,
          schema: refSchema,
        });

        if (nodes.length) {
          const node = $.const(symbol).assign(
            // TODO: parser - add types, generate types without transforms
            $.func()
              .param(dataVariableName, (p) => p.type('any'))
              .do(...ensureStatements(nodes)),
          );
          plugin.addNode(node);
        }
      } finally {
        buildingSymbols.delete(symbol.id);
      }
    }

    // Only emit a call if the symbol has a value (implementation) OR the
    // symbol is currently being built (recursive reference) — in the
    // latter case we allow emitting a call that will be implemented later.
    const currentValue = plugin.gen.symbols.getValue(symbol.id);
    if (currentValue || buildingSymbols.has(symbol.id)) {
      const ref = plugin.referenceSymbol(query);
      const callExpression = $(ref).call(dataExpression);

      if (dataExpression) {
        // In a map callback, the item needs to be returned, not just the transformation result
        if (typeof dataExpression === 'string' && dataExpression === 'item') {
          return [$.return(callExpression)];
        }

        return [
          typeof dataExpression === 'string'
            ? callExpression
            : $(dataExpression).assign(callExpression),
        ];
      }
    }

    return [];
  }

  if (schema.type === 'array') {
    if (!dataExpression || typeof dataExpression === 'string') {
      return [];
    }

    // TODO: parser - handle tuples and complex arrays
    const nodes = !schema.items
      ? []
      : processSchemaType({
          dataExpression: 'item',
          plugin,
          schema: schema.items?.[0]
            ? schema.items[0]
            : {
                ...schema,
                type: undefined,
              },
        });

    if (!nodes.length) {
      return [];
    }

    // Ensure the map callback has a return statement for the item
    const mapCallbackStatements = ensureStatements(nodes);
    const hasReturnStatement = mapCallbackStatements.some((stmt) =>
      isNodeReturnStatement({ node: stmt }),
    );

    if (!hasReturnStatement) {
      mapCallbackStatements.push($.return('item'));
    }

    return [
      $(dataExpression).assign(
        $(dataExpression)
          .attr('map')
          .call(
            $.func()
              .param('item', (p) => p.type('any'))
              .do(...mapCallbackStatements),
          ),
      ),
    ];
  }

  if (schema.type === 'object') {
    let nodes: Array<ts.Expression | ts.Statement | Expr> = [];
    const required = schema.required ?? [];

    for (const name in schema.properties) {
      const property = schema.properties[name]!;
      const propertyAccessExpression = $(
        dataExpression || dataVariableName,
      ).attr(name);
      const propertyNodes = processSchemaType({
        dataExpression: propertyAccessExpression,
        plugin,
        schema: property,
      });
      if (!propertyNodes.length) {
        continue;
      }
      const noNullableTypesInSchema = !property.items?.find(
        (x) => x.type === 'null',
      );
      const requiredField = required.includes(name);
      // Cannot fully rely on required fields
      // Such value has to be present, but it doesn't guarantee that this value is not nullish
      if (requiredField && noNullableTypesInSchema) {
        nodes = nodes.concat(propertyNodes);
      } else {
        nodes.push(
          // todo: Probably, it would make more sense to go with if(x !== undefined && x !== null) instead of if(x)
          // this place influences all underlying transformers, while it's not exactly transformer itself
          // Keep in mind that !!0 === false, so it already makes output for Bigint undesirable
          $.if(propertyAccessExpression).do(...ensureStatements(propertyNodes)),
        );
      }
    }

    return nodes;
  }

  if (schema.items) {
    if (schema.items.length === 1) {
      return processSchemaType({
        dataExpression: 'item',
        plugin,
        schema: schema.items[0]!,
      });
    }

    let arrayNodes: Array<ts.Expression | ts.Statement | Expr> = [];
    // process 2 items if one of them is null
    if (
      schema.logicalOperator === 'and' ||
      (schema.items.length === 2 &&
        schema.items.find(
          (item) => item.type === 'null' || item.type === 'void',
        ))
    ) {
      for (const item of schema.items) {
        const nodes = processSchemaType({
          dataExpression: dataExpression || 'item',
          plugin,
          schema: item,
        });
        if (nodes.length) {
          if (dataExpression) {
            arrayNodes = arrayNodes.concat(nodes);
          } else {
            // processed means the item was transformed
            arrayNodes.push(
              $.if('item').do(...ensureStatements(nodes)),
              $.return('item'),
            );
          }
        }
      }
      return arrayNodes;
    }

    // assume enums do not contain transformable values
    if (schema.type !== 'enum') {
      if (
        !(schema.items ?? []).every((item) =>
          (
            ['boolean', 'integer', 'null', 'number', 'string'] as ReadonlyArray<
              typeof item.type
            >
          ).includes(item.type),
        )
      ) {
        console.warn(
          `❗️ Transformers warning: schema ${JSON.stringify(schema)} is too complex and won't be currently processed. This will likely produce an incomplete transformer which is not what you want. Please open an issue if you'd like this improved https://github.com/hey-api/openapi-ts/issues`,
        );
      }
    }
  }

  for (const transformer of plugin.config.transformers) {
    const t = transformer({
      config: plugin.config,
      dataExpression,
      schema,
    });
    if (t) {
      return t;
    }
  }

  return [];
};

// handles only response transformers for now
export const handler: HeyApiTransformersPlugin['Handler'] = ({ plugin }) => {
  plugin.forEach(
    'operation',
    ({ operation }) => {
      const { response } = operationResponsesMap(operation);
      if (!response) return;

      if (response.items && response.items.length > 1) {
        if (plugin.context.config.logs.level === 'debug') {
          console.warn(
            `❗️ Transformers warning: route ${createOperationKey(operation)} has ${response.items.length} non-void success responses. This is currently not handled and we will not generate a response transformer. Please open an issue if you'd like this feature https://github.com/hey-api/openapi-ts/issues`,
          );
        }
        return;
      }

      const symbolResponse = plugin.querySymbol({
        category: 'type',
        resource: 'operation',
        resourceId: operation.id,
        role: 'response',
      });
      if (!symbolResponse) return;

      // TODO: parser - consider handling simple string response which is also a date
      const nodes = schemaResponseTransformerNodes({
        plugin,
        schema: response,
      });
      if (!nodes.length) return;
      const symbol = plugin.registerSymbol({
        meta: {
          category: 'transform',
          resource: 'operation',
          resourceId: operation.id,
          role: 'response',
        },
        name: buildName({
          config: {
            case: 'camelCase',
            name: '{{name}}ResponseTransformer',
          },
          name: operation.id,
        }),
      });
      const value = $.const(symbol)
        .export()
        .assign(
          // TODO: parser - add types, generate types without transforms
          $.func()
            .async()
            .param(dataVariableName, (p) => p.type('any'))
            .returns($.type('Promise').generic(symbolResponse))
            .do(...ensureStatements(nodes)),
        );
      plugin.addNode(value);
    },
    {
      order: 'declarations',
    },
  );
};
