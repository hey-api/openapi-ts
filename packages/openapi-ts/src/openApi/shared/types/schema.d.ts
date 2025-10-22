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
   * True if current schema is part of an allOf composition. This is used to
   * avoid emitting [key: string]: never for empty objects with
   * additionalProperties: false inside allOf, which would override inherited
   * properties from other schemas in the composition.
   */
  inAllOf?: boolean;
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
