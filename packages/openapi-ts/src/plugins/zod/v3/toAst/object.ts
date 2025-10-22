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
}): Omit<Ast, 'typeName'> & {
  anyType?: string;
} => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

  let hasCircularReference = false;

  // TODO: parser - handle constants
  const properties: Array<ts.PropertyAssignment> = [];

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
        _path: [...state._path, 'properties', name],
      },
    });

    if (propertyExpression.hasCircularReference) {
      hasCircularReference = true;
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
    properties.push(
      tsc.propertyAssignment({
        initializer: propertyExpression.expression,
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
        _path: [...state._path, 'additionalProperties'],
      },
    });
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.record,
      }),
      parameters: [additionalAst.expression],
    });
    return {
      anyType: 'AnyZodObject',
      expression,
      hasCircularReference: additionalAst.hasCircularReference,
    };
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.object,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });
  return {
    anyType: 'AnyZodObject',
    expression,
    hasCircularReference,
  };
};
