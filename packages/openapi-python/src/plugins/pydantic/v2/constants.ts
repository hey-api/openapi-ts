export const identifiers = {
  model_config: 'model_config',
};

export interface FieldConstraints {
  /** Alias for the field name in serialization. */
  alias?: string;
  /** Default value for the field. */
  default?: unknown;
  /** Default factory function (for mutable defaults). */
  default_factory?: string;
  /** Description of the field. */
  description?: string;
  /** Greater than or equal constraint for numbers. */
  ge?: number;
  /** Greater than constraint for numbers. */
  gt?: number;
  /** Less than or equal constraint for numbers. */
  le?: number;
  /** Less than constraint for numbers. */
  lt?: number;
  /** Maximum length constraint for strings/arrays. */
  max_length?: number;
  /** Minimum length constraint for strings/arrays. */
  min_length?: number;
  /** Multiple of constraint for numbers. */
  multiple_of?: number;
  /** Regex pattern constraint for strings. */
  pattern?: string;
  /** Title for the field. */
  title?: string;
}
