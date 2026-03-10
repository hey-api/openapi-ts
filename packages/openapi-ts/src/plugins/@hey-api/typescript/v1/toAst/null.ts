import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function nullToAst(args: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'null'>;
}): Type {
  return $.type.literal(null);
}
