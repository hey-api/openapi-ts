import type { IR } from '~/ir/types';
import type { $ } from '~/ts-dsl';

type Expression = ReturnType<typeof $.expr>;

export type IApi = {
  /**
   * Generate a Faker expression for a schema.
   *
   * Returns an expression that produces a valid instance when executed.
   * Use when you need one-off generation without referencing shared artifacts.
   *
   * @example
   * ```ts
   * {
   *   name: faker.person.fullName(),
   *   email: faker.internet.email()
   * }
   * ```
   */
  toNode(schema: IR.SchemaObject): Expression;
  /**
   * Get a reference to a generated Faker expression for a schema.
   *
   * Returns a call expression referencing the shared artifact.
   * If the artifact doesn't exist, it will be created.
   *
   * @example
   * // Returns: fakeUser()
   */
  toNodeRef(schema: IR.SchemaObject): Expression;
};

export class Api implements IApi {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toNode(_schema: IR.SchemaObject): Expression {
    return undefined as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toNodeRef(_schema: IR.SchemaObject): Expression {
    return undefined as any;
  }
}
