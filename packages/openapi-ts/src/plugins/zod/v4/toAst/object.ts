import ts from 'typescript';

import { tsc } from '../../../../tsc';
import { numberRegExp } from '../../../../utils/regexp';
import type { SchemaWithType } from '../../../shared/types/schema';
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

  const z = plugin.referenceSymbol(plugin.api.getSelector('external', 'zod.z'));

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);

    const propertySchema = irSchemaToAst({
      optional: !isRequired,
      plugin,
      schema: property,
      state: {
        ...state,
        _path: [...state._path, 'properties', name],
      },
    });
    if (propertySchema.hasCircularReference) {
      result.hasCircularReference = true;
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

    if (propertySchema.hasCircularReference) {
      properties.push(
        tsc.getAccessorDeclaration({
          name: propertyName,
          // @ts-expect-error
          returnType: propertySchema.typeName
            ? tsc.propertyAccessExpression({
                expression: z.placeholder,
                name: propertySchema.typeName,
              })
            : undefined,
          statements: [
            tsc.returnStatement({
              expression: propertySchema.expression,
            }),
          ],
        }),
      );
    } else {
      properties.push(
        tsc.propertyAssignment({
          initializer: propertySchema.expression,
          name: propertyName,
        }),
      );
    }
  }

  if (
    schema.additionalProperties &&
    (!schema.properties || !Object.keys(schema.properties).length)
  ) {
    const zodSchema = irSchemaToAst({
      plugin,
      schema: schema.additionalProperties,
      state: {
        ...state,
        _path: [...state._path, 'additionalProperties'],
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
        zodSchema.expression,
      ],
    });
    if (zodSchema.hasCircularReference) {
      result.hasCircularReference = true;
    }

    // Return with typeName for circular references
    if (result.hasCircularReference) {
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
  if (result.hasCircularReference) {
    return {
      ...result,
      typeName: 'ZodType',
    } as Ast;
  }

  return result as Omit<Ast, 'typeName'>;
};
