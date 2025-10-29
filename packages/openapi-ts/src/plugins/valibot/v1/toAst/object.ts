import ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';
import { numberRegExp } from '~/utils/regexp';

import { pipesToAst } from '../../shared/pipesToAst';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
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
  const properties: Array<ts.PropertyAssignment> = [];

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
        initializer: pipesToAst({ pipes: propertyAst.pipes, plugin }),
        name: propertyName,
      }),
    );
  }

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  // Handle additionalProperties with a schema (not just true/false)
  // This supports objects with dynamic keys (e.g., Record<string, T>)
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object' &&
    schema.additionalProperties.type !== undefined
  ) {
    const additionalAst = irSchemaToAst({
      plugin,
      schema: schema.additionalProperties,
      state: {
        ...state,
        path: toRef([...state.path.value, 'additionalProperties']),
      },
    });
    if (additionalAst.hasLazyExpression) {
      result.hasLazyExpression = true;
    }

    // If there are no named properties, use v.record() directly
    if (!Object.keys(properties).length) {
      result.pipes = [
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: v.placeholder,
            name: identifiers.schemas.record,
          }),
          parameters: [
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: v.placeholder,
                name: identifiers.schemas.string,
              }),
              parameters: [],
            }),
            pipesToAst({ pipes: additionalAst.pipes, plugin }),
          ],
        }),
      ];
      return result as Omit<Ast, 'typeName'>;
    }

    // If there are named properties, use v.objectWithRest() to validate both
    // The rest parameter is the schema for each additional property value
    result.pipes = [
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.schemas.objectWithRest,
        }),
        parameters: [
          ts.factory.createObjectLiteralExpression(properties, true),
          pipesToAst({ pipes: additionalAst.pipes, plugin }),
        ],
      }),
    ];
    return result as Omit<Ast, 'typeName'>;
  }

  result.pipes = [
    tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.object,
      }),
      parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
    }),
  ];
  return result as Omit<Ast, 'typeName'>;
};
