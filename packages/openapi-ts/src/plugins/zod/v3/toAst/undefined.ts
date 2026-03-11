import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

export function undefinedToAst({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'undefined'>;
}): Chain {
  const z = plugin.external('zod.z');
  return $(z).attr(identifiers.undefined).call();
}
