export interface OpenAPIV2NullableExtensions {
  /**
   * OpenAPI 2.0 does not natively support null as a type, but you can use
   * `x-nullable` to polyfill this functionality.
   */
  'x-nullable'?: boolean;
}
