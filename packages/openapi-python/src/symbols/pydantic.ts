import type { SymbolChild } from '@hey-api/codegen-core';
import type { SymbolFactory } from '@hey-api/shared';

export function PYDANTIC(factory: SymbolFactory) {
  const BASE_MODEL_CHILDREN = [
    // v2 model_* API
    {
      kind: 'function',
      name: 'model_computed_fields',
    },
    {
      kind: 'var',
      name: 'model_config',
    },
    {
      kind: 'function',
      name: 'model_construct',
    },
    {
      kind: 'function',
      name: 'model_copy',
    },
    {
      kind: 'function',
      name: 'model_dump_json',
    },
    {
      kind: 'function',
      name: 'model_dump',
    },
    {
      kind: 'var',
      name: 'model_extra',
    },
    {
      kind: 'var',
      name: 'model_fields_set',
    },
    {
      kind: 'function',
      name: 'model_fields',
    },
    {
      kind: 'function',
      name: 'model_json_schema',
    },
    {
      kind: 'function',
      name: 'model_parametrized_name',
    },
    {
      kind: 'function',
      name: 'model_post_init',
    },
    {
      kind: 'function',
      name: 'model_rebuild',
    },
    {
      kind: 'function',
      name: 'model_validate_json',
    },
    {
      kind: 'function',
      name: 'model_validate_strings',
    },
    {
      kind: 'function',
      name: 'model_validate',
    },
    // v1 carryovers still present on BaseModel
    {
      kind: 'function',
      name: 'construct',
    },
    {
      kind: 'function',
      name: 'copy',
    },
    {
      kind: 'function',
      name: 'dict',
    },
    {
      kind: 'function',
      name: 'from_orm',
    },
    {
      kind: 'function',
      name: 'json',
    },
    {
      kind: 'function',
      name: 'parse_file',
    },
    {
      kind: 'function',
      name: 'parse_obj',
    },
    {
      kind: 'function',
      name: 'parse_raw',
    },
    {
      kind: 'function',
      name: 'schema_json',
    },
    {
      kind: 'function',
      name: 'schema',
    },
    {
      kind: 'function',
      name: 'validate',
    },
  ] as const satisfies ReadonlyArray<SymbolChild>;

  return {
    AnyUrl: factory.register('AnyUrl', { external: 'pydantic' }),
    BaseModel: factory.register('BaseModel', {
      children: [...BASE_MODEL_CHILDREN],
      external: 'pydantic',
    }),
    ConfigDict: factory.register('ConfigDict', { external: 'pydantic' }),
    EmailStr: factory.register('EmailStr', { external: 'pydantic' }),
    Field: factory.register('Field', { external: 'pydantic' }),
    RootModel: factory.register('RootModel', {
      children: [...BASE_MODEL_CHILDREN, { kind: 'var', name: 'root' }],
      external: 'pydantic',
    }),
    dataclass: factory.register('dataclass', { external: 'pydantic.dataclasses' }),
  };
}

export type PydanticSymbols = ReturnType<typeof PYDANTIC>;
