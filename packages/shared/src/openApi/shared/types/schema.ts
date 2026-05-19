export interface SchemaState {
  /**
   * Optional schema $ref. This will be only defined for reusable components
   * from the OpenAPI specification.
   */
  $ref?: string;
  /**
   * Set of $refs currently being resolved that are circular. This is used to
   * avoid infinite loops when resolving schemas with circular references.
   */
  circularReferenceTracker: Set<string>;
  /**
   * Map of dynamic anchor names to their resolved type references. This is used
   * to resolve $dynamicRef keywords according to JSON Schema 2020-12 dynamic
   * scope rules. The map stores anchor names (e.g., "itemType") to $ref values
   * (e.g., "#/components/schemas/User").
   */
  dynamicScope?: Record<string, string>;
  /**
   * True if current schema is part of an allOf composition. This is used to
   * avoid emitting [key: string]: never for empty objects with
   * additionalProperties: false inside allOf, which would override inherited
   * properties from other schemas in the composition.
   */
  inAllOf?: boolean;
  /**
   * Type parameters detected in the current generic template schema. Each entry
   * maps a `$dynamicAnchor` name to the derived TypeScript type parameter name.
   * Only set when parsing a schema with `$defs` entries that have
   * `$dynamicAnchor` but no concrete `$ref` (i.e., template placeholder slots).
   */
  typeParams?: ReadonlyArray<{
    anchor: string;
    paramName: string;
  }>;
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
