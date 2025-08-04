export interface SchemaState {
  /**
   * Optional schema $ref. This will be only defined for reusable components
   * from the OpenAPI specification.
   */
  $ref?: string;
  circularReferenceTracker: Set<string>;
  /**
   * True if current schema is part of an allOf composition. This is used to
   * avoid emitting [key: string]: never for empty objects with
   * additionalProperties: false inside allOf, which would override inherited
   * properties from other schemas in the composition.
   */
  inAllOf?: boolean;
  /**
   * True if current schema is an object property. This is used to mark schemas
   * as "both" access scopes, i.e. they can be used in both payloads and
   * responses. Without this field, we'd be overusing the "both" value which
   * would effectively render it useless.
   */
  isProperty?: boolean;
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
