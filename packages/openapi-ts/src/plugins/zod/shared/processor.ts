import type {
  IR,
  NamingConfig,
  SchemaProcessorContext,
  SchemaProcessorResult,
} from '@hey-api/shared';

import type { ZodPlugin } from '../types';
import type { TypeOptions } from './types';

export type ProcessorContext = SchemaProcessorContext & {
  naming: NamingConfig & TypeOptions;
  /** The plugin instance. */
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
};

export type ProcessorResult = SchemaProcessorResult<ProcessorContext>;
