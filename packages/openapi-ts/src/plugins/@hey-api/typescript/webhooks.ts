import type { NodeInfo } from '../../../generate/file/types';
import { tsc } from '../../../tsc';
import { typesId } from './ref';
import type { HeyApiTypeScriptPlugin } from './types';

export const createWebhooks = ({
  nodeInfo,
  plugin,
  webhookNames,
}: {
  nodeInfo: NodeInfo;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  webhookNames: ReadonlyArray<string>;
}) => {
  const file = plugin.context.file({ id: typesId })!;

  if (!webhookNames.length) return;

  const type = tsc.typeUnionNode({
    types: webhookNames.map((name) =>
      tsc.typeReferenceNode({
        typeName: name,
      }),
    ),
  });
  const node = tsc.typeAliasDeclaration({
    exportType: nodeInfo.exported,
    name: nodeInfo.node,
    type,
  });
  file.add(node);
};
