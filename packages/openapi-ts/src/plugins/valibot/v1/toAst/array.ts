import type { SchemaWithType } from '@hey-api/shared';
import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { pipesToNode } from '../../shared/pipes';
import type {
  Ast,
  IrSchemaToAstOptions,
  ValibotAppliedResult,
  ValibotSchemaResult,
} from '../../shared/types';
import { identifiers } from '../constants';
import { unknownToAst } from './unknown';

export function arrayToAst(
  options: IrSchemaToAstOptions & {
    applyModifiers: (
      result: ValibotSchemaResult,
      opts: { optional?: boolean },
    ) => ValibotAppliedResult;
    schema: SchemaWithType<'array'>;
  },
): Omit<Ast, 'typeName'> {
  const { applyModifiers, plugin, walk } = options;
  let { schema } = options;

  const result: Omit<Ast, 'typeName'> = {
    pipes: [],
  };

  const v = plugin.external('valibot.v');
  const functionName = $(v).attr(identifiers.schemas.array);

  if (!schema.items) {
    const expression = functionName.call(
      unknownToAst({
        ...options,
        schema: {
          type: 'unknown',
        },
      }),
    );
    result.pipes.push(expression);
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item, index) => {
      const itemResult = walk(
        item,
        childContext(
          {
            path: options.state.path,
            plugin: options.plugin,
          },
          'items',
          index,
        ),
      );
      if (itemResult.hasLazyExpression) {
        result.hasLazyExpression = true;
      }

      const finalExpr = applyModifiers(itemResult, { optional: false });
      return pipesToNode(finalExpr.pipes, plugin);
    });

    if (itemExpressions.length === 1) {
      const expression = functionName.call(...itemExpressions);
      result.pipes.push(expression);
    } else {
      if (schema.logicalOperator === 'and') {
        // TODO: parser - handle intersection
        // return tsc.typeArrayNode(
        //   tsc.typeIntersectionNode({ types: itemExpressions }),
        // );
      }

      // TODO: parser - handle union
      // return tsc.typeArrayNode(tsc.typeUnionNode({ types: itemExpressions }));

      const expression = functionName.call(
        unknownToAst({
          ...options,
          schema: {
            type: 'unknown',
          },
        }),
      );
      result.pipes.push(expression);
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    const expression = $(v).attr(identifiers.actions.length).call($.fromValue(schema.minItems));
    result.pipes.push(expression);
  } else {
    if (schema.minItems !== undefined) {
      const expression = $(v)
        .attr(identifiers.actions.minLength)
        .call($.fromValue(schema.minItems));
      result.pipes.push(expression);
    }

    if (schema.maxItems !== undefined) {
      const expression = $(v)
        .attr(identifiers.actions.maxLength)
        .call($.fromValue(schema.maxItems));
      result.pipes.push(expression);
    }
  }

  return result as Omit<Ast, 'typeName'>;
}
