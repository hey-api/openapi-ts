import type { IR } from '~/ir/types';
import type { $ } from '~/ts-dsl';

type Expression = ReturnType<typeof $.expr>;

export type IApi = {
  /**
   * Generate a Faker expression for a schema.
   *
   * Returns an expression that, when executed, produces a valid instance.
   */
  generateValue(schema: IR.SchemaObject): Expression;
  /**
   * Get a reference to an exported generator function.
   *
   * Returns an identifier that can be called, e.g., `fakeUser()`
   */
  getGeneratorRef(schema: IR.SchemaObject): Expression;
};

export class Api implements IApi {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateValue(_schema: IR.SchemaObject): Expression {
    return undefined as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getGeneratorRef(_schema: IR.SchemaObject): Expression {
    return undefined as any;
  }
}
