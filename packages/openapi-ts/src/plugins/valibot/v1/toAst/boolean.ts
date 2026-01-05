import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { pipesToNode } from '../../shared/pipes';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const booleanToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}): ReturnType<typeof $.call | typeof $.expr> => {
  const pipes: Array<ReturnType<typeof $.call>> = [];

  const v = plugin.external('valibot.v');

  if (typeof schema.const === 'boolean') {
    pipes.push(
      $(v).attr(identifiers.schemas.literal).call($.literal(schema.const)),
    );
    return pipesToNode(pipes, plugin);
  }

  pipes.push($(v).attr(identifiers.schemas.boolean).call());
  return pipesToNode(pipes, plugin);
};
