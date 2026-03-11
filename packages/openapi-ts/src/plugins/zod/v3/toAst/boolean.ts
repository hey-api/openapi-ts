import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

export function booleanToAst({
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): Chain {
  const z = plugin.external('zod.z');

  if (typeof schema.const === 'boolean') {
    return $(z).attr(identifiers.literal).call($.literal(schema.const));
  }

  return $(z).attr(identifiers.boolean).call();
}
