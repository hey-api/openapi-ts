export interface EnumExtensions {
  /**
   * `x-enum-descriptions` are {@link https://stackoverflow.com/a/66471626 supported} by OpenAPI Generator.
   */
  'x-enum-descriptions'?: Array<string>;
  /**
   * `x-enum-varnames` are {@link https://stackoverflow.com/a/66471626 supported} by OpenAPI Generator.
   */
  'x-enum-varnames'?: Array<string>;
  /**
   * {@link https://github.com/RicoSuter/NSwag NSwag} generates `x-enumNames` field containing custom enum names.
   */
  'x-enumNames'?: Array<string>;
}
