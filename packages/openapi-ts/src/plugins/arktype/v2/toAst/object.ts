import { fromRef, ref } from '@hey-api/codegen-core';

import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

// import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

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
        path: ref([...fromRef(state.path), 'properties', name]),
      },
    });
    if (propertyAst.hasLazyExpression) {
      result.hasLazyExpression = true;
    }

    // if (propertyAst.hasCircularReference) {
    //   properties.push(
    //     tsc.getAccessorDeclaration({
    //       name: propertyName,
    //       // @ts-expect-error
    //       returnType: propertyAst.typeName
    //         ? tsc.propertyAccessExpression({
    //             expression: 'TODO',
    //             name: propertyAst.typeName,
    //           })
    //         : undefined,
    //       statements: [
    //         tsc.returnStatement({
    //           expression: propertyAst.expression,
    //         }),
    //       ],
    //     }),
    //   );
    // } else {
    //   properties.push(
    //     tsc.propertyAssignment({
    //       initializer: propertyAst.expression,
    //       name: ts.factory.createComputedPropertyName(
    //         ts.factory.createStringLiteral(`${propertyName}?`),
    //       ),
    //     }),
    //   );
    // }

    shape.prop(isRequired ? name : `${name}?`, propertyAst.expression);
  }

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
    // name: identifiers.record,
    result.expression = $('TODO').attr('record').call(
      // name: identifiers.string,
      $('TODO').attr('string').call(),
      additionalAst.expression,
    );
    if (additionalAst.hasLazyExpression) {
      result.hasLazyExpression = true;
    }

    return result as Omit<Ast, 'typeName'>;
  }

  result.expression = shape;

  // return with typeName for circular references
  if (result.hasLazyExpression) {
    return {
      ...result,
      typeName: 'TODO',
    } as Ast;
  }

  return result as Omit<Ast, 'typeName'>;
};
