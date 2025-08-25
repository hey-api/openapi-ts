import ts from 'typescript';

import type { NodeInfo } from '../../../generate/file/types';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { parseUrl } from '../../../utils/url';
import { getClientBaseUrlKey, getClientPlugin } from '../client-core/utils';
import { typesId } from './ref';
import type { HeyApiTypeScriptPlugin } from './types';

const stringType = tsc.keywordTypeNode({ keyword: 'string' });

const serverToBaseUrlType = ({ server }: { server: IR.ServerObject }) => {
  const url = parseUrl(server.url);

  if (url.protocol && url.host) {
    return tsc.literalTypeNode({
      literal: tsc.stringLiteral({ text: server.url }),
    });
  }

  return tsc.templateLiteralType({
    value: [
      url.protocol || stringType,
      '://',
      url.host || stringType,
      url.port ? `:${url.port}` : '',
      url.path || '',
    ],
  });
};

export const createClientOptions = ({
  nodeInfo,
  plugin,
  servers,
}: {
  nodeInfo: NodeInfo;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  servers: ReadonlyArray<IR.ServerObject>;
}) => {
  const file = plugin.context.file({ id: typesId })!;

  const client = getClientPlugin(plugin.context.config);

  const types: Array<ts.TypeNode> = servers.map((server) =>
    serverToBaseUrlType({ server }),
  );

  if (!servers.length) {
    types.push(stringType);
  } else if (
    !('strictBaseUrl' in client.config && client.config.strictBaseUrl)
  ) {
    types.push(
      tsc.typeIntersectionNode({
        types: [stringType, ts.factory.createTypeLiteralNode([])],
      }),
    );
  }

  const type = tsc.typeInterfaceNode({
    properties: [
      {
        name: getClientBaseUrlKey(plugin.context.config),
        type: tsc.typeUnionNode({ types }),
      },
    ],
    useLegacyResolution: false,
  });
  const node = tsc.typeAliasDeclaration({
    exportType: nodeInfo.exported,
    name: nodeInfo.node,
    type,
  });
  file.add(node);
};
