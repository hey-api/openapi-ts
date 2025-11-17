import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import type { ObjectBaseResolverArgs } from '../../types';
import { irSchemaToAst } from '../plugin';

function defaultObjectBaseResolver({
  additional,
  plugin,
  shape,
}: ObjectBaseResolverArgs): ReturnType<typeof $.call> {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (additional) {
    return $(z.placeholder)
      .attr(identifiers.record)
      .call($(z.placeholder).attr(identifiers.string).call(), additional);
  }

  return $(z.placeholder).attr(identifiers.object).call(shape);
}

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};

  // TODO: parser - handle constants

  const shape = $.object().pretty();
  const required = schema.required ?? [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);

    const propertyAst = irSchemaToAst({
      optional: !isRequired,
      plugin,
      schema: property,
      state: {
        ...state,
        path: toRef([...state.path.value, 'properties', name]),
      },
    });
    if (propertyAst.hasLazyExpression) {
      result.hasLazyExpression = true;
    }

    if (propertyAst.hasLazyExpression) {
      shape.getter(name, $(propertyAst.expression).return());
    } else {
      shape.prop(name, propertyAst.expression);
    }
  }

  let additional: ts.Expression | null | undefined;
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
    if (additionalAst.hasLazyExpression) result.hasLazyExpression = true;
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

  return result as Omit<Ast, 'typeName'>;
};
