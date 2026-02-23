import type {
  IR,
  NamingConfig,
  SchemaProcessorContext,
  SchemaProcessorResult,
} from '@hey-api/shared';

import type { ValibotPlugin } from '../types';

export type ProcessorContext = SchemaProcessorContext & {
  naming: NamingConfig;
  /** The plugin instance. */
  plugin: ValibotPlugin['Instance'];
  schema: IR.SchemaObject;
};

export type ProcessorResult = SchemaProcessorResult<ProcessorContext>;
