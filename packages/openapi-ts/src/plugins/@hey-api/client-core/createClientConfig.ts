import { getTypedConfig } from '../../../config/utils';
import { clientFolderAbsolutePath } from '../../../generate/client';
import { $ } from '../../../ts-dsl';
import type { PluginHandler } from './types';

export const createClientConfigType = ({ plugin }: Parameters<PluginHandler>[0]) => {
  const clientModule = clientFolderAbsolutePath(getTypedConfig(plugin));
  const symbolClientOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client',
    role: 'options',
  });
  const symbolConfig = plugin.symbol('Config', {
    external: clientModule,
    kind: 'type',
  });
  const symbolDefaultClientOptions = plugin.symbol('ClientOptions', {
    external: clientModule,
    kind: 'type',
  });
  const symbolCreateClientConfig = plugin.symbol('CreateClientConfig');

  const typeCreateClientConfig = $.type
    .alias(symbolCreateClientConfig)
    .export()
    .doc([
      'The `createClientConfig()` function will be called on client initialization',
      "and the returned object will become the client's initial configuration.",
      '',
      'You may want to initialize your client this way instead of calling',
      "`setConfig()`. This is useful for example if you're using Next.js",
      'to ensure your client always has the correct values.',
    ])
    .generic('T', (g) => g.extends(symbolDefaultClientOptions).default(symbolClientOptions))
    .type(
      $.type
        .func()
        .param('override', (p) =>
          p
            .optional()
            .type($.type(symbolConfig).generic($.type.and(symbolDefaultClientOptions, 'T'))),
        )
        .returns(
          $.type(symbolConfig).generic(
            $.type.and($.type('Required').generic(symbolDefaultClientOptions), 'T'),
          ),
        ),
    );
  plugin.node(typeCreateClientConfig);
};
