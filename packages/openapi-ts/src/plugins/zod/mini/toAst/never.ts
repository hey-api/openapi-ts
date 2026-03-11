import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

export function neverToAst({
  plugin,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'never'>;
}): Chain {
  const z = plugin.external('zod.z');
  return $(z).attr(identifiers.never).call();
}
