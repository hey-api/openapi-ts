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

/**
 * OpenAPI Specification Extensions.
 *
 * See {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 */
export interface OpenAPIExtensions {
  [extension: `x-${string}`]: unknown;
}
