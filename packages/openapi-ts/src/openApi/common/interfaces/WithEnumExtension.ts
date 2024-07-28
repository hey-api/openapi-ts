export interface WithEnumExtension {
  'x-enum-descriptions'?: ReadonlyArray<string>;
  'x-enum-varnames'?: ReadonlyArray<string>;
  // NSwag uses x-enumNames for custom enum names
  'x-enumNames'?: ReadonlyArray<string>;
}
