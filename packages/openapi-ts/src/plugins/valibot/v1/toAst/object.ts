import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { $, type CallTsDsl } from '~/ts-dsl';

import { pipesToAst } from '../../shared/pipesToAst';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import type { ObjectBaseResolverArgs } from '../../types';
import { identifiers } from '../constants';
import { irSchemaToAst } from '../plugin';

function defaultObjectBaseResolver({
  additional,
  pipes,
  plugin,
  shape,
}: ObjectBaseResolverArgs): number {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  // Handle `additionalProperties: { type: 'never' }` → v.strictObject()
  if (additional === null) {
    return pipes.push(
      $(v.placeholder).attr(identifiers.schemas.strictObject).call(shape),
    );
  }

  // Handle additionalProperties as schema → v.record() or v.objectWithRest()
  if (additional) {
    if (shape.isEmpty) {
      return pipes.push(
        $(v.placeholder)
          .attr(identifiers.schemas.record)
          .call(
            $(v.placeholder).attr(identifiers.schemas.string).call(),
            additional,
          ),
      );
    }

    // If there are named properties, use v.objectWithRest() to validate both
    return pipes.push(
      $(v.placeholder)
        .attr(identifiers.schemas.objectWithRest)
        .call(shape, additional),
    );
  }

  // Default case → v.object()
  return pipes.push(
    $(v.placeholder).attr(identifiers.schemas.object).call(shape),
  );
}

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  const pipes: Array<CallTsDsl> = [];

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
    if (propertyAst.hasLazyExpression) result.hasLazyExpression = true;

    shape.prop(name, pipesToAst({ pipes: propertyAst.pipes, plugin }));
  }

  let additional: ts.Expression | null | undefined;
  if (schema.additionalProperties && schema.additionalProperties.type) {
    if (schema.additionalProperties.type === 'never') {
      additional = null;
    } else {
      const additionalAst = irSchemaToAst({
        plugin,
        schema: schema.additionalProperties,
        state: {
          ...state,
          path: toRef([...state.path.value, 'additionalProperties']),
        },
      });
      if (additionalAst.hasLazyExpression) result.hasLazyExpression = true;
      additional = pipesToAst({ pipes: additionalAst.pipes, plugin });
    }
  }

  const args: ObjectBaseResolverArgs = {
    $,
    additional,
    pipes,
    plugin,
    schema,
    shape,
  };
  const resolver = plugin.config['~resolvers']?.object?.base;
  if (!resolver?.(args)) defaultObjectBaseResolver(args);

  result.pipes = [pipesToAst({ pipes, plugin })];
  return result as Omit<Ast, 'typeName'>;
};
