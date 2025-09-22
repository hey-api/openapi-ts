/**
 * Selector array used to reference resources. We don't enforce
 * uniqueness, but in practice it's desirable.
 *
 * @example ["zod", "#/components/schemas/Foo"]
 */
export type ISelector = ReadonlyArray<string>;
