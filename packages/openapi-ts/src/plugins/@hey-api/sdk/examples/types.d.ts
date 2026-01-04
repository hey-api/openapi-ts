import type { IR } from '~/ir/types';
import type { LinguistLanguages } from '~/openApi/shared/types';
import type { CallArgs, DollarTsDsl, ExampleOptions } from '~/ts-dsl';
import type { MaybeFunc } from '~/types/utils';

export interface UserExamplesConfig extends ExampleOptions {
  /**
   * Whether to generate SDK code examples.
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
}

export interface ExamplesConfig extends ExampleOptions {
  /**
   * Whether to generate SDK code examples.
   */
  enabled: boolean;
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
}
