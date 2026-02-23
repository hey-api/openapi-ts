import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { Pipe } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

export function nullToPipes({
  plugin,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'null'>;
}): Pipe {
  const v = plugin.external('valibot.v');
  return $(v).attr(identifiers.schemas.null).call();
}
