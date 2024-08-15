// Runtime detection functions

export const isNodeRuntime = (): boolean =>
  typeof process !== 'undefined' &&
  typeof process.versions !== 'undefined' &&
  typeof process.versions.node !== 'undefined';

export const isDenoRuntime = (): boolean =>
  typeof Deno !== 'undefined' && typeof Deno.version !== 'undefined';

export const isBunRuntime = (): boolean =>
  typeof Bun !== 'undefined' && typeof Bun.version !== 'undefined';
