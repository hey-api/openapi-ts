import type { Symbol } from '@hey-api/codegen-core';

import { tsc } from '~/tsc';

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

  const type = tsc.typeUnionNode({
    types: webhookNames.map((name) =>
      tsc.typeReferenceNode({ typeName: name }),
    ),
  });
  const node = tsc.typeAliasDeclaration({
    exportType: symbolWebhooks.exported,
    name: symbolWebhooks.placeholder,
    type,
  });
  plugin.setSymbolValue(symbolWebhooks, node);
};
