import type { ICodegenSymbolOut } from '@hey-api/codegen-core';

import { tsc } from '../../../tsc';

export const createWebhooks = ({
  symbolWebhooks,
  webhookNames,
}: {
  symbolWebhooks: ICodegenSymbolOut;
  webhookNames: ReadonlyArray<string>;
}) => {
  if (!webhookNames.length) return;

  const type = tsc.typeUnionNode({
    types: webhookNames.map((name) =>
      tsc.typeReferenceNode({ typeName: name }),
    ),
  });
  const node = tsc.typeAliasDeclaration({
    exportType: true,
    name: symbolWebhooks.placeholder,
    type,
  });
  symbolWebhooks.update({ value: node });
};
