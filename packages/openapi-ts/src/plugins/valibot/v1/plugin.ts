import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef, ref, refs } from '@hey-api/codegen-core';
import type { IR, SchemaWithType } from '@hey-api/shared';
import { applyNaming, deduplicateSchema, pathToJsonPointer, refToName } from '@hey-api/shared';

import { maybeBigInt } from '../../../plugins/shared/utils/coerce';
import { $ } from '../../../ts-dsl';
import { exportAst } from '../shared/export';
import { irOperationToAst } from '../shared/operation';
import { pipesToNode } from '../shared/pipes';
import type { Ast, IrSchemaToAstOptions, PluginState } from '../shared/types';
import { irWebhookToAst } from '../shared/webhook';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';
import { irSchemaWithTypeToAst } from './toAst';

export const irSchemaToAst = ({
  optional,
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  /**
   * Accept `optional` to handle optional object properties. We can't handle
   * this inside the object function because `.optional()` must come before
   * `.default()` which is handled in this function.
   */
  optional?: boolean;
  schema: IR.SchemaObject;
}): Ast => {
  const ast: Ast = {
    pipes: [],
  };

  const v = plugin.external('valibot.v');

  if (schema.$ref) {
    const query: SymbolMeta = {
      category: 'schema',
      resource: 'definition',
      resourceId: schema.$ref,
      tool: 'valibot',
    };
    const refSymbol = plugin.referenceSymbol(query);
    if (plugin.isSymbolRegistered(query)) {
      const ref = $(refSymbol);
      ast.pipes.push(ref);
    } else {
      const lazyExpression = $(v)
        .attr(identifiers.schemas.lazy)
        .call($.func().do($(refSymbol).return()));
      ast.pipes.push(lazyExpression);
      state.hasLazyExpression['~ref'] = true;
    }
  } else if (schema.type) {
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
    ast.typeName = typeAst.anyType;
    ast.pipes.push(typeAst.expression);

    if (plugin.config.metadata && schema.description) {
      const expression = $(v)
        .attr(identifiers.actions.metadata)
        .call($.object().prop('description', $.literal(schema.description)));
      ast.pipes.push(expression);
    }
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemsAst = schema.items.map((item, index) => {
        const itemAst = irSchemaToAst({
          plugin,
          schema: item,
          state: {
            ...state,
            path: ref([...fromRef(state.path), 'items', index]),
          },
        });
        return pipesToNode(itemAst.pipes, plugin);
      });

      if (schema.logicalOperator === 'and') {
        const intersectExpression = $(v)
          .attr(identifiers.schemas.intersect)
          .call($.array(...itemsAst));
        ast.pipes.push(intersectExpression);
      } else {
        const unionExpression = $(v)
          .attr(identifiers.schemas.union)
          .call($.array(...itemsAst));
        ast.pipes.push(unionExpression);
      }
    } else {
      const schemaPipes = irSchemaToAst({ plugin, schema, state });
      ast.pipes.push(...schemaPipes.pipes);
    }
  } else {
    // catch-all fallback for failed schemas
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
    ast.typeName = typeAst.anyType;
    ast.pipes.push(typeAst.expression);
  }

  if (ast.pipes.length) {
    if (schema.accessScope === 'read') {
      const readonlyExpression = $(v).attr(identifiers.actions.readonly).call();
      ast.pipes.push(readonlyExpression);
    }

    if (schema.default !== undefined) {
      ast.pipes = [
        $(v)
          .attr(identifiers.schemas.optional)
          .call(
            pipesToNode(ast.pipes, plugin),
            schema.type === 'integer' || schema.type === 'number'
              ? maybeBigInt(schema.default, schema.format)
              : $.fromValue(schema.default),
          ),
      ];
    } else if (optional) {
      ast.pipes = [$(v).attr(identifiers.schemas.optional).call(pipesToNode(ast.pipes, plugin))];
    }
  }

  return ast as Ast;
};

const handleComponent = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
}): void => {
  const $ref = pathToJsonPointer(fromRef(state.path));
  const ast = irSchemaToAst({ plugin, schema, state });
  const baseName = refToName($ref);
  const symbol = plugin.symbol(applyNaming(baseName, plugin.config.definitions), {
    meta: {
      category: 'schema',
      path: fromRef(state.path),
      resource: 'definition',
      resourceId: $ref,
      tags: fromRef(state.tags),
      tool: 'valibot',
    },
  });
  exportAst({
    ast,
    plugin,
    schema,
    state,
    symbol,
  });
};

export const handlerV1: ValibotPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('v', {
    external: 'valibot',
    importKind: 'namespace',
    meta: {
      category: 'external',
      resource: 'valibot.v',
    },
  });

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', 'webhook', (event) => {
    const state = refs<PluginState>({
      hasLazyExpression: false,
      path: event._path,
      tags: event.tags,
    });
    switch (event.type) {
      case 'operation':
        irOperationToAst({
          getAst: (schema, path) => {
            const state = refs<PluginState>({
              hasLazyExpression: false,
              path,
              tags: event.tags,
            });
            return irSchemaToAst({ plugin, schema, state });
          },
          operation: event.operation,
          plugin,
          state,
        });
        break;
      case 'parameter':
        handleComponent({
          plugin,
          schema: event.parameter.schema,
          state,
        });
        break;
      case 'requestBody':
        handleComponent({
          plugin,
          schema: event.requestBody.schema,
          state,
        });
        break;
      case 'schema':
        handleComponent({
          plugin,
          schema: event.schema,
          state,
        });
        break;
      case 'webhook':
        irWebhookToAst({
          getAst: (schema, path) => {
            const state = refs<PluginState>({
              hasLazyExpression: false,
              path,
              tags: event.tags,
            });
            return irSchemaToAst({ plugin, schema, state });
          },
          operation: event.operation,
          plugin,
          state,
        });
        break;
    }
  });
};
