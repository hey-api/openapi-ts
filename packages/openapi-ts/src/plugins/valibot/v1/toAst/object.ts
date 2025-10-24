import ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';
import { numberRegExp } from '~/utils/regexp';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { pipesToAst } from '../pipesToAst';
import { irSchemaToAst } from '../plugin';

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): {
  anyType: string;
  expression: ts.CallExpression;
} => {
  // TODO: parser - handle constants
  const properties: Array<ts.PropertyAssignment> = [];

  const required = schema.required ?? [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);

    const schemaPipes = irSchemaToAst({
      optional: !isRequired,
      plugin,
      schema: property,
      state: {
        ...state,
        path: toRef([...state.path.value, 'properties', name]),
      },
    });

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
        initializer: pipesToAst({ pipes: schemaPipes, plugin }),
        name: propertyName,
      }),
    );
  }

  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );

  if (
    schema.additionalProperties &&
    schema.additionalProperties.type === 'object' &&
    !Object.keys(properties).length
  ) {
    const pipes = irSchemaToAst({
      plugin,
      schema: schema.additionalProperties,
      state: {
        ...state,
        path: toRef([...state.path.value, 'additionalProperties']),
      },
    });
    const expression = tsc.callExpression({
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
        pipesToAst({ pipes, plugin }),
      ],
    });
    return {
      anyType: 'AnyZodObject',
      expression,
    };
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.object,
    }),
    parameters: [ts.factory.createObjectLiteralExpression(properties, true)],
  });
  return {
    // Zod uses AnyZodObject here, maybe we want to be more specific too
    anyType: identifiers.types.GenericSchema.text,
    expression,
  };
};
