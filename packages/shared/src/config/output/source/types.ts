import type { MaybePromise } from '@hey-api/types';

import type { FeatureToggle } from '../../shared';

// TODO: json-schema-ref-parser needs to expose source extension so
// we can default to it
type SourceExtension = 'json';
// type SourceExtension = 'json' | 'yaml';

export type UserSourceConfig = {
  /**
   * Callback invoked with the serialized source string.
   *
   * Runs after the `serialize` function.
   *
   * @example
   * source => console.log(source)
   */
  callback?: (source: string) => MaybePromise<void>;
  /**
   * Whether this feature is enabled.
   *
   * @default true
   */
  enabled?: boolean;
  // * Only `'json'` and `'yaml'` are allowed.
  /**
   * File extension for the source file.
   *
   * @default 'json'
   */
  extension?: SourceExtension;
  /**
   * Base file name for the source file.
   *
   * The extension from `extension` will be appended automatically.
   *
   * @default 'source'
   */
  fileName?: string;
  /**
   * Target location for the source file.
   *
   * - `true` / `undefined` → write to output root (default)
   * - `string` → relative to output root or absolute path
   * - `false` / `null` → do not write
   *
   * @default true
   */
  path?: boolean | string | null;
  /**
   * Function to serialize the input object into a string.
   *
   * @default
   * JSON.stringify(input, null, 2)
   *
   * @example
   * input => JSON.stringify(input, null, 0) // minified
   */
  serialize?: (input: Record<string, any>) => MaybePromise<string>;
};

export type SourceConfig = FeatureToggle & {
  /**
   * Callback invoked with the serialized source string.
   *
   * Runs after the `serialize` function.
   */
  callback?: (source: string) => MaybePromise<void>;
  /**
   * File extension for the source file.
   */
  extension: SourceExtension;
  /**
   * Base file name for the source file.
   */
  fileName: string;
  /**
   * Target location for the source file.
   */
  path: string | null;
  /**
   * Function to serialize the input object into a string.
   */
  serialize: (input: Record<string, any>) => MaybePromise<string>;
};
