import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import {
  getClientBaseUrlKey,
  getClientPlugin,
} from '~/plugins/@hey-api/client-core/utils';
import type { TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';
import { parseUrl } from '~/utils/url';

import type { HeyApiTypeScriptPlugin } from '../types';

const serverToBaseUrlType = ({ server }: { server: IR.ServerObject }) => {
  const url = parseUrl(server.url);

  if (url.protocol && url.host) {
    return $.type.literal(server.url);
  }

  return $.type
    .template()
    .add(url.protocol || $.type('string'))
    .add('://')
    .add(url.host || $.type('string'))
    .add(url.port ? `:${url.port}` : '')
    .add(url.path || '');
};

export const createClientOptions = ({
  plugin,
  servers,
  symbolClientOptions,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  servers: ReadonlyArray<IR.ServerObject>;
  symbolClientOptions: Symbol;
}) => {
  const client = getClientPlugin(plugin.context.config);

  const types: Array<TypeTsDsl> = servers.map((server) =>
    serverToBaseUrlType({ server }),
  );

  if (!servers.length) {
    types.push($.type('string'));
  } else if (
    !('strictBaseUrl' in client.config && client.config.strictBaseUrl)
  ) {
    types.push($.type.and($.type('string'), $.type.object()));
  }

  const node = $.type
    .alias(symbolClientOptions)
    .export()
    .type(
      $.type
        .object()
        .prop(getClientBaseUrlKey(plugin.context.config), (p) =>
          p.type($.type.or(...types)),
        ),
    );
  plugin.setSymbolValue(symbolClientOptions, node);
};
