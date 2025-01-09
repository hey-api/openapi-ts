import type { EnumExtensions } from '../../shared/types/openapi-spec-extensions';

export interface JsonSchemaDraft4 extends EnumExtensions {
  /**
   * A schema can reference another schema using the `$ref` keyword. The value of `$ref` is a URI-reference that is resolved against the schema's {@link https://json-schema.org/understanding-json-schema/structuring#base-uri Base URI}. When evaluating a `$ref`, an implementation uses the resolved identifier to retrieve the referenced schema and applies that schema to the {@link https://json-schema.org/learn/glossary#instance instance}.
   *
   * The `$ref` keyword may be used to create recursive schemas that refer to themselves.
   */
  $ref?: string;
  /**
   * The `default` keyword specifies a default value. This value is not used to fill in missing values during the validation process. Non-validation tools such as documentation generators or form generators may use this value to give hints to users about how to use a value. However, `default` is typically used to express that if a value is missing, then the value is semantically the same as if the value was present with the default value. The value of `default` should validate against the schema in which it resides, but that isn't required.
   */
  default?: unknown;
  /**
   * The `title` and `description` keywords must be strings. A "title" will preferably be short, whereas a "description" will provide a more lengthy explanation about the purpose of the data described by the schema.
   */
  description?: string;
  /**
   * The `enum` {@link https://json-schema.org/learn/glossary#keyword keyword} is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.
   *
   * You can use `enum` even without a type, to accept values of different types.
   */
  enum?: ReadonlyArray<unknown>;
  /**
   * Ranges of numbers are specified using a combination of the `minimum` and `maximum` keywords, (or `exclusiveMinimum` and `exclusiveMaximum` for expressing exclusive range).
   *
   * If _x_ is the value being validated, the following must hold true:
   *
   * ```
   * x ≥ minimum
   * x > exclusiveMinimum
   * x ≤ maximum
   * x < exclusiveMaximum
   * ```
   *
   * While you can specify both of `minimum` and `exclusiveMinimum` or both of `maximum` and `exclusiveMaximum`, it doesn't really make sense to do so.
   */
  exclusiveMaximum?: boolean;
  /**
   * Ranges of numbers are specified using a combination of the `minimum` and `maximum` keywords, (or `exclusiveMinimum` and `exclusiveMaximum` for expressing exclusive range).
   *
   * If _x_ is the value being validated, the following must hold true:
   *
   * ```
   * x ≥ minimum
   * x > exclusiveMinimum
   * x ≤ maximum
   * x < exclusiveMaximum
   * ```
   *
   * While you can specify both of `minimum` and `exclusiveMinimum` or both of `maximum` and `exclusiveMaximum`, it doesn't really make sense to do so.
   */
  exclusiveMinimum?: boolean;
  /**
   * The `format` keyword allows for basic semantic identification of certain kinds of string values that are commonly used. For example, because JSON doesn't have a "DateTime" type, dates need to be encoded as strings. `format` allows the schema author to indicate that the string value should be interpreted as a date. By default, `format` is just an annotation and does not effect validation.
   *
   * Optionally, validator {@link https://json-schema.org/learn/glossary#implementation implementations} can provide a configuration option to enable `format` to function as an assertion rather than just an annotation. That means that validation will fail if, for example, a value with a `date` format isn't in a form that can be parsed as a date. This can allow values to be constrained beyond what the other tools in JSON Schema, including {@link https://json-schema.org/understanding-json-schema/reference/regular_expressions Regular Expressions} can do.
   *
   * There is a bias toward networking-related formats in the JSON Schema specification, most likely due to its heritage in web technologies. However, custom formats may also be used, as long as the parties exchanging the JSON documents also exchange information about the custom format types. A JSON Schema validator will ignore any format type that it does not understand.
   */
  format?: JsonSchemaFormats;
  /**
   * The length of the array can be specified using the `minItems` and `maxItems` keywords. The value of each keyword must be a non-negative number. These keywords work whether doing {@link https://json-schema.org/understanding-json-schema/reference/array#items list validation} or {@link https://json-schema.org/understanding-json-schema/reference/array#tupleValidation tuple-validation}.
   */
  maxItems?: number;
  /**
   * The length of a string can be constrained using the `minLength` and `maxLength` {@link https://json-schema.org/learn/glossary#keyword keywords}. For both keywords, the value must be a non-negative number.
   */
  maxLength?: number;
  /**
   * The number of properties on an object can be restricted using the `minProperties` and `maxProperties` keywords. Each of these must be a non-negative integer.
   */
  maxProperties?: number;
  /**
   * Ranges of numbers are specified using a combination of the `minimum` and `maximum` keywords, (or `exclusiveMinimum` and `exclusiveMaximum` for expressing exclusive range).
   *
   * If _x_ is the value being validated, the following must hold true:
   *
   * ```
   * x ≥ minimum
   * x > exclusiveMinimum
   * x ≤ maximum
   * x < exclusiveMaximum
   * ```
   *
   * While you can specify both of `minimum` and `exclusiveMinimum` or both of `maximum` and `exclusiveMaximum`, it doesn't really make sense to do so.
   */
  maximum?: number;
  /**
   * The length of the array can be specified using the `minItems` and `maxItems` keywords. The value of each keyword must be a non-negative number. These keywords work whether doing {@link https://json-schema.org/understanding-json-schema/reference/array#items list validation} or {@link https://json-schema.org/understanding-json-schema/reference/array#tupleValidation tuple-validation}.
   */
  minItems?: number;
  /**
   * The length of a string can be constrained using the `minLength` and `maxLength` {@link https://json-schema.org/learn/glossary#keyword keywords}. For both keywords, the value must be a non-negative number.
   */
  minLength?: number;
  /**
   * The number of properties on an object can be restricted using the `minProperties` and `maxProperties` keywords. Each of these must be a non-negative integer.
   */
  minProperties?: number;
  /**
   * Ranges of numbers are specified using a combination of the `minimum` and `maximum` keywords, (or `exclusiveMinimum` and `exclusiveMaximum` for expressing exclusive range).
   *
   * If _x_ is the value being validated, the following must hold true:
   *
   * ```
   * x ≥ minimum
   * x > exclusiveMinimum
   * x ≤ maximum
   * x < exclusiveMaximum
   * ```
   *
   * While you can specify both of `minimum` and `exclusiveMinimum` or both of `maximum` and `exclusiveMaximum`, it doesn't really make sense to do so.
   */
  minimum?: number;
  /**
   * Numbers can be restricted to a multiple of a given number, using the `multipleOf` keyword. It may be set to any positive number. The multiple can be a floating point number.
   */
  multipleOf?: number;
  /**
   * The `pattern` keyword is used to restrict a string to a particular regular expression. The regular expression syntax is the one defined in JavaScript ({@link https://www.ecma-international.org/publications-and-standards/standards/ecma-262/ ECMA 262} specifically) with Unicode support. See {@link https://json-schema.org/understanding-json-schema/reference/regular_expressions Regular Expressions} for more information.
   */
  pattern?: string;
  /**
   * By default, the properties defined by the `properties` keyword are not required. However, one can provide a list of required properties using the `required` keyword.
   *
   * The `required` keyword takes an array of zero or more strings. Each of these strings must be unique.
   */
  required?: ReadonlyArray<string>;
  /**
   * The `title` and `description` keywords must be strings. A "title" will preferably be short, whereas a "description" will provide a more lengthy explanation about the purpose of the data described by the schema.
   */
  title?: string;
  /**
   * Primitive data types in the Swagger Specification are based on the types supported by the {@link https://tools.ietf.org/html/draft-zyp-json-schema-04#section-3.5 JSON-Schema Draft 4}. Models are described using the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#schema-object Schema Object} which is a subset of JSON Schema Draft 4.
   */
  type?: JsonSchemaTypes;
  /**
   * A schema can ensure that each of the items in an array is unique. Simply set the `uniqueItems` keyword to `true`.
   */
  uniqueItems?: boolean;
}

type JsonSchemaFormats =
  | 'date-time'
  | 'email'
  | 'hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uri'
  | (string & {});

type JsonSchemaTypes =
  | 'array'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'object'
  | 'string';
