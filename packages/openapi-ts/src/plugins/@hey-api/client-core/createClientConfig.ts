import { clientFolderAbsolutePath } from '~/generate/client';
import { $ } from '~/ts-dsl';

import type { PluginHandler } from './types';

export const createClientConfigType = ({
  plugin,
}: Parameters<PluginHandler>[0]) => {
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const symbolClientOptions = plugin.referenceSymbol({
    category: 'type',
    resource: 'client',
    role: 'options',
  });
  const symbolConfig = plugin.registerSymbol({
    external: clientModule,
    kind: 'type',
    name: 'Config',
  });
  const symbolDefaultClientOptions = plugin.registerSymbol({
    external: clientModule,
    kind: 'type',
    name: 'ClientOptions',
  });
  const symbolCreateClientConfig = plugin.registerSymbol({
    name: 'CreateClientConfig',
  });

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
    .generic('T', (g) =>
      g
        .extends(symbolDefaultClientOptions.placeholder)
        .default(symbolClientOptions.placeholder),
    )
    .type(
      $.type
        .func()
        .param('override', (p) =>
          p
            .optional()
            .type(
              $.type(symbolConfig.placeholder).generic(
                $.type.and(symbolDefaultClientOptions.placeholder, 'T'),
              ),
            ),
        )
        .returns(
          $.type(symbolConfig.placeholder).generic(
            $.type.and(
              $.type('Required').generic(
                symbolDefaultClientOptions.placeholder,
              ),
              'T',
            ),
          ),
        ),
    );
  plugin.setSymbolValue(symbolCreateClientConfig, typeCreateClientConfig);
};
