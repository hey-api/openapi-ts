import { fromRef, ref } from '@hey-api/codegen-core';

import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import type { ObjectBaseResolverArgs } from '../../types';
import { irSchemaToAst } from '../plugin';

function defaultBaseResolver({
  additional,
  shape,
  z,
}: ObjectBaseResolverArgs): ReturnType<typeof $.call> {
  if (additional) {
    return $(z)
      .attr(identifiers.record)
      .call($(z).attr(identifiers.string).call(), additional);
  }

  return $(z).attr(identifiers.object).call(shape);
}

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

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
        path: ref([...fromRef(state.path), 'properties', name]),
      },
    });
    if (propertyAst.hasLazyExpression) {
      result.hasLazyExpression = true;
    }

    if (propertyAst.hasLazyExpression) {
      shape.getter(name, propertyAst.expression.return());
    } else {
      shape.prop(name, propertyAst.expression);
    }
  }

  let additional: ReturnType<typeof $.call | typeof $.expr> | null | undefined;
  if (
    schema.additionalProperties &&
    (!schema.properties || !Object.keys(schema.properties).length)
  ) {
    const additionalAst = irSchemaToAst({
      plugin,
      schema: schema.additionalProperties,
      state: {
        ...state,
        path: ref([...fromRef(state.path), 'additionalProperties']),
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
    z,
  };
  const resolver = plugin.config['~resolvers']?.object?.base;
  const chain = resolver?.(args) ?? defaultBaseResolver(args);
  result.expression = chain;

  return result as Omit<Ast, 'typeName'>;
};
