import { getBaseUrl } from '@hey-api/shared';

import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import { $ } from '../../../ts-dsl';
import type { PluginHandler } from './types';
import { getClientBaseUrlKey } from './utils';

export const createClient: PluginHandler = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const symbolCreateClient = plugin.symbol('createClient', {
    external: clientModule,
  });
  const symbolCreateConfig = plugin.symbol('createConfig', {
    external: clientModule,
  });
  const symbolClientOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client',
    role: 'options',
  });

  const { runtimeConfigPath } = plugin.config;
  const symbolCreateClientConfig = runtimeConfigPath
    ? plugin.symbol('createClientConfig', {
        external: runtimeConfigPath,
      })
    : undefined;

  const baseUrl = getBaseUrl(plugin.config.baseUrl ?? true, plugin.context.ir);

  const defaultVals = $.object()
    .$if(baseUrl, (o, v) => o.prop(getClientBaseUrlKey(getTypedConfig(plugin)), $.literal(v)))
    .$if('throwOnError' in plugin.config && plugin.config.throwOnError, (o) =>
      o.prop('throwOnError', $.literal(true)),
    );

  const createConfigParameters = [
    $(symbolCreateConfig)
      .call(defaultVals.hasProps() ? defaultVals : undefined)
      .generic(symbolClientOptions),
  ];

  const symbolClient = plugin.symbol('client', {
    meta: {
      category: 'client',
    },
  });
  const statement = $.const(symbolClient)
    .export()
    .assign(
      $(symbolCreateClient).$if(
        symbolCreateClientConfig,
        (c, s) => c.call($(s).call(...createConfigParameters)),
        (c) => c.call(...createConfigParameters),
      ),
    );
  plugin.node(statement);
};
