export type LinguistLanguages =
  | 'C'
  | 'C#'
  | 'C++'
  | 'CoffeeScript'
  | 'CSS'
  | 'Dart'
  | 'DM'
  | 'Elixir'
  | 'Go'
  | 'Groovy'
  | 'HTML'
  | 'Java'
  | 'JavaScript'
  | 'Kotlin'
  | 'Objective-C'
  | 'Perl'
  | 'PHP'
  | 'PowerShell'
  | 'Python'
  | 'Ruby'
  | 'Rust'
  | 'Scala'
  | 'Shell'
  | 'Swift'
  | 'TypeScript';

export interface CodeSampleObject {
  /**
   * Code sample label, for example `Node` or `Python2.7`.
   *
   * @default `lang` value
   */
  label?: string;
  /**
   * **REQUIRED**. Code sample language. Can be one of the automatically supported languages or any other language identifier of your choice (for custom code samples).
   */
  lang: LinguistLanguages;
  /**
   * **REQUIRED**. Code sample source code, or a `$ref` to the file containing the code sample.
   */
  source: string;
}

export interface EnumExtensions {
  /**
   * `x-enum-descriptions` are {@link https://stackoverflow.com/a/66471626 supported} by OpenAPI Generator.
   */
  'x-enum-descriptions'?: ReadonlyArray<string>;
  /**
   * `x-enum-varnames` are {@link https://stackoverflow.com/a/66471626 supported} by OpenAPI Generator.
   */
  'x-enum-varnames'?: ReadonlyArray<string>;
  /**
   * {@link https://github.com/RicoSuter/NSwag NSwag} generates `x-enumNames` field containing custom enum names.
   */
  'x-enumNames'?: ReadonlyArray<string>;
}
