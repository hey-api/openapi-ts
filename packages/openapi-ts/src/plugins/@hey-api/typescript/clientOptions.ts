import ts from 'typescript';

import { compiler } from '../../../compiler';
import type { NodeInfo } from '../../../generate/file/types';
import type { IR } from '../../../ir/types';
import { parseUrl } from '../../../utils/url';
import { getClientBaseUrlKey, getClientPlugin } from '../client-core/utils';
import { typesId } from './ref';
import type { HeyApiTypeScriptPlugin } from './types';

const stringType = compiler.keywordTypeNode({ keyword: 'string' });

const serverToBaseUrlType = ({ server }: { server: IR.ServerObject }) => {
  const url = parseUrl(server.url);

  if (url.protocol && url.host) {
    return compiler.literalTypeNode({
      literal: compiler.stringLiteral({ text: server.url }),
    });
  }

  return compiler.templateLiteralType({
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
      compiler.typeIntersectionNode({
        types: [stringType, ts.factory.createTypeLiteralNode([])],
      }),
    );
  }

  const type = compiler.typeInterfaceNode({
    properties: [
      {
        name: getClientBaseUrlKey(plugin.context.config),
        type: compiler.typeUnionNode({ types }),
      },
    ],
    useLegacyResolution: false,
  });
  const node = compiler.typeAliasDeclaration({
    exportType: nodeInfo.exported,
    name: nodeInfo.node,
    type,
  });
  file.add(node);
};
