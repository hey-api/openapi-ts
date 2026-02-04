import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const booleanToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}): ReturnType<typeof $.call> => {
  let chain: ReturnType<typeof $.call>;

  const z = plugin.external('zod.z');

  if (typeof schema.const === 'boolean') {
    chain = $(z).attr(identifiers.literal).call($.literal(schema.const));
    return chain;
  }

  chain = $(z).attr(identifiers.boolean).call();
  return chain;
};
