import type { IR } from '../../../ir/types';

export interface SchemaContext {
  /**
   * Optional schema $ref. This will be only defined for reusable components
   * from the OpenAPI specification.
   */
  $ref?: string;
  context: IR.Context;
}

export type SchemaWithRequired<
  S extends {
    type?: unknown;
  },
  K extends keyof S,
> = {
  [P in keyof S as P extends K ? never : P]: S[P];
} & {
  [P in K]-?: S[P];
};

export type SchemaType<
  S extends {
    type?: unknown;
  },
> = Extract<Required<S>['type'], string>;
