import { getTypedConfig } from '../../../../config/utils';
import { getClientPlugin } from '../../../../plugins/@hey-api/client-core/utils';
import { $ } from '../../../../ts-dsl';
import type { PluginInstance } from '../types';

export const sdkCallOptions = ({
  options,
  plugin,
}: {
  options: ReturnType<typeof $.object>;
  plugin: PluginInstance;
}): ReturnType<typeof $.object> => {
  const client = getClientPlugin(getTypedConfig(plugin));

  return options
    .prop('throwOnError', $.literal(true))
    .$if(
      client.name === '@hey-api/client-fetch' && client.config.throwOnErrorStyle === 'wrapper',
      (o) => o.prop('throwOnErrorStyle', $.literal('wrapper')),
    );
};
