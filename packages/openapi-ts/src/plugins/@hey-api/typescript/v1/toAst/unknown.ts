import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, TypeScriptResult } from '../../shared/types';

export function unknownToAst({
  plugin,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'unknown'>;
}): TypeScriptResult['type'] {
  return $.type(plugin.config.topType);
}
