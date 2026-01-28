import type { PostProcessor } from '@hey-api/shared';

export const postProcessors = {
  // TODO: add common post-processors
} as const satisfies Record<string, PostProcessor>;

export type PostProcessorPreset = keyof typeof postProcessors;
