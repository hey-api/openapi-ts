import ts from 'typescript';

import type { SchemaWithType } from '~/plugins/shared/types/schema';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';
import { numberRegExp } from '~/utils/regexp';

import { identifiers } from '../../constants';
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

  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

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

    numberRegExp.lastIndex = 0;
    let propertyName;
    if (numberRegExp.test(name)) {
      // For numeric literals, we'll handle negative numbers by using a string literal
      // instead of trying to use a PrefixUnaryExpression
      propertyName = name.startsWith('-')
        ? ts.factory.createStringLiteral(name)
        : ts.factory.createNumericLiteral(name);
    } else {
      propertyName = name;
    }
    // TODO: parser - abstract safe property name logic
    if (
      ((name.match(/^[0-9]/) && name.match(/\D+/g)) || name.match(/\W/g)) &&
      !name.startsWith("'") &&
      !name.endsWith("'")
    ) {
      propertyName = `'${name}'`;
    }

    if (propertyAst.hasLazyExpression) {
      properties.push(
        tsc.getAccessorDeclaration({
          name: propertyName,
          statements: [
            tsc.returnStatement({
              expression: propertyAst.expression,
            }),
          ],
        }),
      );
    } else {
      properties.push(
        tsc.propertyAssignment({
          initializer: propertyAst.expression,
          name: propertyName,
        }),
      );
    }
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
        expression: z.placeholder,
        name: identifiers.record,
      }),
      parameters: [
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.string,
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
        typeName: 'ZodType',
      } as Ast;
    }

    return result as Omit<Ast, 'typeName'>;
  }

  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.object,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });

  // Return with typeName for circular references (AnyZodObject doesn't exist in Zod v4, use ZodType)
  if (result.hasLazyExpression) {
    return {
      ...result,
      typeName: 'ZodType',
    } as Ast;
  }

  return result as Omit<Ast, 'typeName'>;
};
