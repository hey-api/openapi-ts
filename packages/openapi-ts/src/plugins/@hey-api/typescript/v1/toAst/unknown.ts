import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, Type } from '../../shared/types';

export function unknownToAst({
  plugin,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'unknown'>;
}): Type {
  return $.type(plugin.config.topType);
}
