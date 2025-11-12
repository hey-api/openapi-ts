import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import type { CallTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import type { ObjectBaseResolverArgs } from '../../types';
import { irSchemaToAst } from '../plugin';

function defaultObjectBaseResolver({
  additional,
  plugin,
  shape,
}: ObjectBaseResolverArgs): CallTsDsl {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (additional) {
    return $(z.placeholder).attr(identifiers.record).call(additional);
  }

  return $(z.placeholder).attr(identifiers.object).call(shape);
}

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): Omit<Ast, 'typeName'> & {
  anyType?: string;
} => {
  let hasLazyExpression = false;

  // TODO: parser - handle constants

  const shape = $.object().pretty();
  const required = schema.required ?? [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);

    const propertyExpression = irSchemaToAst({
      optional: !isRequired,
      plugin,
      schema: property,
      state: {
        ...state,
        path: toRef([...state.path.value, 'properties', name]),
      },
    });

    if (propertyExpression.hasLazyExpression) hasLazyExpression = true;

    shape.prop(name, propertyExpression.expression);
  }

  let additional: ts.Expression | null | undefined;
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  if (
    schema.additionalProperties &&
    (!schema.properties || !Object.keys(schema.properties).length)
  ) {
    const additionalAst = irSchemaToAst({
      plugin,
      schema: schema.additionalProperties,
      state: {
        ...state,
        path: toRef([...state.path.value, 'additionalProperties']),
      },
    });
    hasLazyExpression = additionalAst.hasLazyExpression || hasLazyExpression;
    additional = additionalAst.expression;
  }

  const args: ObjectBaseResolverArgs = {
    $,
    additional,
    chain: undefined,
    plugin,
    schema,
    shape,
  };
  const resolver = plugin.config['~resolvers']?.object?.base;
  const chain = resolver?.(args) ?? defaultObjectBaseResolver(args);
  result.expression = chain.$render();

  return {
    anyType: 'AnyZodObject',
    expression: result.expression!,
    hasLazyExpression,
  };
};
