export interface WithEnumExtension {
  // NSwag uses x-enumNames for custom enum names
  'x-enumNames'?: ReadonlyArray<string>;
  'x-enum-descriptions'?: ReadonlyArray<string>;
  'x-enum-varnames'?: ReadonlyArray<string>;
}
