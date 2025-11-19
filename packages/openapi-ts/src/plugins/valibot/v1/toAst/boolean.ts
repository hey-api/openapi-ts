import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { pipesToAst } from '../../shared/pipesToAst';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const booleanToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}): ReturnType<typeof $.call | typeof $.expr> => {
  const pipes: Array<ReturnType<typeof $.call>> = [];

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  if (typeof schema.const === 'boolean') {
    pipes.push(
      $(v.placeholder)
        .attr(identifiers.schemas.literal)
        .call($.literal(schema.const)),
    );
    return pipesToAst({ pipes, plugin });
  }

  pipes.push($(v.placeholder).attr(identifiers.schemas.boolean).call());
  return pipesToAst({ pipes, plugin });
};
