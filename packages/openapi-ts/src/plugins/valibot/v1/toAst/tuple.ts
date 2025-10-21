import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { pipesToAst } from '../pipesToAst';
import { irSchemaToAst } from '../plugin';
import { unknownToAst } from './unknown';

export const tupleToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'tuple'>;
}) => {
  const v = plugin.referenceSymbol(
    plugin.api.getSelector('external', 'valibot.v'),
  );

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.schemas.literal,
        }),
        parameters: [tsc.valueToExpression({ value })],
      }),
    );
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.tuple,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  if (schema.items) {
    const tupleElements = schema.items.map((item, index) => {
      const schemaPipes = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          _path: [...state._path, 'items', index],
        },
      });
      return pipesToAst({ pipes: schemaPipes, plugin });
    });
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.tuple,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return expression;
  }

  return unknownToAst({
    plugin,
    schema: {
      type: 'unknown',
    },
    state,
  });
};
