import type { IR } from '@hey-api/shared';
import { applyNaming, parseUrl } from '@hey-api/shared';

import { getTypedConfig } from '~/config/utils';
import {
  getClientBaseUrlKey,
  getClientPlugin,
} from '~/plugins/@hey-api/client-core/utils';
import type { TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

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
  nodeIndex,
  plugin,
  servers,
}: {
  nodeIndex: number;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  servers: ReadonlyArray<IR.ServerObject>;
}) => {
  const client = getClientPlugin(getTypedConfig(plugin));

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

  const symbol = plugin.symbol(
    applyNaming('ClientOptions', {
      case: plugin.config.case,
    }),
    {
      meta: {
        category: 'type',
        resource: 'client',
        role: 'options',
        tool: 'typescript',
      },
    },
  );

  const node = $.type
    .alias(symbol)
    .export()
    .type(
      $.type
        .object()
        .prop(getClientBaseUrlKey(getTypedConfig(plugin)), (p) =>
          p.type($.type.or(...types)),
        ),
    );
  plugin.node(node, nodeIndex);
};
