import type { Symbol } from '@hey-api/codegen-core';

import { $ } from '~/ts-dsl';

import type { HeyApiTypeScriptPlugin } from '../types';

export const createWebhooks = ({
  plugin,
  symbolWebhooks,
  webhookNames,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  symbolWebhooks: Symbol;
  webhookNames: ReadonlyArray<string>;
}) => {
  if (!webhookNames.length) return;

  const node = $.type
    .alias(symbolWebhooks.placeholder)
    .export(symbolWebhooks.exported)
    .type($.type.or(...webhookNames));
  plugin.setSymbolValue(symbolWebhooks, node);
};
