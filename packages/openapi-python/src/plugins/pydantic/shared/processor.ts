import type {
  IR,
  NamingConfig,
  SchemaProcessorContext,
  SchemaProcessorResult,
} from '@hey-api/shared';

import type { IrSchemaToAstOptions } from './types';

export type ProcessorContext = Pick<IrSchemaToAstOptions, 'plugin'> &
  SchemaProcessorContext & {
    naming: NamingConfig;
    schema: IR.SchemaObject;
  };

export type ProcessorResult = SchemaProcessorResult<ProcessorContext>;
