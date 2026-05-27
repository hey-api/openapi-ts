import type { PluginInstance } from '@hey-api/shared';

export function PYDANTIC(plugin: PluginInstance) {
  return {
    BaseModel: plugin.symbol('BaseModel', { external: 'pydantic' }),
    ConfigDict: plugin.symbol('ConfigDict', { external: 'pydantic' }),
    Field: plugin.symbol('Field', { external: 'pydantic' }),
    dataclass: plugin.symbol('dataclass', { external: 'pydantic.dataclasses' }),
  };
}
