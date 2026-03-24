import type { IR, NamingConfig, SchemaProcessorContext } from '@hey-api/shared';

import type { HeyApiTypeScriptPlugin } from '../types';
import type { TypeScriptFinal } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  /** Whether to export the result (default: true) */
  export?: boolean;
  naming: NamingConfig;
  /** The plugin instance. */
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
};

export type ProcessorResult = {
  process: (ctx: ProcessorContext) => TypeScriptFinal | void;
};
