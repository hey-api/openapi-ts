import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef, ref, refs } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import type { SchemaWithType } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';
import { pathToJsonPointer, refToName } from '@hey-api/shared';

import { maybeBigInt } from '~/plugins/shared/utils/coerce';
import { $ } from '~/ts-dsl';

import { identifiers } from '../constants';
import { exportAst } from '../shared/export';
import { getZodModule } from '../shared/module';
import { irOperationToAst } from '../shared/operation';
import type { Ast, IrSchemaToAstOptions, PluginState } from '../shared/types';
import { irWebhookToAst } from '../shared/webhook';
import type { ZodPlugin } from '../types';
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
  let ast: Partial<Ast> = {};

  const z = plugin.external('zod.z');

  if (schema.$ref) {
    const query: SymbolMeta = {
      category: 'schema',
      resource: 'definition',
      resourceId: schema.$ref,
      tool: 'zod',
    };
    const refSymbol = plugin.referenceSymbol(query);
    if (plugin.isSymbolRegistered(query)) {
      ast.expression = $(refSymbol);
    } else {
      ast.expression = $(z)
        .attr(identifiers.lazy)
        .call($.func().do($(refSymbol).return()));
      ast.hasLazyExpression = true;
      state.hasLazyExpression['~ref'] = true;
    }
  } else if (schema.type) {
    const typeAst = irSchemaWithTypeToAst({
      plugin,
      schema: schema as SchemaWithType,
      state,
    });
    ast.expression = typeAst.expression;
    ast.typeName = typeAst.anyType;

    if (plugin.config.metadata && schema.description) {
      ast.expression = ast.expression
        .attr(identifiers.describe)
        .call($.literal(schema.description));
    }
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });

    if (schema.items) {
      const itemTypes = schema.items.map((item, index) => {
        const typeAst = irSchemaToAst({
          plugin,
          schema: item,
          state: {
            ...state,
            path: ref([...fromRef(state.path), 'items', index]),
          },
        });
        return typeAst.expression;
      });

      if (schema.logicalOperator === 'and') {
        const firstSchema = schema.items[0]!;
        // we want to add an intersection, but not every schema can use the same API.
        // if the first item contains another array or not an object, we cannot use
        // `.merge()` as that does not exist on `.union()` and non-object schemas.
        if (
          firstSchema.logicalOperator === 'or' ||
          (firstSchema.type && firstSchema.type !== 'object')
        ) {
          ast.expression = $(z)
            .attr(identifiers.intersection)
            .call(...itemTypes);
        } else {
          ast.expression = itemTypes[0];
          itemTypes.slice(1).forEach((item) => {
            ast.expression = ast.expression!.attr(identifiers.and).call(item);
          });
        }
      } else {
        ast.expression = $(z)
          .attr(identifiers.union)
          .call(
            $.array()
              .pretty()
              .elements(...itemTypes),
          );
      }
    } else {
      ast = irSchemaToAst({ plugin, schema, state });
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
    ast.expression = typeAst.expression;
    ast.typeName = typeAst.anyType;
  }

  if (ast.expression) {
    if (schema.accessScope === 'read') {
      ast.expression = ast.expression.attr(identifiers.readonly).call();
    }

    if (optional) {
      ast.expression = ast.expression.attr(identifiers.optional).call();
    }

    if (schema.default !== undefined) {
      ast.expression = ast.expression
        .attr(identifiers.default)
        .call(
          schema.type === 'integer' || schema.type === 'number'
            ? maybeBigInt(schema.default, schema.format)
            : $.fromValue(schema.default),
        );
    }
  }

  if (state.hasLazyExpression['~ref']) {
    if (!ast.typeName) {
      ast.typeName = 'ZodTypeAny';
    }
  } else if (ast.typeName) {
    ast.typeName = undefined;
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
  const symbol = plugin.symbol(
    applyNaming(baseName, plugin.config.definitions),
    {
      meta: {
        category: 'schema',
        path: fromRef(state.path),
        resource: 'definition',
        resourceId: $ref,
        tags: fromRef(state.tags),
        tool: 'zod',
      },
    },
  );
  const typeInferSymbol = plugin.config.definitions.types.infer.enabled
    ? plugin.symbol(
        applyNaming(baseName, plugin.config.definitions.types.infer),
        {
          meta: {
            category: 'type',
            path: fromRef(state.path),
            resource: 'definition',
            resourceId: $ref,
            tags: fromRef(state.tags),
            tool: 'zod',
            variant: 'infer',
          },
        },
      )
    : undefined;
  exportAst({
    ast,
    plugin,
    schema,
    symbol,
    typeInferSymbol,
  });
};

export const handlerV3: ZodPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('z', {
    external: getZodModule({ plugin }),
    meta: {
      category: 'external',
      resource: 'zod.z',
    },
  });

  plugin.forEach(
    'operation',
    'parameter',
    'requestBody',
    'schema',
    'webhook',
    (event) => {
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
    },
  );
};
