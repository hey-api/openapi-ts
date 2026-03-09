import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, Type } from '../../shared/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function voidToAst(args: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'void'>;
}): Type {
  return $.type('void');
}
