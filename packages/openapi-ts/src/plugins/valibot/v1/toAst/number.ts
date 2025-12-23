import type { SchemaWithType } from '~/plugins';
import {
  maybeBigInt,
  shouldCoerceToBigInt,
} from '~/plugins/shared/utils/coerce';
import { getIntegerLimit } from '~/plugins/shared/utils/formats';
import { $ } from '~/ts-dsl';

import { pipesToAst } from '../../shared/pipesToAst';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}) => {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  if (schema.const !== undefined) {
    return $(v)
      .attr(identifiers.schemas.literal)
      .call(maybeBigInt(schema.const, schema.format));
  }

  const pipes: Array<ReturnType<typeof $.call>> = [];

  if (shouldCoerceToBigInt(schema.format)) {
    pipes.push(
      $(v)
        .attr(identifiers.schemas.union)
        .call(
          $.array(
            $(v).attr(identifiers.schemas.number).call(),
            $(v).attr(identifiers.schemas.string).call(),
            $(v).attr(identifiers.schemas.bigInt).call(),
          ),
        ),
      $(v)
        .attr(identifiers.actions.transform)
        .call($.func().param('x').do($('BigInt').call('x').return())),
    );
  } else {
    pipes.push($(v).attr(identifiers.schemas.number).call());
    if (schema.type === 'integer') {
      pipes.push($(v).attr(identifiers.actions.integer).call());
    }
  }

  const integerLimit = getIntegerLimit(schema.format);
  if (integerLimit) {
    pipes.push(
      $(v)
        .attr(identifiers.actions.minValue)
        .call(
          maybeBigInt(integerLimit.minValue, schema.format),
          $.literal(integerLimit.minError),
        ),
      $(v)
        .attr(identifiers.actions.maxValue)
        .call(
          maybeBigInt(integerLimit.maxValue, schema.format),
          $.literal(integerLimit.maxError),
        ),
    );
  }

  if (schema.exclusiveMinimum !== undefined) {
    pipes.push(
      $(v)
        .attr(identifiers.actions.gtValue)
        .call(maybeBigInt(schema.exclusiveMinimum, schema.format)),
    );
  } else if (schema.minimum !== undefined) {
    pipes.push(
      $(v)
        .attr(identifiers.actions.minValue)
        .call(maybeBigInt(schema.minimum, schema.format)),
    );
  }

  if (schema.exclusiveMaximum !== undefined) {
    pipes.push(
      $(v)
        .attr(identifiers.actions.ltValue)
        .call(maybeBigInt(schema.exclusiveMaximum, schema.format)),
    );
  } else if (schema.maximum !== undefined) {
    pipes.push(
      $(v)
        .attr(identifiers.actions.maxValue)
        .call(maybeBigInt(schema.maximum, schema.format)),
    );
  }

  return pipesToAst(pipes, plugin);
};
