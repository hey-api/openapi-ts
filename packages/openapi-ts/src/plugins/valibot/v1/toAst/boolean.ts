import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { Pipe } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

export function booleanToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): Pipe {
  const v = plugin.external('valibot.v');

  if (typeof schema.const === 'boolean') {
    return $(v).attr(identifiers.schemas.literal).call($.literal(schema.const));
  }

  return $(v).attr(identifiers.schemas.boolean).call();
}
