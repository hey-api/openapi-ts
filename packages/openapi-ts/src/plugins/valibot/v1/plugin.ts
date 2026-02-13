import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef, ref } from '@hey-api/codegen-core';
import type { IR, SchemaWithType } from '@hey-api/shared';
import { deduplicateSchema, pathToJsonPointer } from '@hey-api/shared';

import { maybeBigInt } from '../../../plugins/shared/utils/coerce';
import { $ } from '../../../ts-dsl';
import { irOperationToAst } from '../shared/operation';
import { pipesToNode } from '../shared/pipes';
import type { Ast, IrSchemaToAstOptions } from '../shared/types';
import { irWebhookToAst } from '../shared/webhook';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';
import { createProcessor } from './processor';
import { irSchemaWithTypeToAst } from './toAst';

export function irSchemaToAst({
  optional,
  plugin,
  schema,
  schemaExtractor,
  state,
}: IrSchemaToAstOptions & {
  /**
   * Accept `optional` to handle optional object properties. We can't handle
   * this inside the object function because `.optional()` must come before
   * `.default()` which is handled in this function.
   */
  optional?: boolean;
  schema: IR.SchemaObject;
}): Ast {
  if (schemaExtractor && !schema.$ref) {
    const extracted = schemaExtractor({
      meta: {
        resource: 'definition',
        resourceId: pathToJsonPointer(fromRef(state.path)),
      },
      naming: plugin.config.definitions,
      path: fromRef(state.path),
      plugin,
      schema,
    });
    if (extracted !== schema) schema = extracted;
  }

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
      schemaExtractor,
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
          schemaExtractor,
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
      schemaExtractor,
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
}

export const handlerV1: ValibotPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('v', {
    external: 'valibot',
    importKind: 'namespace',
    meta: {
      category: 'external',
      resource: 'valibot.v',
    },
  });

  const processor = createProcessor(plugin);

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', 'webhook', (event) => {
    switch (event.type) {
      case 'operation':
        irOperationToAst({
          operation: event.operation,
          path: event._path,
          plugin,
          processor,
          tags: event.tags,
        });
        break;
      case 'parameter':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.parameter.schema,
          tags: event.tags,
        });
        break;
      case 'requestBody':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.requestBody.schema,
          tags: event.tags,
        });
        break;
      case 'schema':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.schema,
          tags: event.tags,
        });
        break;
      case 'webhook':
        irWebhookToAst({
          operation: event.operation,
          path: event._path,
          plugin,
          processor,
          tags: event.tags,
        });
        break;
    }
  });
};
