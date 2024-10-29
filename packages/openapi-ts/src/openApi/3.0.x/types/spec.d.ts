/**
 * This is the root object of the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#openapi-description OpenAPI Description}.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.4.md#specification-extensions Specification Extensions}.
 */
export interface OpenApiV3_0_0 {
  /**
   * An element to hold various Objects for the OpenAPI Description.
   */
  components?: ComponentsObject;
  /**
   * **REQUIRED**. This string MUST be the {@link https://semver.org/spec/v2.0.0.html semantic version number} of the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#versions OpenAPI Specification version} that the OpenAPI document uses. The `openapi` field SHOULD be used by tooling specifications and clients to interpret the OpenAPI document. This is _not_ related to the API {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#infoVersion `info.version`} string.
   */
  openapi: '3.0.0' | '3.0.1' | '3.0.2' | '3.0.3' | '3.0.4';
  // TODO
}

// TODO
export interface ComponentsObject {}

// TODO
export interface SchemaObject {}
