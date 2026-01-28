export type PluginClientNames =
  | '@hey-api/client-aiohttp'
  | '@hey-api/client-httpx'
  | '@hey-api/client-requests'
  | '@hey-api/client-urllib3';

export type PluginMockNames = 'factory_boy' | 'faker' | 'mimesis';

export type PluginValidatorNames =
  | 'attrs'
  | 'dataclasses'
  | 'marshmallow'
  | 'pydantic';
