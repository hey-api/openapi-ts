import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, TypeScriptResult } from '../../shared/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function voidToAst(args: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'void'>;
}): TypeScriptResult['type'] {
  return $.type('void');
}
