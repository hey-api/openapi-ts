import type ts from 'typescript';

import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import { identifiers } from '../../constants';
import { numberParameter } from '../../shared/numbers';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol(plugin.api.getSelector('external', 'zod.z'));

  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.number(schema.const)],
    });
    return result as Omit<Ast, 'typeName'>;
  }

  result.expression = tsc.callExpression({
    functionName: isBigInt
      ? tsc.propertyAccessExpression({
          expression: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.coerce,
          }),
          name: identifiers.bigint,
        })
      : tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.number,
        }),
  });

  if (!isBigInt && schema.type === 'integer') {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.int,
      }),
    });
  }

  const checks: Array<ts.Expression> = [];

  if (schema.exclusiveMinimum !== undefined) {
    checks.push(
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.gt,
        }),
        parameters: [
          numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
        ],
      }),
    );
  } else if (schema.minimum !== undefined) {
    checks.push(
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.gte,
        }),
        parameters: [numberParameter({ isBigInt, value: schema.minimum })],
      }),
    );
  }

  if (schema.exclusiveMaximum !== undefined) {
    checks.push(
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.lt,
        }),
        parameters: [
          numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
        ],
      }),
    );
  } else if (schema.maximum !== undefined) {
    checks.push(
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.lte,
        }),
        parameters: [numberParameter({ isBigInt, value: schema.maximum })],
      }),
    );
  }

  if (checks.length) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.check,
      }),
      parameters: checks,
    });
  }

  return result as Omit<Ast, 'typeName'>;
};
