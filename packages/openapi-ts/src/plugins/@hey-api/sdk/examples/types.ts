import type { FeatureToggle, IR, LinguistLanguages } from '@hey-api/shared';
import type { MaybeFunc } from '@hey-api/types';

import type { CallArgs, DollarTsDsl, ExampleOptions } from '~/ts-dsl';

export type UserExamplesConfig = Omit<ExampleOptions, 'payload'> & {
  /**
   * Whether this feature is enabled.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * The programming language for the generated examples.
   *
   * This is used to display the language label in code blocks in
   * documentation UIs.
   *
   * @default 'JavaScript'
   */
  language?: LinguistLanguages;
  /**
   * Example request payload.
   */
  payload?: MaybeFunc<
    (
      operation: IR.OperationObject,
      ctx: DollarTsDsl,
    ) => CallArgs | CallArgs[number]
  >;
  /**
   * Transform the generated example string.
   *
   * @param example The generated example string.
   * @param operation The operation the example was generated for.
   * @returns The final example string.
   */
  transform?: (example: string, operation: IR.OperationObject) => string;
};

export type ExamplesConfig = Omit<ExampleOptions, 'payload'> &
  FeatureToggle & {
    /**
     * The programming language for the generated examples.
     *
     * This is used to display the language label in code blocks in
     * documentation UIs.
     */
    language: LinguistLanguages;
    /**
     * Example request payload.
     */
    payload?: MaybeFunc<
      (
        operation: IR.OperationObject,
        ctx: DollarTsDsl,
      ) => CallArgs | CallArgs[number]
    >;
    /**
     * Transform the generated example string.
     *
     * @param example The generated example string.
     * @param operation The operation the example was generated for.
     * @returns The final example string.
     */
    transform?: (example: string, operation: IR.OperationObject) => string;
  };
