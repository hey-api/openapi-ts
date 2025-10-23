import ts from 'typescript';

import { tsc } from '../../../../tsc';
import { numberRegExp } from '../../../../utils/regexp';
import type { SchemaWithType } from '../../../shared/types/schema';
import { toRef } from '../../../shared/utils/refs';
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
  const properties: Array<ts.PropertyAssignment | ts.GetAccessorDeclaration> =
    [];

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
        _path: toRef([...state._path.value, 'properties', name]),
      },
    });
    if (propertyAst.hasLazyExpression) {
      result.hasLazyExpression = true;
    }

    let propertyName:
      | ts.ComputedPropertyName
      | ts.StringLiteral
      | ts.NumericLiteral
      | string = isRequired ? name : `${name}?`;

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

    if (propertyName.endsWith('?')) {
      propertyName = ts.factory.createComputedPropertyName(
        tsc.stringLiteral({ text: propertyName }),
      );
    } else {
      // TODO: parser - abstract safe property name logic
      if (
        ((propertyName.match(/^[0-9]/) && propertyName.match(/\D+/g)) ||
          propertyName.match(/\W/g)) &&
        !propertyName.startsWith("'") &&
        !propertyName.endsWith("'")
      ) {
        propertyName = `'${propertyName}'`;
      }

      numberRegExp.lastIndex = 0;
      if (numberRegExp.test(propertyName)) {
        // For numeric literals, we'll handle negative numbers by using a string literal
        // instead of trying to use a PrefixUnaryExpression
        propertyName = propertyName.startsWith('-')
          ? tsc.stringLiteral({ text: name })
          : ts.factory.createNumericLiteral(name);
      } else {
        propertyName = name;
      }
    }
    properties.push(
      tsc.propertyAssignment({
        initializer: propertyAst.expression,
        name: propertyName,
      }),
    );
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
        _path: toRef([...state._path.value, 'additionalProperties']),
      },
    });
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: 'TODO',
        name: 'record',
        // name: identifiers.record,
      }),
      parameters: [
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: 'TODO',
            name: 'string',
            // name: identifiers.string,
          }),
          parameters: [],
        }),
        additionalAst.expression,
      ],
    });
    if (additionalAst.hasLazyExpression) {
      result.hasLazyExpression = true;
    }

    // Return with typeName for circular references
    if (result.hasLazyExpression) {
      return {
        ...result,
        typeName: 'TODO',
      } as Ast;
    }

    return result as Omit<Ast, 'typeName'>;
  }

  result.expression = ts.factory.createObjectLiteralExpression(
    properties,
    true,
  );

  // return with typeName for circular references
  if (result.hasLazyExpression) {
    return {
      ...result,
      typeName: 'TODO',
    } as Ast;
  }

  return result as Omit<Ast, 'typeName'>;
};
