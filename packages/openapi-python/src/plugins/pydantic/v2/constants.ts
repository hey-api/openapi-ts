export const identifiers = {
  Annotated: 'Annotated',
  Any: 'Any',
  BaseModel: 'BaseModel',
  ConfigDict: 'ConfigDict',
  Dict: 'Dict',
  Field: 'Field',
  List: 'List',
  Literal: 'Literal',
  Optional: 'Optional',
  Union: 'Union',
  alias: 'alias',
  default: 'default',
  description: 'description',
  ge: 'ge',
  gt: 'gt',
  le: 'le',
  lt: 'lt',
  max_length: 'max_length',
  min_length: 'min_length',
  model_config: 'model_config',
  multiple_of: 'multiple_of',
  pattern: 'pattern',
} as const;

export const typeMappings: Record<string, string> = {
  array: 'list',
  boolean: 'bool',
  integer: 'int',
  null: 'None',
  number: 'float',
  object: 'dict',
  string: 'str',
};

export const pydanticTypes = {
  array: 'list',
  boolean: 'bool',
  integer: 'int',
  null: 'None',
  number: 'float',
  object: 'dict',
  string: 'str',
} as const;
