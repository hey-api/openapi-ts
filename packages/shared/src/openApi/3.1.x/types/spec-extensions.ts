import type {
  DiscriminatorObject,
  ExternalDocumentationObject,
  XMLObject,
} from './spec';

export interface OpenApiSchemaExtensions {
  /**
   * Adds support for polymorphism. The discriminator is an object name that is used to differentiate between other schemas which may satisfy the payload description. See {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#composition-and-inheritance-polymorphism Composition and Inheritance} for more details.
   */
  discriminator?: DiscriminatorObject;
  /**
   * A free-form property to include an example of an instance for this schema. To represent examples that cannot be naturally represented in JSON or YAML, a string value can be used to contain the example with escaping where necessary.
   *
   * **Deprecated**: The `example` property has been deprecated in favor of the JSON Schema `examples` keyword. Use of `example` is discouraged, and later versions of this specification may remove it.
   */
  example?: unknown;
  /**
   * Additional external documentation for this schema.
   */
  externalDocs?: ExternalDocumentationObject;
  /**
   * This MAY be used only on properties schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property.
   */
  xml?: XMLObject;
}
